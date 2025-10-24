namespace server.dtos
{
    public class RegistryLandfillMarkerDto
    {
        public int Id { get; set; }
        public string? ImageName { get; set; }
        public string? Status { get; set; }
        public double? CenterLat { get; set; }
        public double? CenterLon { get; set; }
    }
}