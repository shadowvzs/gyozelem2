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

namespace Application.Messages
{

public class AddUser
{
    public class Command : IRequest<List<MessageThreadUser>>
        {
            public Guid ThreadId { get; set; }
            public List<Guid> TargetIds { get; set; }
        }

        public class Handler : IRequestHandler<Command, List<MessageThreadUser>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<List<MessageThreadUser>> Handle(Command request, CancellationToken cancellationToken)
            {

                var user = await _context.Users.SingleOrDefaultAsync(x => 
                    x.UserName == _userAccessor.GetCurrentUsername());

                if (user == null || (user.Rank != AppUserRank.Editor && user.Rank != AppUserRank.Admin))
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var targetIds = request.TargetIds.FindAll(id => id.ToString() != user.Id.ToString());

                if (targetIds.Count == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { Message = "No targets" });
                }

                var thread = await _context.MessageThreads.FindAsync(request.ThreadId);                
                if (thread == null) {
                    throw new RestException(HttpStatusCode.NotFound, new { MessageThreadUser = "Not found" });
                }

                var newMessageUsers = new List<MessageThreadUser>();
                thread.Users.ForEach(delegate(MessageThreadUser mu)
                {
                    if (!request.TargetIds.Any(id => id == mu.Id))
                    {
                        thread.Users.Add(new MessageThreadUser() {
                            UserId = mu.UserId,
                            CreatedAt = DateTime.Now,
                            CreatedBy = Guid.Parse(user.Id),
                            UpdatedAt = null,
                            UpdatedBy = null
                        });
                    }
                });

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { MessageThreadUser = "Problem saving changes" });
                }

                return thread.Users;
            }
        }
    }
}
