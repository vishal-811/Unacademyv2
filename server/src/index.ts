import express from 'express';
import cors from 'cors';
import { initPassport } from './passportconfig';
import passport from 'passport'
import session from "express-session"
import rootRouter from "./routes/index"

const app=express();
app.use(session({
    secret :"Hello",
    resave : false,
    saveUninitialized : false,
    cookie :{secure : false , maxAge : 24 * 60 * 60 * 100}
}))
app.use(express.json());
app.use(cors());

initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1",rootRouter);


app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})