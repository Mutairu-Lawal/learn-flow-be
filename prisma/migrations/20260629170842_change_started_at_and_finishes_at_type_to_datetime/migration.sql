/*
  Warnings:

  - You are about to drop the column `endedAt` on the `quiz_attempts` table. All the data in the column will be lost.
  - Added the required column `finishedAt` to the `quiz_attempts` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `startedAt` on the `quiz_attempts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "quiz_attempts" DROP COLUMN "endedAt",
ADD COLUMN     "finishedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "startedAt",
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL;
