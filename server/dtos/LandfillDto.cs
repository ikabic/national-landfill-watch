namespace server.dtos
{
    public class LandfillDto
    {
        public string ImageName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int StartYear { get; set; }
        public int LifeYears { get; set; }
        public double? AreaM2 { get; set; }
        public double? VolumeM3 { get; set; }
        public double? TotalMassTon { get; set; }
        public double? AnnualMswM3 { get; set; }
        public double? AnnualCH4Tonnes { get; set; }
        public double? AnnualCO2eTonnes { get; set; }
        public string GeoJson { get; set; } = "{}";
        public double? CenterLat { get; set; }
        public double? CenterLon { get; set; }
        public double? CenterX { get; set; }
        public double? CenterY { get; set; }
        public double? Width { get; set; }
        public double? Height { get; set; }
    }
}
