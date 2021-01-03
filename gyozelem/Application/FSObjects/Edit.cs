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
                if (user == null || (user.Rank != AppUserRank.Editor && user.Rank != AppUserRank.Admin))
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var fs = await _context.FSObjects.FindAsync(request.Id);

                if (fs == null) {
                    throw new RestException(HttpStatusCode.NotFound, new { FSObject = "Not found" });
                }

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
                fs.UpdatedBy = Guid.Parse(user.Id); 

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { FSObject = "Problem saving changes" });
                }
                
                return fs;
            }
        }
    }
}