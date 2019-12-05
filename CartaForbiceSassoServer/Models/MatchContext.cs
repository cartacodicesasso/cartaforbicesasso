using Microsoft.EntityFrameworkCore;

namespace CartaForbiceSassoServer.Models
{
    public partial class MatchContext : DbContext
    {
        public MatchContext() { }

        public MatchContext(DbContextOptions<MatchContext> options) : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlite("Data source=data.db");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

        public DbSet<Match> Matches { get; set; }
    }
}
