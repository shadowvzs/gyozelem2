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
    public class Edit
    {
        public class Command : IRequest<FSObject>
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
            public Guid? ParentId { get; set; }
            public FSStatus? Status { get; set; }
            public FSType? Type { get; set; }
            public int? Flag { get; set; }
            public uint? Size { get; set; }
            public string Extension { get; set; }
            public string Url { get; set; }
            public FSMetaData MetaData { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Name).NotEmpty();
                RuleFor(x => x.Type).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Command, FSObject>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<FSObject> Handle(Command request, CancellationToken cancellationToken)
            {

                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());
                var fs = await _context.FSObjects.FindAsync(request.Id);

                if (!string.IsNullOrEmpty(request.Name)) { fs.Name = request.Name; }
                if (request.ParentId.HasValue) { fs.ParentId = request.ParentId.Value; }
                if (request.Status.HasValue) { fs.Status = request.Status.Value; }
                if (request.Type.HasValue) { fs.Type = request.Type.Value; }
                if (request.Flag.HasValue) { fs.Flag = request.Flag.Value; }
                if (request.Size.HasValue) { fs.Size = request.Size.Value; }
                if (!string.IsNullOrEmpty(request.Extension)) { fs.Extension = request.Extension; }
                if (!string.IsNullOrEmpty(request.Url)) { fs.Url = request.Url; }
                if (request.MetaData != null) { fs.MetaData = request.MetaData; }
                fs.UpdatedAt = DateTime.Now;
                fs.UpdatedBy = new Guid(user.Id); 

                _context.FSObjects.Add(fs);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { FSObject = "Problem saving changes" });
                }
                
                return fs;
            }
        }
    }
}

// using MediatR;
// using Domain;
// using Persistence;
// using Microsoft.EntityFrameworkCore;
// using FluentValidation;
// using Application.Errors;

// using System;
// using System.Net;
// using System.Threading;
// using System.Threading.Tasks;

// namespace Application.Activities
// {
//     public class Edit
//     {
//         public class Command : IRequest
//         {
//             public Guid Id { get; set; }
//             public string Title { get; set; }
//             public string Description { get; set; }
//             public string Category { get; set; }
//             public DateTime? Date { get; set; }
//             public string City { get; set; }
//             public string Venue { get; set; }
//         }

//         public class CommandValidator : AbstractValidator<Command>
//         {
//             public CommandValidator()
//             {
//                 RuleFor(x => x.Title).NotEmpty();
//                 RuleFor(x => x.Description).NotEmpty();
//                 RuleFor(x => x.Category).NotEmpty();
//                 RuleFor(x => x.Date).NotEmpty();
//                 RuleFor(x => x.City).NotEmpty();
//                 RuleFor(x => x.Venue).NotEmpty();
//             }
//         }

//         public class Handler : IRequestHandler<Command>
//         {
//             private readonly DataContext _context;
//             public Handler(DataContext context)
//             {
//                 _context = context;
//             }

//             public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
//             {
//                 var activity = await _context.Activities.FindAsync(request.Id);
//                 if (activity == null)
//                     throw new RestException(HttpStatusCode.NotFound, new { Activity = "Could not find activity" } );

//                 activity.Title = request.Title ?? activity.Title;
//                 activity.Description = request.Description ?? activity.Description;
//                 activity.Category = request.Category ?? activity.Category;
//                 activity.Date = request.Date ?? activity.Date;
//                 activity.City = request.City ?? activity.City;
//                 activity.Venue = request.Venue ?? activity.Venue;

//                 var success = await _context.SaveChangesAsync() > 0;

//                 if (success) return Unit.Value;

//                 throw new RestException(HttpStatusCode.NotFound, new { Activity = "Problem saving changes" });
//             }
//         }
//     }
// }