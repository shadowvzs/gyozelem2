using Domain;
using Persistence;
using Application.Interfaces;
using Application.Errors;

using MediatR;
using Microsoft.EntityFrameworkCore;

using System;
using System.Net;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Application.FSObjects
{
    public class Delete
    {
        public class Command : IRequest
        {
            public List<Guid> Ids { get; set; }
        }

        public class Handler : IRequestHandler<Command>
        {

            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            private async Task<Dictionary<string, FSObject>> GetChilds(DataContext context, List<Guid> ids, Dictionary<string, FSObject> list = null)
            {

                var folderIdList = new List<Guid>();
                var taskList = new List<Task>();
                var items = await context.FSObjects.Where(fs => ids.Contains(fs.ParentId)).ToListAsync();

                items.ForEach(fs => { 
                    if (fs.Type == FSType.FOLDER) 
                    {
                        folderIdList.Add(fs.Id);
                    }
                    list.Add(fs.Id.ToString(), fs);
                });

                if (folderIdList.Count > 0)
                {
                    await GetChilds(context, folderIdList, list);
                }
                return list;
            }

            private async Task<Dictionary<string, FSObject>> GetSubTree(List<Guid> ids)
            {
                var result = await GetChilds(_context, ids, new Dictionary<string, FSObject>()); 
                var items = await _context.FSObjects.Where(i => ids.Contains(i.Id)).ToListAsync();
                foreach (FSObject item in items)
                {
                    if (result.ContainsKey(item.Id.ToString())) { continue; }
                    result.Add(item.Id.ToString(), item);
                }
                return result;
            }
            
            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                
                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());
                if (user == null || (user.Rank != AppUserRank.Editor && user.Rank != AppUserRank.Admin))
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var dict = await GetSubTree(request.Ids);      
                
                FSObject fs = null;

                foreach(var item in dict)
                {
                    fs = item.Value;
                    if (fs.Type != FSType.FOLDER && fs.Url != null) {
                        System.IO.File.Delete(FSObjectConfig.BaseFolderName + "/" + fs.Url);
                    }
                    
                }

                var list = dict.Values.ToList();
                _context.FSObjects.RemoveRange(list);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { FSObject = "Problem saving changes" });
                }

                return Unit.Value;
            }
        }

    }
}