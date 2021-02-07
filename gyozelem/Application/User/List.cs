using Domain;
using Persistence;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using AutoMapper;
using Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace Application.User
{
    public class List
    {
        public class UsersEnvelope
        {
            public List<User> Items { get; set; }
            public int ItemCount { get; set; }
        }
        public class Query : IRequest<UsersEnvelope>
        {
        }

        public class Handler : IRequestHandler<Query, UsersEnvelope>
        {

            private readonly DataContext _context;
            private readonly UserManager<AppUser> _userManager;
            private readonly IMapper _mapper;

            public Handler(DataContext context, UserManager<AppUser> userManager, IMapper mapper)
            {
                _context = context;
                _userManager = userManager;                
                _mapper = mapper;
            }

            public async Task<UsersEnvelope> Handle(Query request, CancellationToken cancellationToken)
            {
            
                var items = _userManager.Users.ToList();
                var mappedUsers = items.Select( x => new User() 
                {
                    Id          = x.Id,
                    DisplayName = x.DisplayName,
                    Username    = x.UserName,
                    Rank        = x.Rank
                }).ToList();

                return new UsersEnvelope
                {
                    Items = mappedUsers,
                    ItemCount = items.Count()
                };
            }
        }
    }
}