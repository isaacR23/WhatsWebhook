import { Hono } from 'hono'
var xhub = require('express-x-hub');
import { jwt } from 'hono/jwt'
// import { rawBody } from 'raw-body'
// var bodyParser = require('body-parser');
const crypto = require('crypto');
const app = new Hono()
const token = process.env.TOKEN || 'token';
const received_updates: any[] = [];
console.log()

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


///////////////////////
// middleware logic: The middleware logic function as a stair, first down then up , 

// app.use(async(c, next) => {
//   // Check if is json
//   if (_.req.json()){
//     element_json = true
//   }else(next())
//   // Check the header is X-Hub
//   const heads = await c.req.header('X-Hub-Signature') // This returns a sha1 code - wtf
//   if(heads){
//     element_head = true
//   }else(next)
//   // if both are true then get leanth of sha1 code from header X-hub
//   incoming_req.lenght = c.req.header('content-lenght')
//   // set raw options

//   var rawOptyions = {length: length,
//                       limit: '100kb',
//                       encoding: 'utf-8'}
  
//   rawbody(c.req, rawOptyions, (err, ctx) => {
//     if(err){return next()}
//     // make a new signature here
//     var xHubSignature = ctx.req.header('X-Hub-Signature');
//     var signature = new Signature(xHubSignature, {algorithm, secret})
//   })

//   // sign the body and header with the signature
//   signature.attach(req, buffer);

//   // parse the incoming json
//   const body = await c.req.parseBody()

//   console.log('tHIS IS The value of the headers: ',heads)
//   await next()
// })
// app.use(async(_, next) => {
//   console.log('this is the value of the second next')
//   await next()
// })

// The thing below supposedly should do all the work you have to, however you are not sure of the
// values jwt has
// app.use('*',jwt({secret: 'c1df28fb46b382cc63eb83973c034265', alg:'HS256'}))

// The next middleware actually is just checking that the incoming request checks with the secret
// variable we have set, if not then it filters. 
  app.use(
    '/facebook',
    jwt({
      secret: 'c1df28fb46b382cc63eb83973c034265',
      alg:'HS256'
    })
  )
// The following is executed only once then returns on reverse order
app.post('/facebook', async (c) => {
  // console.log('result of body', await c.req)
  // console.log('full url', await c.req.url)
  // console.log('the next is the cache body', await c.req.bodyCache)
  // console.log('the next is the headers', await c.req.header())
  // We need to validate incoming sha-256 header with the payload + app secret
  // extracting the header
  const long_hash = c.req.header('x-hub-signature-256')

  // After validate the endpoint the information should be someware in the request, is jus not in the body
  // console.log('the next is a validated data: ', await c.req.addValidatedData)
  // console.log('the next is a array buffer data: ',await c.req.arrayBuffer())
  // console.log('the next is a block data: ',await c.req.blob)
  // console.log('the next is a bodyCache data: ', await c.req.bodyCache)
  // console.log('the next is a header data: ',await c.req.header())
  // console.log('the next is a matchedRoutes data: ',await c.req.matchedRoutes)
  // console.log('the next is a method data: ',await c.req.method)
  // console.log('the next is a params data: ',await c.req.param())
  // console.log('the next is a parseBody data: ',await c.req.parseBody())
  // console.log('the next is a path data: ',await c.req.path)
  // console.log('the next is a queries data: ',await c.req.queries())
  // console.log('the next is a query data: ',await c.req.query())
  // console.log('the next is a raw data: ',await c.req.raw)
  // console.log('the next is a routeIndex data: ',await c.req.routeIndex)
  // console.log('the next is a routePath data: ',await c.req.routePath)
  // console.log('the next is a text data: ',await c.req.text())
  // console.log('the next is a url data: ',await c.req.url)

  // make a new hash
  // const hash_key_my = await jwt({secret: 'c1df28fb46b382cc63eb83973c034265', alg:'HS256'})
  // console.log('x-hub header: ', long_hash, '::::: Your hash_key: ', hash_key_my)
  // console.log('argument from hashkey: Symbol ', hash_key_my[Symbol])
  // console.log('argument from hashkey: apply ', hash_key_my.apply())
  // console.log('argument from hashkey: arguments ', hash_key_my.arguments)
  // console.log('argument from hashkey: caller ', hash_key_my.caller)
  // console.log('argument from hashkey: length ', hash_key_my.length)
  // console.log('argument from hashkey: name ', hash_key_my.name)
  // console.log('argument from hashkey: prototype ', hash_key_my.prototype)
  // console.log('argument from hashkey: toString ', hash_key_my.toString())

  // The variable jwtPayload exist if the middleware jwt is present in a middleware function jwt from hono

  // console.log('payload value for status: ', c.json(payload).status)
  // if(c.json(payload).ok){
  //   return  c.body('OK HTTPS',200)}
  let data = await c.req.arrayBuffer()
  let data2 = Buffer.from(data)
  // The next works, it sucessfullt output a similar key as the one received. However note: You CANT separate into pieces update and digest, has to be one line
  // console.log('the next is the inputed dta: ',data2)
  // const hmac = crypto.createHmac('sha256', 'c1df28fb46b382cc63eb83973c034265').update(data).digest('hex')
  const hmac = crypto.createHmac('sha256', 'c1df28fb46b382cc63eb83973c034265').update(data2, 'utf-8').digest('hex')

  console.log('x-hub header: ', long_hash, '::::: Your hash_key: ', hmac)

  // let data2 = Buffer.from(data)
  try{
    console.log('parsed buffer json: ',JSON.parse(data2.toString()))
  }catch(e){

  }

  const payload = c.get('jwtPayload')
  console.log('payload value: ', c.json(payload)) 

  return c.json(payload)

})

// end of middleware
///////////////////////
export default {
  port: 80,
  fetch: app.fetch
}