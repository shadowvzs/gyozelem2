using Application.Interfaces;
using MediatR;
using Domain;
using Persistence;
using FluentValidation;
using Application.Errors;
using Application.Validators;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using System;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace Application.User
{
    public class Register
    {
        
        public class Command : IRequest<User>
        {
            public string DisplayName { get; set; }
            public string Username { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DisplayName).NotEmpty();
                RuleFor(x => x.Username).NotEmpty();
                RuleFor(x => x.Email).NotEmpty().EmailAddress();
                RuleFor(x => x.Password).Password();
            }
        }

        public class Handler : IRequestHandler<Command, User>
        {
            private readonly DataContext _context;
            private readonly UserManager<AppUser> _userManager;
            private readonly IJwtGenerator _jwtGenerator;

            public Handler(DataContext context, UserManager<AppUser> userManager, IJwtGenerator jwtGenerator)
            {
                _context = context;
                _userManager = userManager;
                _jwtGenerator = jwtGenerator;
            }

            public async Task<User> Handle(Command request, CancellationToken cancellationToken)
            {

                var countVal = _context.Users.Count();
                var rank = AppUserRank.None;

                if (countVal == 0)
                {
                    rank = AppUserRank.Admin;
                } 
                else 
                {
                    if (await _context.Users.Where(x => x.Email == request.Email).AnyAsync())
                        throw new RestException(HttpStatusCode.BadRequest, new { Email = "Email already exists!" });
                    
                    if (await _context.Users.Where(x => x.UserName == request.Username).AnyAsync())
                        throw new RestException(HttpStatusCode.BadRequest, new { Username = "Username already exists!" });
                }
                
                var user = new AppUser
                {
                    DisplayName = request.DisplayName,
                    Email = request.Email,
                    UserName = request.Username,
                    Rank = rank
                };

                try {
                    var result = await _userManager.CreateAsync(user, request.Password);
                    if (result.Succeeded)
                    {
                        return new User
                        {
                            DisplayName = user.DisplayName,
                            Token = _jwtGenerator.CreateToken(user),
                            Username = user.UserName,
                            Rank = user.Rank
                        };
                    }
                } catch (Exception e) {
                    Console.WriteLine("User creation error: ", e);
                    throw new RestException(HttpStatusCode.NotFound, new { User = "Problem creating user" });
                }

                throw new RestException(HttpStatusCode.NotFound, new { User = "Problem creating user" });
            }
        }
    }
}
