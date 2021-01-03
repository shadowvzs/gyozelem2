using MediatR;
using Domain;
using Persistence;
using Util;

using FluentValidation;
using Application.Errors;
using Application.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

using System;
using System.Net;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Application.CalendarEvents
{
    public class Create
    {
        public class Command : IRequest<CalendarEvent>
        {
            public DateTime StartAt { get; set; }
            public DateTime? EndAt { get; set; }
            public uint VisibilityLevel { get; set; }
            public string Title { get; set; }
            public string Message { get; set; }
            public List<CalendarGuest> CalendarGuests { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Title).NotEmpty();
                RuleFor(x => x.Message).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Command, CalendarEvent>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            
            }

            public async Task<CalendarEvent> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _context.Users.SingleOrDefaultAsync(x => 
                    x.UserName == _userAccessor.GetCurrentUsername());

                if (user == null || (user.Rank != AppUserRank.Editor && user.Rank != AppUserRank.Admin))
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var calendarEvent = new CalendarEvent
                {
                    Id = Guid.NewGuid(),
                    StartAt = request.StartAt,
                    EndAt = request.EndAt,
                    VisibilityLevel = request.VisibilityLevel,
                    Title = request.Title,
                    Message = request.Message,
                    CreatedAt = DateTime.Now,
                    CreatedBy = Guid.Parse(user.Id),
                    UpdatedAt = null,
                    UpdatedBy = null
                };

                if (request.CalendarGuests.Count > 0) {
                    calendarEvent.CalendarGuests = request.CalendarGuests
                        .Select(x => new CalendarGuest() { 
                            // CalendarEventId = calendarEvent.Id,
                            GuestId = x.GuestId,
                        })
                        .ToList();
                }

                _context.CalendarEvents.Add(calendarEvent);

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { CalendarEvent = "Problem saving changes" });
                }
                
                return calendarEvent;
            }
        }
    }
}