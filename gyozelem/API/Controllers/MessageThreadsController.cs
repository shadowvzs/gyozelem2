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
    public class MessageThreadsController : BaseController
    {
        // -------------- message threads ------------------
        // GET api/messages/
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<ListThreads.MessageThreadEnvelope>> ListThreads()
        {
            return await Mediator.Send(new ListThreads.Query());
        }

        // -------------- get thread history ------------------
        // GET api/messages/
        [AllowAnonymous]
        [HttpGet("history")]
        public async Task<ActionResult<MessageThread>> GetHistory(string targetIds)
        {
            Console.WriteLine(targetIds);
            return await Mediator.Send(new ThreadHistory.Query{ TargetIds = targetIds });
        }

        // POST api/messages
        [HttpPost("")]
        public async Task<ActionResult<MessageThread>> CreateThread(CreateThread.Command command)
        {
            return await Mediator.Send(command);
        }

        // ---------------- users -----------------

        // Post api/messageusers/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        // [Authorize]
        [HttpPost("{ThreadId}/user")]
        public async Task<ActionResult<List<MessageThreadUser>>> AddUser(AddUser.Command command)
        {
            return await Mediator.Send(command);
        }

        // DELETE api/messageusers/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        // [Authorize]
        [HttpDelete("{threadId}/user/{id}")]
        public async Task<ActionResult<Unit>> RemoveUser(Guid threadId, Guid id)
        {
            return await Mediator.Send(new RemoveUser.Command{ Id = id });
        }        
    }
}