using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    public class FallbackController : Controller
    {
        [AllowAnonymous]
        public IActionResult Index()
        {
            return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwwroot", "index.html"), "text/HTML");
        }
    }
}