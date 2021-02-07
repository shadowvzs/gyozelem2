using Application.Interfaces;
using Persistence;
using Application.Errors;
using Application.Validators;

using MediatR;
using Domain;
using FluentValidation;
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

public class CreateMessage
{
    public class Command : IRequest<Message>
        {
            public Guid MessageThreadId { get; set; }
            public string Content { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Content).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Command, Message>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<Message> Handle(Command request, CancellationToken cancellationToken)
            {

                var user = await _context.Users.SingleOrDefaultAsync(x => 
                    x.UserName == _userAccessor.GetCurrentUsername());

                if (user == null)
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var thread = await _context.MessageThreads.FindAsync(request.MessageThreadId);
                var msg = new Message() {
                    Id = Guid.NewGuid(),
                    Content = request.Content,
                    MessageThreadId = thread.Id,
                    CreatedAt = DateTime.Now,
                    CreatedBy = Guid.Parse(user.Id),
                    UpdatedAt = null,
                    UpdatedBy = null
                };

                _context.Messages.Add(msg);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { Message = "Problem saving changes" });
                }

                return msg;
            }
        }
    }
}
