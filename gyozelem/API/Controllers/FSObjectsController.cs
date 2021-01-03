using Domain;
using Microsoft.EntityFrameworkCore;
using MediatR;
using Application.FSObjects;
using Microsoft.AspNetCore.Authorization;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

using Newtonsoft.Json;

namespace API.Controllers
{
    public class FSObjectsController : BaseController
    {
        // GET api/fsobjects/
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<List.FSObjectsEnvelope>> List(Guid? parentId, int? limit, int? offset, FSType? type, FSStatus? status, int? flag, string sortKey = null, string sortDirection = null)
        {
            return await Mediator.Send(new List.Query(parentId, limit, offset, type, status, flag, sortKey, sortDirection));
        }

        // POST api/fsobjects
        [HttpPost("")]
        public async Task<ActionResult<FSObject>> Create(Create.Command command)
        {
            return await Mediator.Send(command);
        }

        // POST api/fsobjects/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9/uploadchunk
        [HttpPost("{id}/uploadchunk")]
        public async Task<ActionResult<Unit>> UploadChunk(Guid id, [FromBody] byte[] rawData)
        {
            return await Mediator.Send(new UploadChunk.Command{Id = id, RawData = rawData, Index = Request.Headers["X-File-Index"]});
        }

        // GET api/fsobjects/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9/uploadcomplete
        [HttpGet("{id}/uploadcomplete")]
        public async Task<ActionResult<FSObject>> UploadComplete(Guid id)
        {
            return await Mediator.Send(new UploadComplete.Command{Id = id});
        }     


        // PUT api/fsobjects/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        // [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<FSObject>> Edit(Edit.Command command)
        {
            return await Mediator.Send(command);
        }

        // DELETE api/fsobjects/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        [HttpDelete("{id}")]
         // [Authorize]
        public async Task<ActionResult<Unit>> Delete(Guid id)
        {
            return await Mediator.Send(new Delete.Command{ Ids = new List<Guid>(){ id } });
        }

        // DELETE api/fsobjects
        [HttpDelete]
        // [Authorize]
        public async Task<ActionResult<Unit>> Delete(List<Guid> ids)
        {
            return await Mediator.Send(new Delete.Command{ Ids = ids });
        }

        // PUT api/fsobjects
        [HttpPut]
        // [Authorize]
        public async Task<ActionResult<Unit>> BulkUpdate(List<FSObject> items)
        {
            return await Mediator.Send(new BulkUpdate.Command{ Items = items });
        }
    }
}