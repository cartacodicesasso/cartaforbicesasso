using System;
using System.Linq;
using System.Runtime.Serialization;
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

            try
            {
                await database.SaveChangesAsync();
            }
            catch
            {
                await Clients.Caller.SendAsync("Error", MatchErrorType.MatchCreationFailed);
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, match.Id);

            await Clients.Caller.SendAsync("MatchCreated", match.Id);
        }

        public async Task JoinMatch(string matchId)
        {
            var match = await database.Matches.FindAsync(matchId);

            if (match == null)
            {
                await Clients.Caller.SendAsync("Error", MatchErrorType.MatchNotFound);
                return;
            }

            match.Player2 = Context.ConnectionId;

            database.Matches.Update(match);
            await database.SaveChangesAsync();

            await Groups.AddToGroupAsync(Context.ConnectionId, matchId);
            
            await Clients.Group(matchId).SendAsync("BeginMatch");
        }

        public async Task SendMove(string player, string move)
        {
            await Clients.All.SendAsync("ReceiveMove", player, move);
        }
    }

    public static class MatchErrorType
    {
        public const string MatchNotFound = "MatchNotFound";
        public const string MatchCreationFailed = "MatchCreationFailed";
    }
}
