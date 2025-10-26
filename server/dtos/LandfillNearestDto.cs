namespace server.dtos
{
    public class LandfillNearestDto
    {
        public int Id { get; set; }
        public string ImageName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double CenterLat { get; set; }
        public double CenterLon { get; set; }
        public double DistanceMeters { get; set; }
    }
}
