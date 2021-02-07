using Application.Interfaces;
using Application.Errors;
using Domain;
using Persistence;

using MediatR;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

using System;
using System.Net;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Application.Messages
{
    public class ListThreads
    {

        public class MessageThreadEnvelope
        {
            public List<MessageThread> Items { get; set; }
            public int ItemCount { get; set; }
        }
        public class Query : IRequest<MessageThreadEnvelope>
        {
        }

        public class Handler : IRequestHandler<Query, MessageThreadEnvelope>
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

            public async Task<MessageThreadEnvelope> Handle(Query request, CancellationToken cancellationToken)
            {
                // var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());
                // if (user == null)
                // {
                //     throw new RestException(HttpStatusCode.Unauthorized);
                // }

                var queryable = _context.MessageThreads
                    .OrderBy(x => x.CreatedAt)
                    .AsQueryable();
                    // .Where(x => x.SenderId.ToString() == user.Id || x.TargetId.ToString() == user.Id)

                var items = await queryable.ToListAsync();

                return new MessageThreadEnvelope
                {
                    Items = items,
                    ItemCount = queryable.Count()
                };
            }
        }
    }
}
