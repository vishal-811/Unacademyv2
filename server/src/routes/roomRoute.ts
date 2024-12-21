import { Router, Request, Response } from "express";
import prisma from "../lib";
import { CreateRoomSchema } from "../zodSchema";
import { authMiddleware } from "../middleware";
const router = Router();

router.post(
    "/createRoom",
    authMiddleware,
    async (req: Request, res: Response) => {
        const CreateRoomPayload = CreateRoomSchema.safeParse(req.body);
        if (!CreateRoomPayload.success) {
            res.status(400).json({ msg: "Please provide all the fields" });
            return;
        }
        try {
            const userId = req.session.user;
            if (!userId?.id) {
                res.status(401).json({ msg: "Please provide a userId" });
                return;
            }

            const userDetails = await prisma.user.findFirst({
                where: {
                    id: userId.id,
                },
                select: {
                    isAdmin: true,
                },
            });

            if (!userDetails) {
                res.status(401).json({ msg: "User not found with this userId" });
                return;
            }
            if (!userDetails.isAdmin) {
                res.status(401).json({ msg: "only admin can create a room" });
                return;
            }
            const { title, description } = CreateRoomPayload.data;
            const room = await prisma.room.create({
                data: {
                    roomTitle: title,
                    description: description,
                    creatorId: userId?.id,
                },
            });

            res
                .status(201)
                .json({ msg: "Room created Sucessfully", roomId: room.id });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal Server Error" });
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
