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

namespace Application.FSObjects
{
    public class BulkUpdate
    {
        public class Command : IRequest
        {
            public List<FSObject> Items { get; set; }
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
                foreach (FSObject item in request.Items)
                {
                    _context.Update(item);
                }

                if (await _context.SaveChangesAsync() == 0) {
                   throw new RestException(HttpStatusCode.InternalServerError, new { FSObject = "Problem saving changes" });
                }
                
                return Unit.Value;
            }
        }
    }
}
