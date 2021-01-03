using MediatR;
using Domain;
using Persistence;
using Util;

using FluentValidation;
using Application.Errors;
using Application.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Application.FSObjects
{
    public class Create
    {
        public class Command : IRequest<FSObject>
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
            public Guid ParentId { get; set; }
            public FSStatus? Status { get; set; }
            public FSType Type { get; set; }
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

                var isFile = request.Type != FSType.FOLDER;
                var status = request.Status.GetValueOrDefault(isFile ? FSStatus.Uploading : FSStatus.Ok);

                var mime = new MimeType(request.Name);
                if (request.MetaData != null) {
                    request.MetaData.MimeType = mime.Mime;
                }
                if (request.Type == FSType.UNKNOWN) {
                    request.Type = mime.Type;
                }

                var id = request.Id == Guid.Empty ? Guid.NewGuid() : request.Id;
                var fsobject = new FSObject
                {
                    Id = id,
                    Name = request.Name,
                    ParentId = request.ParentId,
                    Status = status,
                    Type = request.Type,
                    Flag = request.Flag.GetValueOrDefault(0),
                    Size = request.Size.GetValueOrDefault(0),
                    Extension = request.Extension ?? String.Empty,
                    Url = request.Url ?? "",
                    MetaData = request.MetaData,
                    CreatedAt = DateTime.Now,
                    CreatedBy = Guid.Parse(user.Id),
                    UpdatedAt = null,
                    UpdatedBy = null
                };

                if (!string.IsNullOrEmpty(request.Url)) {
                    var wholeBlob = Convert.FromBase64String(fsobject.Url);
                    fsobject.Url = FSObjectConfig.GetRelativePath(id.ToString() + '_' + fsobject.Name);
                    System.IO.File.WriteAllBytes(FSObjectConfig.GetWholePath(id.ToString() + '_' + fsobject.Name), wholeBlob);
                }

                _context.FSObjects.Add(fsobject);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { FSObject = "Problem saving changes" });
                }
                
                return fsobject;
            }
        }
    }
}