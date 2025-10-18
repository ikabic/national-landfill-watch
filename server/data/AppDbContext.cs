using Microsoft.EntityFrameworkCore;

namespace server.data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Landfill> Landfills { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
    }
}
