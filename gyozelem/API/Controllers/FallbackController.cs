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
            var fileName = "index.html";
            var filePath = "wwwwroot/" + fileName;
            var fileExists = System.IO.File.Exists(filePath);
            return PhysicalFile(filePath, "text/HTML", fileName);
            //return PhysicalFile(Path.Combine("wwwwroot", "index.html"), "text/HTML");
            // return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwwroot", "index.html"), "text/HTML");
        }
    }
}