import { Router, Request, Response } from "express";
import passport from "passport";
import { SignupSchema, SigninSchema } from "../schemas/ZodSchema";
import bcrypt from "bcrypt";
import Prisma from "../lib/index";
import dotenv from "dotenv";
import Jwt from "jsonwebtoken";
import { ApiResponse, ApiSuccessResponse } from "../lib/apiResponse";

dotenv.config();

const router = Router();
const CLIENT_URL = "http://localhost:5173/";

declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: string };
  }
}

router.post("/signup", async (req: Request, res: Response) => {
  const signupPayload = SignupSchema.safeParse(req.body);
  if (!signupPayload.success)
    return ApiResponse(res, 401, false, "Please provide all the inputs fields");

  try {
    const { username,email, password, role } = signupPayload.data;

    const isUserAlreadyExist = await Prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (isUserAlreadyExist)
      return ApiResponse(
        res,
        409,
        false,
        "User already exist with this credentials"
      );

    const hashesPassword = await bcrypt.hash(password, 10);
    const isadmin = role === "instructor";

    const user = await Prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashesPassword,
        isAdmin: isadmin,
      },
    });

    const admin = role === "instructor";
    const token = Jwt.sign(
      { userId: user.id, isadmin: admin },
      process.env.JWT_SECRET || ""
    );
    
    res.cookie("token", token);
    return ApiSuccessResponse(res, 201, true, "User Signup Sucessfully", { role : role });
  } catch (error) {
    return ApiResponse(res, 500, false, "Internal Server Error");
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  const signinPayload = SigninSchema.safeParse(req.body);
  if (!signinPayload.success)
    return ApiResponse(res, 401, false, "Please provide all the inputs fields");

  try {
    const { email, password, role } = signinPayload.data;
    const isUserExist = await Prisma.user.findFirst({
      where: {
        email:email ,
      },
    });

    if (!isUserExist) return ApiResponse(res, 403, false, "User not exists");

    if (!password || !isUserExist.password)
      return ApiResponse(
        res,
        401,
        false,
        "Password is required and must not be null or undefined"
      );

    const verifyPassword = bcrypt.compare(password, isUserExist.password);
    if (!verifyPassword) return ApiResponse(res, 401, false, "Wrong password");

    const admin = role === "instructor";
    const token = Jwt.sign(
      { userId: isUserExist.id, isAdmin: admin },
      process.env.JWT_SECRET || ""
    );
    res.cookie("token", token);

    return ApiSuccessResponse(res, 200, true, "Login Success", { role : role });
  } catch (error) {
    console.log("error", error);
    return ApiResponse(res, 500, false, "Internal Server Error");
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
