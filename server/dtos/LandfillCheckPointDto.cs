namespace server.dtos
{
    public class LandfillCheckPointDto
    {
        public int Id { get; set; }
        public string ImageName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int StartYear { get; set; }
        public double InfluenceRadius { get; set; }
        public double CenterLat { get; set; }
        public double CenterLon { get; set; }
    }
}
