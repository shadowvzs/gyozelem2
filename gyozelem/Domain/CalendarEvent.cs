using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    public class CalendarEvent
    {
        public Guid Id { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime? EndAt { get; set; }
        public uint VisibilityLevel { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
        public virtual List<CalendarGuest> CalendarGuests { get; set; }
    }
}
