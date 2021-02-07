using Application.User;
using Domain;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System.Threading.Tasks;

namespace API.Controllers
{
    public class UsersController : BaseController
    {
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<User>> Login(Login.Query query)
        {
            return await Mediator.Send(query);
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(Register.Command command)
        {
            return await Mediator.Send(command);
        }

        [HttpGet("current-user")]
        public async Task<ActionResult<User>> CurrentUser()
        {
            return await Mediator.Send(new CurrentUser.Query());
        }

        [HttpPost("rank")]
        public async Task<ActionResult<Unit>> SetRank(Rank.Command command)
        {
            return await Mediator.Send(command);
        }

        // GET api/users/
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<List.UsersEnvelope>> List()
        {
            return await Mediator.Send(new List.Query());
        }

    }
}