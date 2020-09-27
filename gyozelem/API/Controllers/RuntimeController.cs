using Domain;
using Microsoft.EntityFrameworkCore;
using MediatR;
using Application.FSObjects;
using Microsoft.AspNetCore.Authorization;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class RuntimeController : BaseController
    {

        // GET api/tests/
        [AllowAnonymous]
        [HttpGet]
        public string Version()
        {
            return "V1";
        }
    }
}