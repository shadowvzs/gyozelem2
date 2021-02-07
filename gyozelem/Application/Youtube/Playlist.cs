// using Application.Interfaces;
// using MediatR;
// using Domain;
// using AutoMapper;
// using Persistence;
// using FluentValidation;
// using Application.Errors;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.EntityFrameworkCore;

// using System;
// using System.Net;
// using System.Linq;
// using System.Threading;
// using System.Threading.Tasks;
// using System.Collections.Generic;
// // using System;
// // using System.Collections.Generic;
// // using System.IO;
// // using System.Reflection;
// // using System.Threading;
// // using System.Threading.Tasks;

// using Google.Apis.Auth.OAuth2;
// using Google.Apis.Services;
// using Google.Apis.Upload;
// using Google.Apis.Util.Store;
// using Google.Apis.YouTube.v3;
// using Google.Apis.YouTube.v3.Data;

// namespace Application.Youtube
// {
//     public class Playlist
//     {

//         public class MessagesEnvelope
//         {
//             public List<Message> Items { get; set; }
//             public int ItemCount { get; set; }
//         }
//         public class Query : IRequest<MessagesEnvelope>
//         {
//         }

//         public class Handler : IRequestHandler<Query, MessagesEnvelope>
//         {

//             private readonly DataContext _context;
//             private readonly IMapper _mapper;
//             private readonly IUserAccessor _userAccessor;

//             public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
//             {
//                 _context = context;
//                 _mapper = mapper;
//                 _userAccessor = userAccessor;                
//             }

//             public async Task<MessagesEnvelope> Handle(Query request, CancellationToken cancellationToken)
//             {
//                 var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());
//                 if (user == null)
//                 {
//                     throw new RestException(HttpStatusCode.Unauthorized);
//                 }

//                 var queryable = _context.Messages
//                     .Where(x => x.SenderId.ToString() == user.Id || x.TargetId.ToString() == user.Id)
//                     .OrderBy(x => x.CreatedAt)
//                     .AsQueryable();

//                 var items = await queryable.ToListAsync();

//                 return new MessagesEnvelope
//                 {
//                     Items = items,
//                     ItemCount = queryable.Count()
//                 };
//             }
//         }
//     }
// }
