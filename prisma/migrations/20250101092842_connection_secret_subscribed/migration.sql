-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConnectionSecret" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pubkey" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "subscribed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_ConnectionSecret" ("id", "pubkey", "username") SELECT "id", "pubkey", "username" FROM "ConnectionSecret";
DROP TABLE "ConnectionSecret";
ALTER TABLE "new_ConnectionSecret" RENAME TO "ConnectionSecret";
CREATE UNIQUE INDEX "ConnectionSecret_pubkey_key" ON "ConnectionSecret"("pubkey");
CREATE UNIQUE INDEX "ConnectionSecret_username_key" ON "ConnectionSecret"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
