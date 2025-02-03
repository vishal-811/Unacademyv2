import { Router, Request, Response } from "express";
import prisma from "../lib";
import {
  CreateRoomSchema,
  GenerateLiveKitTokenSchema,
} from "../schemas/ZodSchema";
import { authMiddleware } from "../middleware";
import { ApiResponse, ApiSuccessResponse } from "../lib/apiResponse";
import GenerateLiveKitToken from "../lib/generateLiveKitToken";
import multer from "multer";
import { PdfToSlides } from "../lib/pdfToslides";
import path from "path";
import { UploadToS3 } from "../lib/aws";

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.resolve(__dirname, "../../uploads/pdfs")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

const router = Router();

router.post(
  "/createRoom",
  authMiddleware,
  async (req: Request, res: Response) => {
    const CreateRoomPayload = CreateRoomSchema.safeParse(req.body);
    if (!CreateRoomPayload.success)
      return ApiResponse(
        res,
        401,
        false,
        "Please Provide all the inputs fields"
      );

    try {
      let userId = req.session.userId;

      if (!userId) {
        userId = req.user?.userId;
      }

      if (!userId)
        return ApiResponse(res, 401, false, "Please provide  a userId");

      const userDetails = await prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          role: true,
          id: true,
        },
      });

      if (!userDetails)
        return ApiResponse(res, 401, false, "No user exist with this userId");

      if (userDetails.role !== "instructor")
        return ApiResponse(res, 401, false, "Only admin can create a room");

      const { roomname, description } = CreateRoomPayload.data;

      const liveKitToken = await GenerateLiveKitToken(
        roomname,
        userDetails.id,
        userDetails.role
      );

      const room = await prisma.room.create({
        data: {
          roomName: roomname,
          description: description,
          creatorId: userId,
          isActive: true,
        },
      });

      return ApiSuccessResponse(res, 201, true, "Room created Successfully", {
        roomId: room.id,
        liveKitToken: liveKitToken,
      });
    } catch (error : any) {
      console.error("the error is", error);
      ApiResponse(res, 500, false, "Internal Server");
    }
  }
);

router.post(
  "/generateToken",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const validateInput = GenerateLiveKitTokenSchema.safeParse(req.body);

      if (!validateInput.success) {
        return ApiResponse(res, 401, false, "Invalid input");
      }

      const { roomId } = validateInput.data;

      let userId = req.session.userId || req.user?.userId;

      if (!userId) {
        throw new Error("Please provide a user Id");
      }

      const userExist = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (!userExist) {
        return ApiResponse(res, 401, false, "No user exist with this userId");
      }

      const roomExist = await prisma.room.findFirst({
        where: {
          id: roomId,
        },
        select: {
          roomName: true,
        },
      });

      if (!roomExist) {
        return ApiResponse(res, 404, false, "No room exist with this roomId");
      }

      const liveKitToken = await GenerateLiveKitToken(
        roomExist.roomName,
        userExist.id,
        userExist.role
      );
      return ApiSuccessResponse(res, 201, true, "Token generated Sucessfully", {
        liveKitToken: liveKitToken,
      });
    } catch (error) {
      console.log("error", error);
      return ApiResponse(res, 500, false, "Internal server Error");
    }
  }
);

router.get(
  "/roomExist/:roomId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    if (!roomId) {
      return ApiResponse(res, 401, false, "please provide a roomId");
    }

    try {
      const isRoomExist = await prisma.room.findFirst({
        where: {
          id: roomId,
        },
        select: {
          isActive: true,
        },
      });
      if (!isRoomExist) {
        return ApiResponse(res, 404, false, "No room exist with this roomId");
      }

      if (!isRoomExist.isActive) {
        return ApiResponse(
          res,
          410,
          false,
          "Meeting has been ended by the host!"
        );
      }
      return ApiSuccessResponse(res, 200, true, "ok", {});
    } catch (error: unknown) {
      return ApiResponse(res, 500, false, "Internal server error");
    }
  }
);

router.post(
  "/leave-Room/:roomId",
  authMiddleware,
  async (req: Request, res: Response) => {
    console.log("Hitted");
    const roomId = req.params.roomId;
    console.log("the roomId is", roomId);
    if (!roomId) {
      return ApiResponse(res, 401, false, "please provide a roomId");
    }

    try {
      const roomExist = await prisma.room.findFirst({
        where: {
          id: roomId,
        },
      });

      if (!roomExist) {
        return ApiResponse(res, 401, false, "No room exist with this roomId");
      }

      const updatedRoomStatus = await prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          isActive: false,
        },
      });
      return ApiSuccessResponse(
        res,
        201,
        true,
        "Admin left the room Successfully",
        {}
      );
    } catch (error) {
      return ApiResponse(res, 500, false, "Internal server error");
    }
  }
);

router.post(
  "/upload-pdf/:RoomId",
  authMiddleware,
  upload.single("file"),
  async (req: Request, res: Response) => {
    const {RoomId} = req.params;
    console.log("the session id for this is", RoomId);
    const filePath = req.file?.path;
    try {
      const response = await PdfToSlides(filePath!);
      if (!response) {
        throw new Error("Unable to convert the pdf to image");
      }

      // Upload the images to the s3.
      const imgurl = await  UploadToS3(RoomId);

      
      return ApiSuccessResponse(res, 200, true, "Pdf to slides converted", {});
    } catch (error) {
      return ApiResponse(res, 500, false, "Internal Server Error");
    }
  }
);
export default router;
