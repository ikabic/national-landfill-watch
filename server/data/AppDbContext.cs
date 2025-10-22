using Microsoft.EntityFrameworkCore;
using server.models;
using NetTopologySuite.Geometries;
using server.models;
using server.dtos;


namespace server.data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Landfill> Landfills { get; set; }
        public DbSet<RegisterLandfill> RegisterLandfills { get; set; }


        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<LandfillCheckPointDto> LandfillCheckPointDto { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Landfill>().ToTable("landfills");
            modelBuilder.Entity<RegisterLandfill>().ToTable("register_landfills"); // poveži model s tabelom

            modelBuilder.Entity<Landfill>(entity =>
            {
                // Mapiranje PostGIS geom kolone
                entity.Property(e => e.Geom)
                      .HasColumnName("geom")
                      .HasColumnType("geography (Point, 4326)");

                // Ignoriši UserData koji dolazi iz NetTopologySuite Point
                entity.Ignore("UserData");
            });

            modelBuilder.Entity<LandfillCheckPointDto>(eb =>
            {
                eb.HasNoKey();
                eb.ToView(null); // ne mapira se na tabelu
            });
        }
    }
}
