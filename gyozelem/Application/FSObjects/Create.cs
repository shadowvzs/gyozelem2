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

                var user = await _context.Users.SingleOrDefaultAsync(x => 
                    x.UserName == _userAccessor.GetCurrentUsername());

                var isFile = request.Type != FSType.FOLDER;
                var status = request.Status.GetValueOrDefault(isFile ? FSStatus.Uploading : FSStatus.Ok);
                var createdBy = user != null ? new Guid(user.Id) : Guid.Empty;

                var fsobject = new FSObject
                {
                    Id = request.Id,
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
                    CreatedBy = createdBy,
                    UpdatedAt = null,
                    UpdatedBy = null
                };

                if (!string.IsNullOrEmpty(request.Url)) {
                    var wholeBlob = Convert.FromBase64String(fsobject.Url);
                    fsobject.Url = "/assets/" + fsobject.Name;
                    System.IO.File.WriteAllBytes("wwwroot" + fsobject.Url, wholeBlob);
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