using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    public class FileChunk
    {
        public Guid Id { get; set; }
        public Guid EntityId { get; set; }
        public int Index { get; set; }
        public int MaxIndex { get; set; }
        public byte[] Chunk { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
    }
}
