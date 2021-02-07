using Domain;
using Persistence;
using Application.Interfaces;

using MediatR;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace Application.FSObjects
{
    public class List
    {
        public class FSObjectsEnvelope
        {
            public List<FSObject> Items { get; set; }
            public int ItemCount { get; set; }
        }
        public class Query : IRequest<FSObjectsEnvelope>
        {
            public Query(
                Guid? parentId,
                int? limit, 
                int? offset, 
                FSType? type, 
                FSStatus? status, 
                int? flag, 
                string sortKey, 
                string sortDirection
            ) {
                ParentId = parentId;
                Limit = limit;
                Offset = offset;
                Type = type;
                Status = status;
                Flag = flag;
                SortKey = sortKey;
                SortDirection = sortDirection;
            }

            public Guid? ParentId { get; set; }
            public int? Limit { get; set; }
            public int? Offset { get; set; }
            public FSType? Type { get; set; }
            public FSStatus? Status { get; set; }
            public int? Flag { get; set; }
            public string SortKey { get; set; }
            public string SortDirection { get; set; }
        }

        public class Handler : IRequestHandler<Query, FSObjectsEnvelope>
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

            public async Task<FSObjectsEnvelope> Handle(Query request, CancellationToken cancellationToken)
            {
                var queryable = _context.FSObjects
                    // .Where(x => x.Date >= request.StartDate)
                    .OrderBy(x => x.CreatedAt)
                    .AsQueryable();

                if (request.ParentId.HasValue) {
                    queryable = queryable.Where(x => x.ParentId == request.ParentId.Value);
                }

                if (request.Type.HasValue) {
                    queryable = queryable.Where(x => x.Type == request.Type.Value);
                }

                if (request.Status.HasValue) {
                    queryable = queryable.Where(x => x.Status == request.Status.Value);
                }

                if (request.Flag.HasValue) {
                    queryable = queryable.Where(x => x.Flag == request.Flag.Value);
                }

                if (request.Limit.HasValue && request.Offset.HasValue) {
                    queryable = queryable
                        .Skip(request.Offset ?? 0)
                        .Take(request.Limit ?? 3);
                }

                var items = await queryable.ToListAsync();

                return new FSObjectsEnvelope
                {
                    Items = items,
                    ItemCount = queryable.Count()
                };
            }
        }
    }
}