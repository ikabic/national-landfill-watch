namespace server.dtos
{
    public class LandfillDto
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double Lat { get; set; }
        public double Lng { get; set; }
        public double? AreaM2 { get; set; }
        public double? VolumeM3 { get; set; }
        public double? MethaneTonsPerYear { get; set; }
        public double? CO2eTonsPerYear { get; set; }
        public string GeoJson { get; set; } = "{}";
    }
}
