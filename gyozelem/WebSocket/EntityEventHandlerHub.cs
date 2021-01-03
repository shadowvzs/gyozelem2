using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.SignalR;

namespace WebSocket
{
    public class EntityEventHandlerHub : Hub
    {
        // maybe if we need for something, i not decided yet
        public async Task Send(string clientMessage)
        {
            Console.WriteLine("[WS] client sent to server: " + clientMessage);
            await Clients.All.SendAsync("SendKey", "Message");
        }
    }

    public class EntityMessage
    {
        public string Name;
        public string State;
        public dynamic Entity;

        public EntityMessage(string entityName, string stateType, dynamic entity)
        {
            Name = entityName;
            State = stateType;
            Entity = entity;
        }
    }
}