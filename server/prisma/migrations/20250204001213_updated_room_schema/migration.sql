/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `Images` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Images_imageId_key" ON "Images"("imageId");
