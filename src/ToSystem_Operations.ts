const Ably = require('ably');

// Define the Ably API key and the Ably channel name for basketball scores
const BASKETBALL_CHANNEL_NAME = "raw-aid-boo";

// Initialize the Ably client with the API key and get the basketball channel
const client = new Ably.Realtime(process.env.ABLY_API_KEY);
const basketballChannel = client.channels.get(BASKETBALL_CHANNEL_NAME);




basketballChannel.subscribe((message : object) => {
    
    // Print the received information
    console.log("Received message:", message);

});
