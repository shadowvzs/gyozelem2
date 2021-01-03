using MediatR;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using Application.Errors;
using Application.Interfaces;
using Newtonsoft.Json;

using System;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Application.CalendarEvents
{
    public class Edit
    {
        public class Command : IRequest<CalendarEvent>
        {
            public Guid Id { get; set; }
            public DateTime StartAt { get; set; }
            public DateTime? EndAt { get; set; }
            public uint? VisibilityLevel { get; set; }
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
                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());
                if (user == null || (user.Rank != AppUserRank.Editor && user.Rank != AppUserRank.Admin))
                {
                    throw new RestException(HttpStatusCode.Unauthorized);
                }

                var ce = await _context.CalendarEvents.FindAsync(request.Id);

                if (ce == null) {
                    throw new RestException(HttpStatusCode.NotFound, new { CalendarEvent = "Not found" });
                }

                ce.StartAt = request.StartAt;
                if (request.EndAt.HasValue)                 { ce.EndAt = request.EndAt.Value; }
                if (request.VisibilityLevel.HasValue)       { ce.VisibilityLevel = request.VisibilityLevel.Value; }
                if (!String.IsNullOrEmpty(request.Title))   { ce.Title = request.Title; }
                if (!String.IsNullOrEmpty(request.Message)) { ce.Message = request.Message; }

                ce.UpdatedAt = DateTime.Now;
                ce.UpdatedBy = Guid.Parse(user.Id);
                
                var deletedCalendarGuests = new List<CalendarGuest>();
                ce.CalendarGuests.ForEach(delegate(CalendarGuest cg)
                {
                    if (request.CalendarGuests.Any(rce => rce.Id == cg.Id) == false)
                    {
                        deletedCalendarGuests.Add(cg);
                    }
                });

                if (deletedCalendarGuests.Count > 0) {
                    _context.CalendarGuests.RemoveRange(deletedCalendarGuests);
                }

                ce.CalendarGuests = request.CalendarGuests
                    .Select(x => new CalendarGuest() { 
                        // CalendarEventId = calendarEvent.Id,
                        GuestId = x.GuestId,
                    })
                    .ToList();

                if (await _context.SaveChangesAsync() == 0) {
                    throw new RestException(HttpStatusCode.InternalServerError, new { CalendarEvent = "Problem saving changes" });
                }
                
                return ce;
            }
        }
    }
}