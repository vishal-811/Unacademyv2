import express from "express";
import cors from "cors";
import http from "http";
import { initPassport } from "./passportconfig";
import passport from "passport";
import session from "express-session";
import rootRouter from "./routes/index";
import WebSocket, { WebSocketServer } from "ws";
import { handleWebsocketCloseEvent, handleWebsocketMessageEvent } from "./ws";
import url from "url";
import { extractAuthUser } from "./ws/auth/JwtHelper";

const app = express();

app.use(
  session({
    secret: "Hello",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 100, sameSite: "none" },
  })
);
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const server = http.createServer(app);

export const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket, req) => {
  //  @ts-ignore
  const token = url.parse(req.url, true).query.token as string;
  const userToken = extractAuthUser(token, ws);
  if (userToken === null) {
    ws.send(JSON.stringify({ msg: "Please provide a valid token" }));
    return;
  }
  ws.on("error", (error) => {
    console.error(error);
  });
  ws.on("message", (message: any) => {
    handleWebsocketMessageEvent(message, ws, userToken);
  });
  ws.on("close", () => {
    handleWebsocketCloseEvent();
  });
});

initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", rootRouter);
app.get("/", (req, res) => {
  console.log(req.cookies);
  console.log(req);
  res.send("hehe");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
