using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{

    public enum FSFlag {
        Normal,
        Hidden,
        Protected
    }

    public enum FSStatus { 
        None, 
        Error,
        Uploading,
        Processing,
        Ok
    }

    public enum FSType {
        UNKNOWN,
        FOLDER,
        IMAGE,
        VIDEO,
        AUDIO,
        DOCUMENT
    }

    public class FSMetaData
    {
        public string? Extension { get; set; }
        public string? Filename { get; set; }
    }

    public class FSObject
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid ParentId { get; set; }
        public FSStatus Status { get; set; }
        public FSType Type { get; set; }
        public int Flag { get; set; }
        public uint Size { get; set; }
        public string Extension { get; set; }
        public string Url { get; set; }
        public FSMetaData MetaData { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
}
