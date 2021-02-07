using Application.Interfaces;
using Domain;
using Persistence;

using MediatR;
using FluentValidation;
using Application.Errors;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using System;
using System.Net;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.User
{
    public class Login
    {
        public class Query : IRequest<User>
        {
            public string Username   { get; set; }
            public string Password   { get; set; }
        }
        public class QueryValidator : AbstractValidator<Query>
        {
            public QueryValidator()
            {
                RuleFor(x => x.Username).NotEmpty();
                RuleFor(x => x.Password).NotEmpty();
            }
        }
        public class Handler : IRequestHandler<Query, User>
        {
            private readonly UserManager<AppUser> _userManager;
            private readonly SignInManager<AppUser> _signInManager;
            private readonly IJwtGenerator _jwtGenerator;
            public Handler(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IJwtGenerator jwtGenerator)
            {
                _jwtGenerator = jwtGenerator;
                _signInManager = signInManager;
                _userManager = userManager;

            }

            public async Task<User> Handle(Query request, CancellationToken cancellationToken)
            {
                var user = await _userManager.FindByNameAsync(request.Username) ?? await _userManager.FindByEmailAsync(request.Username);

                if (user == null) {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
                if (result.Succeeded)
                {
                    return new User
                    {
                        Id          = user.Id,
                        DisplayName = user.DisplayName,
                        Token       = _jwtGenerator.CreateToken(user),
                        Username    = user.UserName,
                        Rank        = user.Rank
                    };
                }

                throw new RestException(HttpStatusCode.InternalServerError);
            }
        }
    }
}
