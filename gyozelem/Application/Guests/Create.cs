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

namespace Application.Guests
{

public class Create
{
    public class Command : IRequest<Guest>
        {
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

                var user = await _context.Users.SingleOrDefaultAsync(x => 
                    x.UserName == _userAccessor.GetCurrentUsername());

                if (user == null || (user.Rank != AppUserRank.Editor && user.Rank != AppUserRank.Admin))
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }
                
                var guest = new Guest
                {
                    Id = Guid.NewGuid(),
                    FullName = request.FullName,
                    CreatedAt = DateTime.Now,
                    CreatedBy = Guid.Parse(user.Id),
                    UpdatedAt = null,
                    UpdatedBy = null
                };

                _context.Guests.Add(guest);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { Guest = "Problem saving changes" });
                }

                return guest;
            }
        }
    }
}
