using MediatR;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using Application.Errors;
using Application.Interfaces;

using System;
using System.Net;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Application.FSObjects
{
    public class UploadComplete
    {
        public class Command : IRequest<FSObject>
        {
            public Guid Id { get; set; }
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

                var Id = request.Id;
                var user = await _context.Users.SingleOrDefaultAsync(x => 
                    x.UserName == _userAccessor.GetCurrentUsername());

                var fileChunks = await _context.FileChunks
                    .Where(s => s.EntityId == Id)
                    .OrderBy(x => x.Index)
                    .ToListAsync();
                var fs = await _context.FSObjects.FindAsync(request.Id);

                if (fs == null) 
                {
                    throw new RestException(HttpStatusCode.InternalServerError, new { FSObject = "Missing the FSObject" });
                } 
                else if (fileChunks.Count() == 0)
                {
                    throw new RestException(HttpStatusCode.InternalServerError, new { FSObject = "Missing the file chunks in database" });
                }

                var chunks = fileChunks.Select(fileChunk => fileChunk.Chunk).ToArray();
                var wholeBlob = new byte[chunks.Sum(a => a.Length)];
                fs.Url = "/assets/" + fs.Name;
                var offset = 0;
                
                foreach (byte[] chunk in chunks) {
                    System.Buffer.BlockCopy(chunk, 0, wholeBlob, offset, chunk.Length);
                    offset += chunk.Length;
                }
                
                System.IO.File.WriteAllBytes("wwwroot" + fs.Url, wholeBlob);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { FSObject = "Problem saving changes" });
                }

                return fs;
            }
        }
    }
}