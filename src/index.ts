import { Hono } from 'hono'
const crypto = require('crypto');
const app = new Hono()
const token = process.env.TOKEN || 'token';
const received_updates: any[] = [];
const Ably = require('ably')

// Validate the endpoint from facebook:
// What it does? - It receives a get request from 
// facebook sent to the endpoint URL/facebook
// and check the query string of that request to
// 1) make sure the hub mode is equal to subscribe,
// 2) the token matched the specified token
// 3) ALWAYS responde with something if 1 and 2 are true
// this can be the same value as hub challenge, but MUST
// also be equal to '' if no values are sent from facebook
app.get('/facebook', async (c) => {
  console.log('this is the value of the get: ', c.req)
  if (
    c.req.query('hub.mode') == 'subscribe' &&
    c.req.query('hub.verify_token') == 'TEST'
  ) {
    return c.text(c.req.query('hub.challenge') ?? '') 
  } else {
    return c.status(400);
  }
})


// Start of the middle ware

// The next checks that the signature is expected
app.use(async (_, next) => {

  console.log('middleware 1 start')
  // console.log(_.req.header())
  
  let data = Buffer.from(await _.req.arrayBuffer())
  let hmac = 'sha256=' + crypto.createHmac('sha256', 'c1df28fb46b382cc63eb83973c034265').update(data, 'utf-8').digest('hex')
  // console.log('your hmac: ', hmac)

  if(_.req.header('x-hub-signature-256') != hmac){ 

    // some logic to send to error
    return _.text('Invalid signature', 400);

  }else if(_.req.header('x-hub-signature-256') == hmac){
    console.log('Your signature matches!')
    await next()
  }

  console.log('middleware 1 end')
  }
)

// The next check that the json behaves as expected
app.use(async (_, next) => {
  console.log('middleware 2 start')
  let response_buffer = await _.req.arrayBuffer()
  let length_response = (response_buffer).byteLength
  let lenght_header = await _.req.header('content-length')
  // Check that the lenght is the same as expected
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

  // await next()
  console.log('middleware 2 end')
})

// The next parses the json into a readable content - this would be the handler
// this should also respondo with a 200 ok
app.post('/facebook', async (c) => {
  // console log the content of the incoming message
  console.log('you are in handler?');
  console.log(c.req);
  try {
    let data1 = Buffer.from(await c.req.arrayBuffer());
    let data2 = data1.toString();

    const msg = JSON.parse(data2);
    console.log('type of: ', typeof(msg));
    
    let sent = await publish(msg)
    return c.body('200 OK HTTPS')
  } catch (e) {
    return c.text('Not possible to convert to JSON', 400);
  }
  
});

////////
// Define the Ably API key and the Ably channel name for basketball scores
const ABLY_API_KEY = "fjRlSg.efu6iw:oJKmI05Aus7pvN0zfueGs3pT5NIRPPejWfYMcyr2WM8";
const BASKETBALL_CHANNEL_NAME = "raw-aid-boo";
console.log('line 115')
// Initialize the Ably client with the API key and get the basketball channel
const client = new Ably.Rest.Promise({key: ABLY_API_KEY});
console.log('line 120')
const basketballChannel = client.channels.get(BASKETBALL_CHANNEL_NAME);
/////////

// Function to publish data to the basketball channel
async function publish(payload: object) {

  await basketballChannel.publish('scoreUpdate', payload);

  console.log('Publishing message:', payload);
  console.log('type of: ', typeof(payload))
  return true
}


// end of all middleware
// AQUI TE QUEDASTE: ahora que ya tienes el objeto json que querias
// tienes que revisar que lo puedas acceder desde otras rutas de tu codigo. Para esto esta
// la optcion de grouping para mandar a distintas partes o peor de los casos fallback pero no recomendado
// porque podria ser una vulnerabilidad. Nota, en hono existen propios fallbacks- No, pensadolo bien para eso
// tienes el middleware de las funciones. Un fallback esta bien

// app.post('/facebook/*').then((data => {
//   console.log(data)
//   return '200 OK HTTPS'
// }))


export default {
  port: 80,
  fetch: app.fetch
}