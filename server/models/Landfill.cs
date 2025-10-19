using System.ComponentModel.DataAnnotations.Schema;

[Table("landfills")]
public class Landfill
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("category")]
    public string Category { get; set; } = string.Empty;

    [Column("geojson")]
    public string GeoJson { get; set; } = string.Empty;

    [Column("reportedat")]
    public DateTime ReportedAt { get; set; } = DateTime.Now;

    [Column("lat")]
    public double Lat { get; set; }

    [Column("lng")]
    public double Lng { get; set; }
}
