/*
  Warnings:

  - You are about to drop the column `timeLimit` on the `quizzes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "timeLimit",
ADD COLUMN     "timeLimitMs" INTEGER NOT NULL DEFAULT 1200000;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "slug" TEXT;
