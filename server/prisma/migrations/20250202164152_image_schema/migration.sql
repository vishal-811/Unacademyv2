/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "isPrivate";

-- CreateTable
CREATE TABLE "Images" (
    "id" TEXT NOT NULL,
    "folderName" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);
