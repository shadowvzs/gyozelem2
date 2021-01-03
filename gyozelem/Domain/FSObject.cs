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
        None        = 0, 
        Error       = 1,
        Uploading   = 2,
        Processing  = 3,
        Ok          = 4
    }

    public enum FSType {
        UNKNOWN    = 0,
        FOLDER     = 1,
        IMAGE      = 2,
        VIDEO      = 3,
        AUDIO      = 4,
        DOCUMENT   = 5,
        ARCHIVE    = 6,
        FONT       = 7,
    }

    public class FSMetaData
    {
        #nullable enable
        public string? Extension { get; set; }
        public string? Filename { get; set; }
        public string? MimeType { get; set; }
        #nullable disable
    }

    public static class FSObjectConfig {
        public const string BaseFolderName = "wwwroot";
        public const string AssetFolderName = "assets";
        public static string GetWholePath(string filename = null)
        {
            var path = FSObjectConfig.BaseFolderName + "/" + FSObjectConfig.AssetFolderName + "/";
            if (filename == null) {
                return path;
            }

            return path + filename;
        }
        public static string GetRelativePath(string filename)
        {
            return FSObjectConfig.AssetFolderName + "/" + filename;
        }
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
