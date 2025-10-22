using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.models
{
    [Table("register_landfills")]
    public class RegisterLandfill
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("type")]
        public string Type { get; set; } = string.Empty;

        [Column("lat")]
        public double Lat { get; set; }

        [Column("lon")]
        public double Lon { get; set; }

        [Column("start_year")]
        public int StartYear { get; set; }

        [Column("life_years")]
        public int LifeYears { get; set; }

        [Column("total_mass_ton")]
        public double TotalMassTon { get; set; }

        [Column("area_m2")]
        public double AreaM2 { get; set; }

        [Column("volume_m3")]
        public double VolumeM3 { get; set; }

        [Column("annual_msw_ton")]
        public double AnnualMswTon { get; set; }

        [Column("annual_ch4_tonnes")]
        public double AnnualCH4Tonnes { get; set; }

        [Column("annual_co2e_tonnes")]
        public double AnnualCO2eTonnes { get; set; }
    }
}
