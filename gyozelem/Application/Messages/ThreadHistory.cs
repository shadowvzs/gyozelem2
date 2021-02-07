using Application.Interfaces;
using Application.Errors;
using Domain;
using Persistence;

using MediatR;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

using System;
using System.Net;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Application.Messages
{
    public class ThreadHistory
    {
        public class Query : IRequest<MessageThread>
        {
            public string TargetIds { get; set; }
        }

        public class Handler : IRequestHandler<Query, MessageThread>
        {

            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _context = context;
                _mapper = mapper;
                _userAccessor = userAccessor;                
            }

            public async Task<MessageThread> Handle(Query request, CancellationToken cancellationToken)
            {

                var user = await _context.Users.SingleOrDefaultAsync(x => 
                    x.UserName == _userAccessor.GetCurrentUsername());

                if (user == null)
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                // check if current user is in targets or no, if no then we add it
                var targetIds = request.TargetIds.Split(',').Select(x => Guid.Parse(x)).ToList();
                if (!targetIds.Any(id => id.ToString().ToUpper() == user.Id.ToString().ToUpper()))
                {
                    targetIds.Add(Guid.Parse(user.Id));
                }

                if (targetIds.Count < 1) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { Message = "No targets" });
                }
                
                // check if exist a thread with those ids
                MessageThread thread = null;
                string idList = "'" + string.Join( "','", targetIds.Select(x => x.ToString().ToUpper()).ToArray()) + "'";
                string sql = $@"
                    SELECT m.* FROM MessageThreads as m
                    INNER JOIN (
                        SELECT t1.MessageThreadId, t1.threadCount FROM
                        (
                            SELECT MessageThreadId, count(MessageThreadId) as threadCount 
                            FROM MessageThreadUsers 
                            GROUP BY MessageThreadId
                            HAVING threadCount={targetIds.Count}
                        ) as t1
                        INNER JOIN (
                            SELECT MessageThreadId, count(MessageThreadId) as threadCount     
                            FROM MessageThreadUsers 
                            WHERE UserId in ({idList}) 
                            GROUP BY MessageThreadId 
                            HAVING threadCount={targetIds.Count}
                        ) as t2 ON t1.MessageThreadId=t2.MessageThreadId
                    ) as t ON m.Id=t.MessageThreadId
                    ORDER BY m.UpdatedAt DESC
                ";

                var recentThread = await _context.MessageThreads
                    .FromSqlRaw(sql)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (recentThread == null)
                {
                    Console.WriteLine("not found");
                    throw new RestException(HttpStatusCode.NotFound, new { MessageThread = "Thread not found" } );
                }
                Console.WriteLine("Thread found", recentThread.Id);
                return await _context.MessageThreads.FindAsync(recentThread.Id);
            }
        }
    }
}
