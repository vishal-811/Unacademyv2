import { NextFunction, Request,Response } from "express";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ApiResponse } from "../lib/apiResponse";
import { UserTokenData } from "../ws/types";

dotenv.config();

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    if(req.session.userId){
        next();
    }
    if(req.headers.cookie){
        const cookie = req.headers.cookie;
        const token = cookie.split("=")[1];
        
        const isVerified = Jwt.verify(token, process.env.JWT_SECRET || "")
        if(!isVerified){
            return ApiResponse(res, 401, false, "Invalid token");
        }
         req.user = isVerified;
        next();
    }
    else{
        res.status(401).json({msg :"Unauthorized, Please signin firstly"});
        return;
    }
}