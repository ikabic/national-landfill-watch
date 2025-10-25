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
                    ImageName = l.ImageName,
                    Status = l.Status,
                    CenterLat = l.Lat,
                    CenterLon = l.Lon,
                    CenterXPx = l.CenterXPx,
                    CenterYPx = l.CenterYPx,
                    Radius = l.Radius
                })
                .ToListAsync();

            return Ok(markers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var landfillDto = await _context.RegistryLandfills
                .Where(l => l.Id == id)
                .Select(l => new RegistryLandfillDto
                {
                    ImageName = l.ImageName,
                    Status = l.Status,
                    StartYear = l.StartYear,
                    LifeYears = l.LifeYears,
                    AreaM2 = l.AreaM2,
                    VolumeM3 = l.VolumeM3,
                    TotalMassTon = l.TotalMassTon,
                    AnnualMswM3 = l.AnnualMswTon,
                    AnnualCH4Tonnes = l.AnnualCH4Tonnes,
                    AnnualCO2eTonnes = l.AnnualCO2eTonnes,
                    CenterLat = l.Lat,
                    CenterLon = l.Lon,
                    CenterX = l.CenterXPx,
                    CenterY = l.CenterYPx,
                    Radius = l.Radius
                })
                .FirstOrDefaultAsync();

            if (landfillDto == null)
                return NotFound();

            return Ok(landfillDto);
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