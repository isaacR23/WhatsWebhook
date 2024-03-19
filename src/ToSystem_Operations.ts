const Ably = require('ably');

// Define the Ably API key and the Ably channel name for basketball scores
const ABLY_API_KEY = "fjRlSg.efu6iw:oJKmI05Aus7pvN0zfueGs3pT5NIRPPejWfYMcyr2WM8";
const BASKETBALL_CHANNEL_NAME = "raw-aid-boo";

// Initialize the Ably client with the API key and get the basketball channel
const client = new Ably.Realtime(ABLY_API_KEY);
const basketballChannel = client.channels.get(BASKETBALL_CHANNEL_NAME);



// Function to subscribe to the basketball channel
function subscribeToBasketball() {
  // Subscribe to the basketball channel
  basketballChannel.subscribe((message : object) => {
    // Handle incoming messages from the basketball channel
    // console.log('Example of type of message: ', typeof(message))
    console.log("Received message:", message);

    // Perform any additional logic with the received message data
    // ...
  });
}

// Function to unsubscribe from the basketball channel
function unsubscribeFromBasketball() {
  // Unsubscribe from the basketball channel
  basketballChannel.unsubscribe();
}

// Call the subscribeToBasketball function to start receiving messages
subscribeToBasketball();

// Call the unsubscribeFromBasketball function to stop receiving messages
// unsubscribeFromBasketball();