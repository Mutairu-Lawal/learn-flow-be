/*
  Warnings:

  - Made the column `topicId` on table `quiz_attempts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_topicId_fkey";

-- AlterTable
ALTER TABLE "quiz_attempts" ALTER COLUMN "topicId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
