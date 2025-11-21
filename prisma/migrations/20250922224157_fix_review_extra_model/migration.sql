/*
  Warnings:

  - The primary key for the `ReviewExtra` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `reviewId` on the `ReviewExtra` table. All the data in the column will be lost.
  - Added the required column `articleId` to the `ReviewExtra` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `ReviewExtra` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReviewExtra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "criteria" TEXT,
    "scoreNumeric" REAL,
    "pros" TEXT,
    "cons" TEXT,
    "technicalSpec" TEXT,
    "performanceScore" REAL,
    "stabilityScore" REAL,
    "coverageScore" REAL,
    "softwareScore" REAL,
    "valueScore" REAL,
    "totalScore" REAL,
    CONSTRAINT "ReviewExtra_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReviewExtra" ("cons", "coverageScore", "criteria", "performanceScore", "pros", "scoreNumeric", "softwareScore", "stabilityScore", "technicalSpec", "totalScore", "valueScore") SELECT "cons", "coverageScore", "criteria", "performanceScore", "pros", "scoreNumeric", "softwareScore", "stabilityScore", "technicalSpec", "totalScore", "valueScore" FROM "ReviewExtra";
DROP TABLE "ReviewExtra";
ALTER TABLE "new_ReviewExtra" RENAME TO "ReviewExtra";
CREATE UNIQUE INDEX "ReviewExtra_articleId_key" ON "ReviewExtra"("articleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
