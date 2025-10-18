public class Landfill
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string GeoJson { get; set; } = string.Empty;
    public DateTime ReportedAt { get; set; } = DateTime.Now;
}

