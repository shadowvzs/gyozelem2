using Application.Messages;
using Domain;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace API.Controllers
{
    public class MessagesController : BaseController
    {
        // POST api/messages
        [HttpPost("")]
        public async Task<ActionResult<Message>> CreateMessage(CreateMessage.Command command)
        {
            return await Mediator.Send(command);
        }

        // PUT api/messages/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        // [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<Message>> MessageEdit(EditMessage.Command command)
        {
            return await Mediator.Send(command);
        }

        // DELETE api/messages/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        // [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<Unit>> DeleteMessage(Guid id)
        {
            return await Mediator.Send(new DeleteMessage.Command{ Id = id });
        }
    }
}