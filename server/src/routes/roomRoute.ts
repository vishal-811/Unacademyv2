import { Router, Request, Response } from "express";
import prisma from "../lib";
import { CreateRoomSchema } from "../zodSchema";
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
            const userId = req.session.user;
            if (!userId?.id) return ApiResponse(res, 401, false, "Please provide  a userId");

            const userDetails = await prisma.user.findFirst({
                where: {
                    id: userId.id,
                },
                select: {
                    isAdmin: true,
                },
            });

            if (!userDetails) return ApiResponse(res, 401, false, "No user exist with this userId"); 

            if (!userDetails.isAdmin) return ApiResponse(res, 401, false, "Only admin can create a room")

            const { title, description } = CreateRoomPayload.data;
            const room = await prisma.room.create({
                data: {
                    roomTitle: title,
                    description: description,
                    creatorId: userId?.id,
                },
            });

            return ApiSuccessResponse(res, 201, true, "Room created Successfully", { roomId: room.id });
        } catch (error) {
            return ApiResponse(res, 500, false, "Internal server Error");
        }
    }
);

// router.post("/joinRoom", async (req: Request, res: Response) => {
//     let { roomId } = req.query;
//     if (!roomId) {
//         res.status(401).json({ msg: "Please provide a roomId" });
//         return;
//     }
//     if (roomId != "string") {
//         roomId = roomId.toString();
//     }

//     try {
//         const RoomExist = await prisma.room.findFirst({
//             where: {
//                 id: roomId,
//             },
//         });

//         if (!RoomExist) {
//             res.status(404).json({ msg: "No Room exist with this room Id" });
//             return;
//         }
//         const userId = "1";

//         const JoinRoom = await prisma.user.update({
//             where: {
//                 id: userId,
//             },
//             data: {
//                 JoinedRooms: {
//                     connect: {
//                         id: roomId,
//                     },
//                 },
//             },
//         });
//         res
//             .status(201)
//             .json({ msg: "Room Created Sucessfully", roomId: JoinRoom.id });
//     } catch (error) {
//         res.status(500).json({ msg: "Internal server error" });
//     }
// });
export default router;
