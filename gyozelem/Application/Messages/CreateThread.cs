using Application.Interfaces;
using Persistence;
using Application.Errors;
using Application.Validators;

using MediatR;
using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using System;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Globalization;

namespace Application.Messages
{

public class CreateThread
{
    public class Command : IRequest<MessageThread>
        {
            public List<Guid> TargetIds { get; set; }
        }

        public class Handler : IRequestHandler<Command, MessageThread>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<MessageThread> Handle(Command request, CancellationToken cancellationToken)
            {

                var user = await _context.Users.SingleOrDefaultAsync(x => 
                    x.UserName == _userAccessor.GetCurrentUsername());

                if (user == null || (user.Rank != AppUserRank.Editor && user.Rank != AppUserRank.Admin))
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                // check if current user is in targets or no, if no then we add it
                var targetIds = request.TargetIds;
                if (!request.TargetIds.Any(id => id.ToString() == user.Id.ToString()))
                {
                    targetIds.Add(Guid.Parse(user.Id));
                }

                if (targetIds.Count == 1) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { Message = "No targets" });
                }

                /*
                    SELECT t1.thread_id, t1.threadCount FROM
                    (
                        SELECT thread_id, count(thread_id) as threadCount 
                        FROM `threads` 
                        GROUP BY thread_id
                        HAVING threadCount=3
                    ) as t1
                    INNER JOIN (
                    SELECT thread_id, count(thread_id) as threadCount     
                    FROM `threads` 
                    WHERE user_id in (1,2,3) 
                    GROUP BY thread_id 
                    HAVING threadCount=3
                    ) as t2 ON t1.thread_id=t2.thread_id
                */

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

                if (recentThread != null)
                {
                    return await _context.MessageThreads.FindAsync(recentThread.Id);
                }

                thread = new MessageThread() {
                    Id = Guid.NewGuid(),
                    Messages = new List<Message>(),
                    Users = new List<MessageThreadUser>(),
                    CreatedAt = DateTime.Now,
                    CreatedBy = Guid.Parse(user.Id),
                    UpdatedAt = null,
                    UpdatedBy = null
                };

                request.TargetIds.ForEach(delegate(Guid id)
                {  
                    thread.Users.Add(new MessageThreadUser() {
                        UserId = id,
                        CreatedAt = DateTime.Now,
                        CreatedBy = Guid.Parse(user.Id),
                        UpdatedAt = null,
                        UpdatedBy = null
                    });                
                });
                _context.MessageThreads.Add(thread);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { Message = "Problem saving changes" });
                }
            
                return thread;
            }
        }
    }
}
