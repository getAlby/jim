-- CreateTable
CREATE TABLE "ConnectionSecret" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pubkey" TEXT NOT NULL,
    "lightningAddress" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionSecret_pubkey_key" ON "ConnectionSecret"("pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionSecret_lightningAddress_key" ON "ConnectionSecret"("lightningAddress");
