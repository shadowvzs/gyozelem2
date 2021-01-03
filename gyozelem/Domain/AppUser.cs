using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Domain
{

    public enum AppUserRank { 
        None        = 0, 
        Member      = 1,
        Editor      = 2,
        Admin       = 3,
    }

    public class AppUser : IdentityUser
    {
        public string DisplayName { get; set; }
        public AppUserRank Rank { get; set; }
    }
}