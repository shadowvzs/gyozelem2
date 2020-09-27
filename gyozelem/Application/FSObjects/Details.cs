using MediatR;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Application.Errors;
using AutoMapper;

using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace Application.FSObjects
{
    public class Details
    {
        public class Query : IRequest<FSObject>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, FSObject>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<FSObject> Handle(Query request, CancellationToken cancellationToken)
            {
                var item = await _context.FSObjects.FindAsync(request.Id);

                if (item == null)
                    throw new RestException(HttpStatusCode.NotFound, new { FSObject = "Could not find activity" } );

                return item;
            }
        }
    }
}