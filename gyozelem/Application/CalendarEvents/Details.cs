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

namespace Application.CalendarEvents
{
    public class Details
    {
        public class Query : IRequest<CalendarEvent>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, CalendarEvent>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<CalendarEvent> Handle(Query request, CancellationToken cancellationToken)
            {
                var item = await _context.CalendarEvents.FindAsync(request.Id);

                if (item == null)
                    throw new RestException(HttpStatusCode.NotFound, new { CalendarEvent = "Could not find activity" } );

                return item;
            }
        }
    }
}