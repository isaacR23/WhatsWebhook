
import { Hono } from 'hono'
var xhub = require('express-x-hub');
import { jwt } from 'hono/jwt'
import { prettyJSON } from 'hono/pretty-json'
// var bodyParser = require('body-parser');
var xhub = require('express-x-hub');
const crypto = require('crypto');
const app = new Hono()
const token = process.env.TOKEN || 'token';
const received_updates: any[] = [];

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));

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

app.post('/facebook', async (c) => {
  const body = await c.req.parseBody();
  console.log('Facebook request body:');
  
  // Your processing logic here
  console.log(body);
  // Process the Instagram updates here
  received_updates.unshift(body);
  
  return c.text('OK', 200);
});

app.post('/instagram',  async (c) => {
  const body = await c.req.parseBody();
  console.log('Instagram request body:');
  console.log(body);
  // Process the Instagram updates here
  received_updates.unshift(body);
  return c.status(200);
});

// http://localhost:3000 whatch on your browser the results
export default app
