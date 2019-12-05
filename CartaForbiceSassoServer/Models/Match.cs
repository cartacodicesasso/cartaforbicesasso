using System.ComponentModel.DataAnnotations.Schema;

namespace CartaForbiceSassoServer.Models
{
    public class Match
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string Player1 { get; set; }
        public string Player2 { get; set; }
        public int Score1 { get; set; }
        public int Score2 { get; set; }
        public string Player1CurrentMove { get; set; }
        public string Player2CurrentMove { get; set; }
    }
}