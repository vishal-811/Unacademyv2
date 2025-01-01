/*
  Warnings:

  - You are about to drop the column `roomTitle` on the `Room` table. All the data in the column will be lost.
  - Added the required column `roomName` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "roomTitle",
ADD COLUMN     "roomName" TEXT NOT NULL;
