using Domain;
using WebSocket;

using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

using System.Collections.Generic;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System.Transactions;

namespace Persistence
{

    public class DataContext : IdentityDbContext<AppUser>
    {
        private IHubContext<EntityEventHandlerHub> hub;

        public DataContext(DbContextOptions options, IHubContext<EntityEventHandlerHub> _hub) : base(options)
        {
            hub = _hub;
        }

        public DbSet<FSObject> FSObjects { get; set; }
        public DbSet<FileChunk> FileChunks { get; set; }
        public DbSet<CalendarEvent> CalendarEvents { get; set; }
        public DbSet<CalendarGuest> CalendarGuests { get; set; }
        public DbSet<Guest> Guests { get; set; }

        public string EntityStateToString(EntityState state) {
            switch (state)
            {
                case EntityState.Added:
                    return "Added";
                case EntityState.Deleted:
                    return "Deleted";
                case EntityState.Detached:
                    return "Detached";
                case EntityState.Modified:
                    return "Modified";
                 default:
                    return "Unchanged";
            }
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            var forbiddenEntities = new HashSet<string> { "FileChunkProxy", "FileChunk" };
            var changedEntries = ChangeTracker
                .Entries()
                .AsEnumerable()
                .Where(x => x.State != EntityState.Unchanged)
                .Where(x => !forbiddenEntities.Contains(x.Entity.GetType().Name));
            foreach (var entry in changedEntries)
            {
                var entityName = entry.Entity.GetType().Name.Replace("Proxy", "");
                var state = EntityStateToString(entry.State);
                var message = new EntityMessage(entityName, state, entry.Entity);

                var serializedData = Newtonsoft.Json.JsonConvert.SerializeObject(
                    message, 
                    new JsonSerializerSettings
                    {
                        ContractResolver = new DefaultContractResolver
                        {
                            NamingStrategy = new CamelCaseNamingStrategy()
                        },
                        Formatting = Formatting.Indented
                    }
                );
                #pragma warning disable 4014
                hub.Clients.All.SendAsync(message.Name, serializedData);
                #pragma warning restore 4014
            }
            
            return (await base.SaveChangesAsync(true, cancellationToken));
        }
            
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            new FSObjectMap(modelBuilder.Entity<FSObject>());
            modelBuilder.Entity<CalendarEvent>()
                .HasMany(b => b.CalendarGuests)
                .WithOne();
            base.OnModelCreating(modelBuilder);
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

}
