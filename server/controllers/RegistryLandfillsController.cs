using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.data;
using server.models;
using server.dtos;

namespace server.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegistryLandfillsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RegistryLandfillsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var registryLandfills = await _context.RegistryLandfills.ToListAsync();
            return Ok(registryLandfills);
        }

        [HttpGet("markers")]
        public async Task<IActionResult> GetMarkers()
        {
            var markers = await _context.RegistryLandfills
                .Select(l => new RegistryLandfillMarkerDto
                {
                    Id = l.Id,
                    ImageName = null,
                    Status = l.Status,
                    CenterLat = l.Lat,
                    CenterLon = l.Lon
                })
                .ToListAsync();

            return Ok(markers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var landfill = await _context.RegistryLandfills.FindAsync(id);
            if (landfill == null)
                return NotFound();

            return Ok(landfill);
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportRegistryLandfills([FromBody] List<RegistryLandfill> landfills)
        {
            _context.RegistryLandfills.AddRange(landfills);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Registry landfills imported successfully" });
        }
    }
}