import { Hono } from 'hono'
const crypto = require('crypto');
const app = new Hono()
const token = process.env.TOKEN || 'token';
const received_updates: any[] = [];
const Ably = require('ably')

// Validate the endpoint from facebook
app.get('/facebook', async (c) => {
  console.log('this is the value of the get: ', c.req)
  if (
    c.req.query('hub.mode') == 'subscribe' &&
    c.req.query('hub.verify_token') == process.env.META_TOKEN
  ) {
    return c.text(c.req.query('hub.challenge') ?? '') 
  } else {
    return c.status(400);
  }
})


// Start of the middle ware


app.use(async (_, next) => {
  
  // Signature Check
  let data = Buffer.from(await _.req.arrayBuffer())
  let hmac = 'sha256=' + crypto.createHmac('sha256', process.env.APP_SECRET).update(data, 'utf-8').digest('hex')

  if(_.req.header('x-hub-signature-256') != hmac){ 

    return _.text('Invalid signature', 400);

  }else if(_.req.header('x-hub-signature-256') == hmac){

    console.log('Your signature matches!')
    await next()
  }

  console.log('middleware 1 end')
  }
)


// Check JSON object
app.use(async (_, next) => {

  let response_buffer = await _.req.arrayBuffer()
  let length_response = (response_buffer).byteLength
  let lenght_header = await _.req.header('content-length')

  if( lenght_header != length_response.toString()){
    return _.text('Lenght is corrupted', 400);
  }else{
    if(length_response == 0){
      return _.text('Invalid empty response', 400);
    }
    var first = response_buffer.toString().trim()[0];
    if (first !== '{' && first !== '['){
      return _.text('Unable to parse into strict json', 400);
    }
    console.log('Your json is approved!')
    await next()

  }

  console.log('middleware 2 end')
})



app.post('/facebook', async (c) => {

  try {
    // Parse the message
    let data1 = Buffer.from(await c.req.arrayBuffer());
    let data2 = data1.toString();
    const msg = JSON.parse(data2);

    // Publish message
    let sent = await publish(msg)
    // Respond to fb
    return c.body('200 OK HTTPS')
  } catch (e) {
    return c.text('Not possible to convert to JSON', 400);
  }
  
});

// Set ABLY variables
const client = new Ably.Rest.Promise({key: process.env.ABLY_API_KEY});
const BASKETBALL_CHANNEL_NAME = "raw-aid-boo";
const basketballChannel = client.channels.get(BASKETBALL_CHANNEL_NAME);


// The next is the function to publish to the message
async function publish(payload: object) {

  // We sent information to channel raw-aid-boo, topic (scoreUpdate)
  // Note: Topics are not needed but is a good practice to send with each message
  // Instead of open a new channel
  await basketballChannel.publish('scoreUpdate', payload);

  console.log('Publishing message:', payload);
  console.log('type of: ', typeof(payload))
  return true
}

export default {
  port: 80,
  fetch: app.fetch
}