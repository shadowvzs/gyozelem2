using MediatR;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Application.Errors;

using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace Application.FSObjects
{
    public class Delete
    {
        public class Command : IRequest
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                var fs = await _context.FSObjects.FindAsync(request.Id);
                if (fs == null) {
                    throw new RestException(HttpStatusCode.NotFound, new { FSObject = "Could not find activity" } );
                }
            
                // _context.Remove(fs);
                
                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Unit.Value;

                throw new RestException(HttpStatusCode.NotFound, new { FSObject = "Problem saving changes" });
            }
        }
    }
}