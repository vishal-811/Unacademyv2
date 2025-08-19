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
import { ClearFolder } from "../lib/cleanFolder";
import { RoleType } from "@prisma/client";

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.resolve(__dirname, "../../uploads/pdfs")),
  filename: (req, file, cb) => cb(null, file.originalname),
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
    } catch (error: any) {
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
    const roomId = req.params.roomId;
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
    const slideId = req.file?.filename;
    const filePath = req.file?.path;
    const { RoomId } = req.params;

    const userRole = req.session.userId || req.user?.role;
    if (userRole !== RoleType.instructor) {
      return ApiResponse(
        res,
        401,
        false,
        "You are not allowed to perform this action"
      );
    }
    try {
      const response = await PdfToSlides(filePath!);
      if (!response) {
        throw new Error("Unable to convert the pdf to image");
      }

      // Upload the images to the s3.
      const imgId = await UploadToS3(RoomId);
      if (!imgId) {
        throw new Error();
      }

      const ImageIdDb = imgId.map(async (id) => {
        await prisma.image.create({
          data: {
            roomId: RoomId,
            imageId: id,
            slideId: slideId!,
          },
        });
      });

      await Promise.all(ImageIdDb);

      return ApiSuccessResponse(res, 200, true, "Pdf to slides converted", {});
    } catch (error: any) {
      console.error("the error occured is", error.message);
      return ApiResponse(res, 500, false, "Internal Server Error");
    }
  }
);

router.post(
  "/get-slides/:RoomId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const slideId = req.body.fileName;
    const roomId = req.params.RoomId;
    if (!roomId)
      return ApiResponse(res, 401, false, "Please Provide a Room Id");

    const userRole = req.session.userId || req.user?.role;
    if (userRole !== RoleType.instructor) {
      return ApiResponse(
        res,
        401,
        false,
        "You are not allowed to perform this action"
      );
    }

    try {
      const imageurls = await prisma.image.findMany({
        where: {
          roomId: roomId,
          slideId: slideId,
        },
        orderBy: {
          imageId: "asc",
        },
        select: {
          imageId: true,
        },
      });

      const allSlidesUrl = imageurls.map((slide) => {
        return slide.imageId;
      });

      const isFolderClear = await ClearFolder(slideId, allSlidesUrl);
      return ApiSuccessResponse(
        res,
        200,
        true,
        "fetched images url successfully",
        { imageurls: allSlidesUrl }
      );
    } catch (error) {
      return ApiResponse(res, 500, false, "Internal Server Error");
    }
  }
);
export default router;
