using Domain;
using Persistence;
using Application.Errors;
using Application.Validators;
using Application.Interfaces;

using MediatR;
using Microsoft.EntityFrameworkCore;

using System;
using System.Net;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Application.Messages
{
    public class DeleteMessage
    {
        public class Command : IRequest
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command>
        {

            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
               
                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());
                if (user == null || (user.Rank != AppUserRank.Editor && user.Rank != AppUserRank.Admin))
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var guest = await _context.Guests.FindAsync(request.Id);

                if (guest == null)
                    throw new RestException(HttpStatusCode.NotFound, new { Guest = "Could not find activity" } );

                _context.Remove(guest);

                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Unit.Value;

                throw new RestException(HttpStatusCode.NotFound, new { Guest = "Problem saving changes" });                
            }
        }

    }
}