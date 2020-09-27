using Newtonsoft.Json;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

using System.Collections.Generic;

namespace Persistence
{
    public class DataContext : IdentityDbContext<AppUser>
    {
        public DataContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<FSObject> FSObjects { get; set; }
        public DbSet<FileChunk> FileChunks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            new FSObjectMap(modelBuilder.Entity<FSObject>());
            base.OnModelCreating(modelBuilder);

            /*
            modelBuilder.Entity<FSObject>()
                .Property(e => e.MetaData).HasConversion(
                    v => JsonConvert.SerializeObject(v, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }),
                    v => JsonConvert.DeserializeObject<FSMetaData>(v, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore })
                );
            */
        }
    }

    public class FSObjectMap
    {
        public FSObjectMap(EntityTypeBuilder<FSObject> entityBuilder)
        {
            entityBuilder.Property(e => e.MetaData).HasConversion(
                v => JsonConvert.SerializeObject(v, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }),
                v => JsonConvert.DeserializeObject<FSMetaData>(v, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore })
            );
        }
    }

    /*
    public class FSObjectsConfiguration : IEntityTypeConfiguration<FSObject>
    {
        public void Configure(EntityTypeBuilder<FSObject> builder)
        {
            // This Converter will perform the conversion to and from Json to the desired type
            builder.Property(e => e.MetaData).HasConversion(
                v => JsonConvert.SerializeObject(v, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }),
                v => JsonConvert.DeserializeObject<Dictionary<string, string>>(v, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }));
        }
    }
    */
    
}
