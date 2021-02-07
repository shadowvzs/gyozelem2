using Domain;
using Microsoft.EntityFrameworkCore;
using MediatR;
using Application.CalendarEvents;
using Microsoft.AspNetCore.Authorization;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

using Newtonsoft.Json;

namespace API.Controllers
{
    public class CalendarEventsController : BaseController
    {
        // GET api/calendarevents/
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<List.CalendarEventsEnvelope>> List()
        {
            return await Mediator.Send(new List.Query());
        }

        
        // GET /api/calendarevents/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        [HttpGet("{id}")]
        // [Authorize]
        public async Task<ActionResult<CalendarEvent>> Details(Guid id)
        {
            return await Mediator.Send(new Details.Query{Id = id} );
        }

        // POST api/calendarevents
        [HttpPost("")]
        public async Task<ActionResult<CalendarEvent>> Create(Create.Command command)
        {
            return await Mediator.Send(command);
        }

        // PUT api/calendarevents/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        // [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<CalendarEvent>> Edit(Edit.Command command)
        {
            return await Mediator.Send(command);
        }

        // DELETE api/calendarevents/6319491A-EBDA-49CE-BA7F-7917D4B3E1A9
        // [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<Unit>> Delete(Guid id)
        {
            return await Mediator.Send(new Delete.Command{ Id = id });
        }
    }
}