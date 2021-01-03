using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    public class CalendarGuest
    {
        public Guid Id { get; set; }
        public Guid CalendarEventId { get; set; }
        public Guid GuestId { get; set; }
    }
}
