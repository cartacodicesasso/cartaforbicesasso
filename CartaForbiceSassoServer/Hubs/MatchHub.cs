using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace CartaForbiceSassoServer.Hubs
{
    public class MatchHub : Hub
    {
        public async Task SendMove(string player, string move)
        {
            await Clients.All.SendAsync("ReceiveMove", player, move);
        }
    }
}
