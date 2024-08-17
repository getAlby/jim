/*
  Warnings:

  - You are about to drop the column `lightningAddress` on the `ConnectionSecret` table. All the data in the column will be lost.
  - Added the required column `username` to the `ConnectionSecret` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConnectionSecret" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pubkey" TEXT NOT NULL,
    "username" TEXT NOT NULL
);
INSERT INTO "new_ConnectionSecret" ("id", "pubkey", "username") SELECT "id", "pubkey", "lightningAddress" FROM "ConnectionSecret";
DROP TABLE "ConnectionSecret";
ALTER TABLE "new_ConnectionSecret" RENAME TO "ConnectionSecret";
CREATE UNIQUE INDEX "ConnectionSecret_pubkey_key" ON "ConnectionSecret"("pubkey");
CREATE UNIQUE INDEX "ConnectionSecret_username_key" ON "ConnectionSecret"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
