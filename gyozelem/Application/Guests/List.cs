using Application.Interfaces;
using MediatR;
using Domain;
using AutoMapper;
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
using System.Collections.Generic;

namespace Application.Guests
{
    public class List
    {

        public class GuestsEnvelope
        {
            public List<Guest> Items { get; set; }
            public int ItemCount { get; set; }
        }
        public class Query : IRequest<GuestsEnvelope>
        {
        }

        public class Handler : IRequestHandler<Query, GuestsEnvelope>
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

            public async Task<GuestsEnvelope> Handle(Query request, CancellationToken cancellationToken)
            {
                var queryable = _context.Guests
                    .OrderBy(x => x.CreatedAt)
                    .AsQueryable();

                var items = await queryable.ToListAsync();

                return new GuestsEnvelope
                {
                    Items = items,
                    ItemCount = queryable.Count()
                };
            }
        }
    }
}
