/*
  Warnings:

  - You are about to drop the column `commentId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `likesId` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "commentId",
DROP COLUMN "likesId";
