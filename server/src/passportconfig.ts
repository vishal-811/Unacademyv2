import passport from "passport";
import { Strategy as GoogleStartegy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import dotenv from "dotenv";
import Prisma from "./lib/index"

dotenv.config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "Your_Google_Client_Id";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "Your_Google_Client_Secret";


export function initPassport() {
passport.use(new LocalStrategy(
  (username,password,role)=>{
    
  }
) )


  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google ENV variables are missing");
  }

  passport.use(
    new GoogleStartegy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "https://prawn-intense-crane.ngrok-free.app/api/v1/auth/google/callback",
        scope :['email','profile']
      },
      async function (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void
      ) {
         try {
          const user = await Prisma.user.upsert({
            create:{
              email :profile.emails[0].value,
            },
            update:{
              email :profile.emails[0].value,
            },
            where:{
              email :profile.emails[0].value,
            }
          })
  
          done(null,user);
         } catch (error) {
          done(error,false);
         }
      }
    )
  );
}


passport.serializeUser(function (user: any, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
    });
  });
});

passport.deserializeUser(function (user: any, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});
