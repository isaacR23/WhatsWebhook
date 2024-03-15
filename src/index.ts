import { Hono } from 'hono'
var xhub = require('express-x-hub');
import { jwt } from 'hono/jwt'
import { prettyJSON } from 'hono/pretty-json'
// var bodyParser = require('body-parser');
const crypto = require('crypto');
import { sentry } from '@hono/sentry'
const app = new Hono()

app.use('*', sentry())
app.use(prettyJSON())


// app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));

// app.use(jwt({ algorithm: 'sha1', secret: process.env.APP_SECRET }))



const token = process.env.TOKEN || 'token';
const received_updates: any[] = [];



app.get('/', (c) => {
  console.log(c.req)
  return c.html('<pre>' + JSON.stringify(received_updates,null,2) + '<pre>')
})

app.on('GET', ['/facebook','/instagram'], (c) => {
  if(
    c.req.query('hub.mode') === 'subscribe' &&
    c.req.query('hub.verify_token') === token
  ){
    return c.text(c.req.query('hub.challenge') ?? '')
  } else {
    return c.text('Bad Request',400)
  }
})

// app.post('/facebook', async (c) => {
//   const body = c.req.json();
//   console.log('Facebook request body:', body)
//   if (!c.req.isXHubValid()){
//     console.log('Warning - request header X-Hub-Signature not present or invalid');

//     return c.text('Unauthorized', 401);
//   }

//   console.log('request header X-Hub-Signature validated');
//   // Process the Facebook updates here
//   received_updates.unshift(body);
//   return c.status(200)

// })

//////////////////////////////////////////////

const verifyXHubSignature = app.use('/facebook', async (c, next) => {
  const signature = c.req.header('X-Hub-Signature');
  const body = await c.req.parseBody();
    const expectedSignature = `sha1=` +
    crypto
      .createHmac('sha1', process.env.APP_SECRET)
      .update(body, 'utf-8')
      .digest('hex');

  if (signature !== expectedSignature) {
    return c.text('Unauthorized', 401);
  }

  // Add the parsed body to the context for later routes to access
  // c.req.param('body') = body

  await next();
});


app.post('/facebook', async (c) => {
  const body = c.req.query('body'); // Now you can access the parsed body directly
  console.log('Facebook request body:', body);
  
  // Your processing logic here

  return c.text('OK', 200);
});


//////////////////////////////////////////////


app.post('/instagram',  async (c) => {
  const body = await c.req.parseBody();
  console.log('Instagram request body:');
  console.log(body);
  // Process the Instagram updates here
  received_updates.unshift(body);
  return c.status(200);
});

// http://localhost:3000 whatch on your browser the results
export default { 
  port: 3000, 
  fetch: app.fetch, 
} 
