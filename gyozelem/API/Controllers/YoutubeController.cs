using Application.Messages;
using Domain;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System;
using System.Threading.Tasks;

namespace API.Controllers
{
    public class YoutubeController : BaseController
    {
        // GET api/messages/
        // [AllowAnonymous]
        // [HttpGet]
        // public async Task<ActionResult<List.MessagesEnvelope>> List()
        // {
        //     return await Mediator.Send(new List.Query());
        // }

        // // POST api/messages
        // [HttpPost("")]
        // public async Task<ActionResult<Message>> Create(Create.Command command)
        // {
        //     return await Mediator.Send(command);
        // }

        // // PUT api/messages/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        // // [Authorize]
        // [HttpPut("{id}")]
        // public async Task<ActionResult<Message>> Edit(Edit.Command command)
        // {
        //     return await Mediator.Send(command);
        // }

        // // DELETE api/messages/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        // // [Authorize]
        // public async Task<ActionResult<Unit>> Delete(Guid id)
        // {
        //     return await Mediator.Send(new Delete.Command{ Id = id });
        // }
    }
}