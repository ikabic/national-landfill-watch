using Microsoft.EntityFrameworkCore;
using server.models;

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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Landfill>().ToTable("landfills");
            modelBuilder.Entity<RegisterLandfill>().ToTable("register_landfills"); // poveži model s tabelom
        }
    }
}
