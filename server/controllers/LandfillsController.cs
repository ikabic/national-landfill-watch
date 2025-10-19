using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.data;

namespace server.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LandfillsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LandfillsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var landfills = await _context.Landfills.ToListAsync();
            return Ok(landfills);
        }
    }
}
