using MediatR;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using Application.Errors;
using Application.Interfaces;

using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Application.Messages
{
    public class EditMessage
    {
        public class Command : IRequest<Message>
        {
            public Guid Id { get; set; }
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

                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());
                if (user == null)
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var message = await _context.Messages.FindAsync(request.Id);

                if (message == null || message.Id.ToString() == user.Id.ToString()) {
                    throw new RestException(HttpStatusCode.NotFound, new { Message = "Not found" });
                }

                message.Content   = request.Content;
                message.UpdatedAt = DateTime.Now;
                message.UpdatedBy = Guid.Parse(user.Id);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { Message = "Problem saving changes" });
                }
                
                return message;
            }
        }
    }
}