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

namespace Application.Guests
{
    public class Edit
    {
        public class Command : IRequest<Guest>
        {
            public Guid Id { get; set; }
            public string FullName { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.FullName).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Command, Guest>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<Guest> Handle(Command request, CancellationToken cancellationToken)
            {

                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());
                if (user == null || (user.Rank != AppUserRank.Editor && user.Rank != AppUserRank.Admin))
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var guest = await _context.Guests.FindAsync(request.Id);

                if (guest == null) {
                    throw new RestException(HttpStatusCode.NotFound, new { Guest = "Not found" });
                }

                guest.FullName = request.FullName;
                guest.UpdatedAt = DateTime.Now;
                guest.UpdatedBy = Guid.Parse(user.Id);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { FSObject = "Problem saving changes" });
                }
                
                return guest;
            }
        }
    }
}