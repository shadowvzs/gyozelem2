using Domain;

namespace Application.User
{
    public class User
    {
        public string DisplayName { get; set; }
        public string Token { get; set; }
        public string Username { get; set; }
        public AppUserRank? Rank { get; set; }
    }
}
