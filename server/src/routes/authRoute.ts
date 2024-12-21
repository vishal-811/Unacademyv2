import { Router, Request, Response } from "express";
import passport from "passport";
import { SignupSchema, SigninSchema } from "../zodSchema"
import bcrypt from 'bcrypt'
import Prisma from "../lib/index";
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const CLIENT_URL = "http://localhost:5173/";

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: string };
  }
}


router.post("/signup", async (req: Request, res: Response) => {
  const signupPayload = SignupSchema.safeParse(req.body);
  if (!signupPayload.success) {
    res.status(401).json({ msg: "Please Provide a valid inputs" });
    return;
  }

  try {
    const { username, email, password, role } = signupPayload.data;

    const isUserAlreadyExist = await Prisma.user.findFirst({
      where: {
        email: email
      }
    })

    if (isUserAlreadyExist) {
      res.status(409).json({ msg: "User already exist with this credentials" });
      return;
    }

    const hashesPassword = await bcrypt.hash(password, 10);
    const isadmin = role === 'instructor';
    const user = await Prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashesPassword,
        isAdmin: isadmin
      }
    })
    // const token = Jwt.sign(user.id, process.env.JWT_SECRET || '');
    // res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 });
    req.session.user = {id: user.id};
    res.status(201).json({ msg: "Signup sucessfull" , session : req.session});
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  const signinPayload = SigninSchema.safeParse(req.body);
  if (!signinPayload.success) {
    res.status(401).json({ msg: "Please provide a valid inputs" });
    return;
  }

  try {
    const { username, password, role } = signinPayload.data;
    const isUserExist = await Prisma.user.findFirst({
      where: {
        username: username
      }
    })

    if (!isUserExist) {
      res.status(401).json({ msg: "Wrong credentials, please Signup!" });
      return;
    }
    if (!password || !isUserExist.password) {
      throw new Error("Password is required and must not be null or undefined");
    }
    const verifyPassword = bcrypt.compare(password, isUserExist.password);
    if (!verifyPassword) {
      res.status(401).json({ msg: "Wrong password" });
      return;
    }
    // const admin = role === 'instructor';
    // if (isUserExist.isAdmin === admin) {
    //   res.status(401).json({ msg: "Please choose a valid role" });
    //   return;
    // }
    // const token = Jwt.sign(isUserExist.id, process.env.JWT_SECRET || "");
    // res.cookie('token', token)
    req.session.user = {id : isUserExist.id};
    res.status(200).json({ msg: "Login Successful" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "http://localhost:3000/api/v1/auth/signin",
  })
);

export default router;
