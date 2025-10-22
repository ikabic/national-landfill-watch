using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("landfills")]
public class Landfill
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("image_name")]
    public string ImageName { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [Column("start_year")]
    public int StartYear { get; set; }

    [Column("life_years")]
    public int LifeYears { get; set; }

    [Column("area_m2")]
    public double? AreaM2 { get; set; }

    [Column("volume_m3")]
    public double? VolumeM3 { get; set; }

    [Column("total_mass_ton")]
    public double? TotalMassTon { get; set; }

    [Column("annual_msw_m3")]
    public double? AnnualMswM3 { get; set; }

    [Column("annual_ch4_tonnes")]
    public double? AnnualCH4Tonnes { get; set; }

    [Column("annual_co2e_tonnes")]
    public double? AnnualCO2eTonnes { get; set; }

    [Column("geojson")]
    public string GeoJson { get; set; } = "{}";

    [Column("center_lat")]
    public double? CenterLat { get; set; }

    [Column("center_lon")]
    public double? CenterLon { get; set; }

    [Column("center_x_px")]
    public double? CenterX { get; set; }

    [Column("center_y_px")]
    public double? CenterY { get; set; }

    [Column("width_px")]
    public double? Width { get; set; }

    [Column("height_px")]
    public double? Height { get; set; }

    [Column("reported_at")]
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
}
