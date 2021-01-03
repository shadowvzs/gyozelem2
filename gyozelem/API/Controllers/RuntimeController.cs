using Domain;
using Microsoft.EntityFrameworkCore;
using MediatR;
using Application.FSObjects;
using Microsoft.AspNetCore.Authorization;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class RuntimeController : BaseController
    {

        private readonly IConfiguration _configuration;

        public RuntimeController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // GET api/tests/
        [AllowAnonymous]
        [HttpGet]
        public string Version()
        {
            return _configuration["Version"];
        }
    }
}