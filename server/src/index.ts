import express from 'express';
import cors from 'cors';
import http from 'http';
import { initPassport } from './passportconfig';
import passport from 'passport'
import session from "express-session"
import rootRouter from "./routes/index"
import WebSocket,{ WebSocketServer } from 'ws';
import { handleWebsocketMessageEvent } from './ws';
import url from "url";
import { extractAuthUser } from './ws/auth';

const app=express();

app.use(session({
    secret :"Hello",
    resave : false,
    saveUninitialized : false,
    cookie :{secure : false , maxAge : 24 * 60 * 60 * 100}
}))
app.use(express.json());
app.use(cors());


const server = http.createServer(app);

export const wss = new WebSocketServer({ server });

wss.on('connection',(ws,req)=>{
  //  @ts-ignore
   const token = url.parse(req.url, true).query.token as string;
   const user = extractAuthUser(token, ws)
   ws.on('error',(error)=>{
     console.error(error);
   })
   ws.on('message',(message :string,ws : WebSocket)=>{
    handleWebsocketMessageEvent(message,ws);
   })
})


initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1",rootRouter);


server.listen(3000,()=>{
    console.log("Server is running on port 3000");
})