using Microsoft.AspNetCore.Mvc;

namespace server.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LandfillsController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            var mock = new[]{
                new { Id=1, Name="Divlja deponija A", Category="wild", GeoJson="{}" },
                new { Id=2, Name="Sanitarna B", Category="sanitary", GeoJson="{}" }
            };
            return Ok(mock);
        }
    }
}
