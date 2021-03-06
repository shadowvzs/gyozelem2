using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Domain
{
    public class Message
    {
        public Guid Id { get; set; }
        public Guid MessageThreadId { get; set; }
        public string Content { get; set; }
        public DateTime SeenAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
}