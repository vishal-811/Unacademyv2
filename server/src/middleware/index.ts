import { NextFunction, Request,Response } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    if(req.session.user){
        // console.log(req.session.user);
        next();
    }
    else{
        res.status(401).json({msg :"Unauthorized, Please signin firstly"});
        return;
    }
}