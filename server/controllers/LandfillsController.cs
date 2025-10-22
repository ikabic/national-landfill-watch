using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.data;
using server.dtos;
using server.models;
using Newtonsoft.Json.Linq;
using System.Data.Common;

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
            var landfills = await _context.Landfills
            .Select(l => new LandfillDto
            {
                Id = l.Id,
                ImageName = l.ImageName,
                Status = l.Status,
                StartYear = l.StartYear,
                LifeYears = l.LifeYears,
                AreaM2 = l.AreaM2,
                VolumeM3 = l.VolumeM3,
                TotalMassTon = l.TotalMassTon,
                AnnualMswM3 = l.AnnualMswM3,
                AnnualCH4Tonnes = l.AnnualCH4Tonnes,
                AnnualCO2eTonnes = l.AnnualCO2eTonnes,
                GeoJson = l.GeoJson,
                CenterLat = l.CenterLat,
                CenterLon = l.CenterLon,
                CenterX = l.CenterX,
                CenterY = l.CenterY,
                Width = l.Width,
                Height = l.Height
            })
            .ToListAsync();

        return Ok(landfills);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var landfillDto = await _context.Landfills
                .Where(l => l.Id == id)
                .Select(l => new LandfillDto
                {
                    ImageName = l.ImageName,
                    Status = l.Status,
                    StartYear = l.StartYear,
                    LifeYears = l.LifeYears,
                    AreaM2 = l.AreaM2,
                    VolumeM3 = l.VolumeM3,
                    TotalMassTon = l.TotalMassTon,
                    AnnualMswM3 = l.AnnualMswM3,
                    AnnualCH4Tonnes = l.AnnualCH4Tonnes,
                    AnnualCO2eTonnes = l.AnnualCO2eTonnes,
                    GeoJson = l.GeoJson,
                    CenterLat = l.CenterLat,
                    CenterLon = l.CenterLon,
                    CenterX = l.CenterX,
                    CenterY = l.CenterY,
                    Width = l.Width,
                    Height = l.Height
                })
                .FirstOrDefaultAsync();

            if (landfillDto == null)
                return NotFound();

            return Ok(landfillDto);
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

        [HttpPost("import")]
        public async Task<IActionResult> ImportLandfills([FromBody] List<LandfillDto> landfills)
        {
            foreach (var lf in landfills)
            {
                var entity = new Landfill
                {
                    ImageName = lf.ImageName,
                    Status = lf.Status,
                    StartYear = lf.StartYear,
                    LifeYears = lf.LifeYears,
                    AreaM2 = lf.AreaM2,
                    VolumeM3 = lf.VolumeM3,
                    TotalMassTon = lf.TotalMassTon,
                    AnnualMswM3 = lf.AnnualMswM3,
                    AnnualCH4Tonnes = lf.AnnualCH4Tonnes,
                    AnnualCO2eTonnes = lf.AnnualCO2eTonnes,
                    GeoJson = lf.GeoJson,
                    CenterLat = lf.CenterLat,
                    CenterLon = lf.CenterLon,
                    CenterX = lf.CenterX,
                    CenterY = lf.CenterY,
                    Width = lf.Width,
                    Height = lf.Height
                };
                _context.Landfills.Add(entity);
            }
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Landfills imported successfully" });
        }

        [HttpGet("check-point")]
        public async Task<IActionResult> CheckPoint([FromQuery] double lat, [FromQuery] double lon)
        {
            var landfills = await _context.LandfillCheckPointDto
                .FromSqlInterpolated($@"
            SELECT 
                l.id AS ""Id"",
                l.image_name AS ""ImageName"",
                l.status AS ""Status"",
                l.start_year AS ""StartYear"",
                (l.geojson->'features'->1->'properties'->>'influence_radius')::double precision AS ""InfluenceRadius"",
                l.center_lat AS ""CenterLat"",
                l.center_lon AS ""CenterLon""
            FROM ""landfills"" AS l
            WHERE ST_DWithin(
                geom,
                ST_SetSRID(ST_MakePoint({lon}, {lat}), 4326)::geography,
                (l.geojson->'features'->1->'properties'->>'influence_radius')::double precision
            )
        ")
                .ToListAsync();

            return Ok(landfills);
        }

    }
}
