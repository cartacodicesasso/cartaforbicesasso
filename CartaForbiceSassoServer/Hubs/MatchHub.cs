using System;
using System.Linq;
using System.Threading.Tasks;
using CartaForbiceSassoServer.Models;
using Microsoft.AspNetCore.SignalR;

namespace CartaForbiceSassoServer.Hubs
{
    public class MatchHub : Hub
    {
        private readonly MatchContext database;

        public MatchHub(MatchContext database)
        {
            this.database = database;
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var match = database.Matches.FirstOrDefault(m => m.Player1 == Context.ConnectionId || m.Player2 == Context.ConnectionId);

            if (match == null)
            {
                return;
            }

            database.Remove(match);
            await database.SaveChangesAsync();
            
            await Clients.Group(match.Id).SendAsync("GameOver");

            if (match.Player1 != null)
            {
                await Groups.RemoveFromGroupAsync(match.Player1, match.Id);
            }
            
            if (match.Player2 != null)
            {
                await Groups.RemoveFromGroupAsync(match.Player2, match.Id);
            }
        }

        public async Task CreateMatch()
        {
            var match = new Match
            {
                Player1 = Context.ConnectionId
            };

            database.Matches.Add(match);
            await database.SaveChangesAsync();

            await Groups.AddToGroupAsync(Context.ConnectionId, match.Id);
        }

        public async Task SendMove(string player, string move)
        {
            await Clients.All.SendAsync("ReceiveMove", player, move);
        }
    }
}
