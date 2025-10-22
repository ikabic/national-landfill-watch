using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.data;
using server.models;

namespace server.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegisterLandfillsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RegisterLandfillsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var registerLandfills = await _context.RegisterLandfills.ToListAsync();
            return Ok(registerLandfills);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var landfill = await _context.RegisterLandfills.FindAsync(id);
            if (landfill == null)
                return NotFound();

            return Ok(landfill);
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportRegisterLandfills([FromBody] List<RegisterLandfill> landfills)
        {
            _context.RegisterLandfills.AddRange(landfills);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Register landfills imported successfully" });
        }
    }
}