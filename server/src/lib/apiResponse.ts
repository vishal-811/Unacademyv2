import { Response } from "express";

export const ApiResponse = (
    res: Response,
    code: number,
    success: boolean,
    message: string 
) => {
    res.status(code).json({
        success: success,
        message: message,
    });
    return;
};

export const ApiSuccessResponse = (
    res: Response,
    code: number,
    success: boolean,
    message: string,
    data?: object | string
) => {
    res.status(code).json({ success: success, message: message, data: data });
    return;
};


//  const responseMessage = error instanceof Error ? error.message : message ?? "Internal Server Error"