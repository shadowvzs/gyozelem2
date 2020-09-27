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
    public class UploadChunk
    {
        public class Command : IRequest<Unit>
        {
            public Guid Id { get; set; }
            public string Index { get; set; }
            public byte[] RawData { get; set; }
        }

        public class Handler : IRequestHandler<Command, Unit>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {

                var user = await _context.Users.SingleOrDefaultAsync(x => 
                    x.UserName == _userAccessor.GetCurrentUsername());

                var createdBy = user != null ? new Guid(user.Id) : Guid.Empty;

                var fileChunk = new FileChunk
                {
                    Id = Guid.NewGuid(),
                    EntityId = request.Id,
                    Index = Int32.Parse(request.Index),
                    Chunk = request.RawData,
                    CreatedAt = DateTime.Now,
                    CreatedBy = createdBy
                };

                _context.FileChunks.Add(fileChunk);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { FSObject = "Problem saving changes" });
                }

                return Unit.Value;
            }
        }
    }
}