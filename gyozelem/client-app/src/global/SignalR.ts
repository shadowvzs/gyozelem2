import * as signalR from "@microsoft/signalr";

export const getSignalRConnection = async () => {
    try {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/signalr")
            .build();
        
        await connection.start();
        // connection.invoke("send", "Hello");
        return connection;
    } catch(err) {
        console.error(err);
    }
    return;
}