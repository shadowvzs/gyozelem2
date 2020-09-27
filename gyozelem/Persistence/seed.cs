using Domain;
using Microsoft.AspNetCore.Identity;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Persistence
{
    public class Seed
    {
        public static async Task SeedData(DataContext context, UserManager<AppUser> userManager)
        {
            if (!userManager.Users.Any())
            {

                var userId = Guid.NewGuid();
                var users = new List<AppUser>
                {
                    new AppUser
                    {
                        Id = userId.ToString(),
                        DisplayName = "Admin",
                        UserName = "bob",
                        Email = "bob@test.com"
                    },
                };

                foreach (var user in users)
                {
                    await userManager.CreateAsync(user, "Pa$$$w0rd");
                }
                /*
                var fSObject = new FSObject
                {
                    Id = Guid.NewGuid(),
                    ParentId = Guid.Empty,
                    Type = FSType.FOLDER,
                    Status = FSStatus.Ok,
                    Name = "Root",
                    Size = 0,
                    Flag = 0,
                    CreatedAt = DateTime.Now,
                    CreatedBy = userId,
                };

                context.FSObjects.Add(fSObject);
                */

                await context.SaveChangesAsync();

            }
            
        }
    }
}