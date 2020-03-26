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
        private readonly string[] moves = new string[] { MoveType.Rock, MoveType.Paper, MoveType.Scissors };

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

            await Clients.Group(match.Id).SendAsync("MatchCreated", match.Id);
        }

        public async Task JoinMatch(string matchId)
        {
            var match = await database.Matches.FindAsync(matchId);

            if (match == null)
            {
                await Clients.Caller.SendAsync("Error", MatchErrorType.MatchNotFound);
                return;
            }

            if (!String.IsNullOrWhiteSpace(match.Player2))
            {
                await Clients.Caller.SendAsync("Error", MatchErrorType.Cicciah);
                return;
            }

            match.Player2 = Context.ConnectionId;
            match.Score1 = 3;
            match.Score2 = 3;

            database.Matches.Update(match);
            await database.SaveChangesAsync();

            await Groups.AddToGroupAsync(Context.ConnectionId, matchId);

            await Clients.Group(matchId).SendAsync("BeginMatch");
        }

        public async Task ResetMatch()
        {
            var match = database.Matches.FirstOrDefault(m => m.Player1 == Context.ConnectionId || m.Player2 == Context.ConnectionId);
            const string reset = "Reset";

            if (match.Player1 == Context.ConnectionId)
            {
                match.Player1CurrentMove = reset;
                match.Score1 = 3;
            }
            else
            {
                match.Player2CurrentMove = reset;
                match.Score2 = 3;
            }

            var isResetConfirmed = match.Player1CurrentMove == reset && match.Player2CurrentMove == reset;

            if (isResetConfirmed)
            {
                match.Player1CurrentMove = null;
                match.Player2CurrentMove = null;
            }

            database.Matches.Update(match);
            await database.SaveChangesAsync();

            if (isResetConfirmed)
            {
                await Clients.Group(match.Id).SendAsync("BeginMatch");
            }
        }

        public async Task SendMove(string move)
        {
            var match = database.Matches.FirstOrDefault(m => m.Player1 == Context.ConnectionId || m.Player2 == Context.ConnectionId);

            if (match == null)
            {
                return;
            }

            if (match.Player1 == Context.ConnectionId)
            {
                match.Player1CurrentMove = move;
            }
            else
            {
                match.Player2CurrentMove = move;
            }

            if (match.Player1CurrentMove == null || match.Player2CurrentMove == null)
            {
                database.Matches.Update(match);
                await database.SaveChangesAsync();
                return;
            }

            var winner = match.Player1CurrentMove == match.Player2CurrentMove ? "even" : (
                moves[(Array.IndexOf(moves, match.Player1CurrentMove) + 1) % 3] == match.Player2CurrentMove ? "player2" : "player1"
            );

            const string rr = "RoundResult";
            var player1Result = "even";
            var player2Result = "even";

            switch (winner)
            {
                case "player1":
                    player1Result = "win";
                    player2Result = "lose";
                    match.Score2--;
                    break;
                case "player2":
                    player1Result = "lose";
                    player2Result = "win";
                    match.Score1--;
                    break;
            }

            var p1 = Clients.Client(match.Player1).SendAsync(
                rr,
                player1Result,
                match.Score1,
                match.Score2,
                match.Player2CurrentMove
            );

            var p2 = Clients.Client(match.Player2).SendAsync(
                rr,
                player2Result,
                match.Score2,
                match.Score1,
                match.Player1CurrentMove
            );

            match.Player1CurrentMove = null;
            match.Player2CurrentMove = null;

            database.Matches.Update(match);
            await database.SaveChangesAsync();

            await Task.WhenAll(p1, p2);
        }
    }

    public static class MatchErrorType
    {
        public const string MatchNotFound = "MatchNotFound";
        public const string MatchCreationFailed = "MatchCreationFailed";
        public const string Cicciah = "Cicciah";
    }

    public static class MoveType {
        public const string Rock = "rock";
        public const string Paper = "paper";
        public const string Scissors = "scissors";
    }
}
