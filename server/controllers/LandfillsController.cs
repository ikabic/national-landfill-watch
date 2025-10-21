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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var landfill = await _context.Landfills.FindAsync(id);
            if (landfill == null)
                return NotFound();
            return Ok(landfill);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Landfill newLandfill)
        {
            _context.Landfills.Add(newLandfill);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = newLandfill.Id }, newLandfill);
        }

        [HttpPost("{id}/image")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file)
        {
            var landfill = await _context.Landfills.FindAsync(id);
            if (landfill == null)
                return NotFound();

            var path = Path.Combine("wwwroot/images/landfills", $"{id}_{file.FileName}");
            using (var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { path });
        }
    }
}
