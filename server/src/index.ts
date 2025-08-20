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
import { createClient } from "redis";

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
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["https://learntrack.vishalsharma.xyz", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicitly handle OPTIONS
app.options("*", cors({
  origin: ["https://learntrack.vishalsharma.xyz", "http://localhost:5173"],
  credentials: true
}));



const server = http.createServer(app);

export const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket, req) => {
  //  @ts-ignore
  const ParsedUrl = url.parse(req.url, true);
  const token = ParsedUrl.query.token as string;
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
  res.send("ok");
});

export const Client = createClient({
  url: "redis://unacademy-redis:6379",
});

(async () => {
  try {
    await Client.connect();
    console.log("connected to the redis successfully");
  } catch (error) {
    console.log(error);
    console.log("error while connecting to the redis");
  }
  server.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
})();
