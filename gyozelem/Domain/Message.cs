using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Domain
{
    public class Message : IdentityUser
    {
        public Guid SenderId { get; set; }
        public Guid TargetId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime SeenAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
}