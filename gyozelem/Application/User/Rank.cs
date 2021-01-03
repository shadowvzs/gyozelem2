using Application.Interfaces;
using MediatR;
using Domain;
using Persistence;
using FluentValidation;
using Application.Errors;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using System;
using System.Net;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.User
{
    public class Rank
    {
        public class Command : IRequest<Unit>
        {
            public string Id   { get; set; }
            public AppUserRank Rank   { get; set; }
        }

        public class Handler : IRequestHandler<Command, Unit>
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
                var user = await _context.Users.SingleOrDefaultAsync(x => 
                    x.UserName == _userAccessor.GetCurrentUsername());

                if (user == null || user.Rank != AppUserRank.Admin) {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var targetUser = await _context.Users.SingleOrDefaultAsync(x => x.Id == request.Id);

                if (targetUser == null) {
                    throw new RestException(HttpStatusCode.NotFound);
                }

                targetUser.Rank = request.Rank;

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { AppUser = "Problem saving changes" });
                }

               return Unit.Value;
            }
        }
    }
}
