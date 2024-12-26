import { Router, Request, Response } from "express";
import prisma from "../lib";
import { CreateRoomSchema } from "../schemas/ZodSchema";
import { authMiddleware } from "../middleware";
import { ApiResponse, ApiSuccessResponse } from "../lib/apiResponse";
const router = Router();

router.post(
    "/createRoom",
    authMiddleware,
    async (req: Request, res: Response) => {
        const CreateRoomPayload = CreateRoomSchema.safeParse(req.body);
        if (!CreateRoomPayload.success) return ApiResponse(res, 401, false, "Please Provide all the inputs fields");

        try {
            let userId = req.session.userId;

            if(!userId){
                // @ts-ignore
                userId = req.user.userId
            }

            if (!userId) return ApiResponse(res, 401, false, "Please provide  a userId");
            const userDetails = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
                select: {
                    role: true,
                },
            });

            if (!userDetails) return ApiResponse(res, 401, false, "No user exist with this userId"); 

            if (userDetails.role !== "instructor") return ApiResponse(res, 401, false, "Only admin can create a room")

            const { title, description } = CreateRoomPayload.data;
            const room = await prisma.room.create({
                data: {
                    roomTitle: title,
                    description: description,
                    creatorId: userId,
                },
            });

            return ApiSuccessResponse(res, 201, true, "Room created Successfully", { roomId: room.id });
        } catch (error) {
            return ApiResponse(res, 500, false, "Internal server Error");
        }
    }
);

export default router;
