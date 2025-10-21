using System;
using System.ComponentModel.DataAnnotations.Schema;

[Table("landfills")]
public class Landfill
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = string.Empty; 

    [Column("area_m2")]
    public double? AreaM2 { get; set; }  

    [Column("volume_m3")]
    public double? VolumeM3 { get; set; }

    [Column("ch4_tonnes_per_year")]
    public double? MethaneTonsPerYear { get; set; }

    [Column("co2e_tonnes_per_year")]
    public double? CO2eTonsPerYear { get; set; }

    [Column("geojson")]
    public string GeoJson { get; set; } = "{}"; 

    [Column("lat")]
    public double? Lat { get; set; }  

    [Column("lng")]
    public double? Lng { get; set; }

    [Column("reportedat")]
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
}
