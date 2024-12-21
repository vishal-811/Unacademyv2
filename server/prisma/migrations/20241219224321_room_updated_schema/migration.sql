/*
  Warnings:

  - Added the required column `description` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomTitle` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "roomTitle" TEXT NOT NULL;
