using Domain;
using Persistence;

using MediatR;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace Application.CalendarEvents
{
    public class List
    {
        public class CalendarEventsEnvelope
        {
            public List<CalendarEvent> Items { get; set; }
            public int ItemCount { get; set; }
        }
        public class Query : IRequest<CalendarEventsEnvelope>
        {
        }

        public class Handler : IRequestHandler<Query, CalendarEventsEnvelope>
        {

            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _context = context;
                _mapper = mapper;
                _userAccessor = userAccessor;                
            }

            public async Task<CalendarEventsEnvelope> Handle(Query request, CancellationToken cancellationToken)
            {
            
                var items = await _context.CalendarEvents
                    // .Where(x => x.Date >= request.StartDate)
                    .OrderBy(x => x.CreatedAt)
                    .ToListAsync();

                return new CalendarEventsEnvelope
                {
                    Items = items,
                    ItemCount = items.Count()
                };
            }
        }
    }
}