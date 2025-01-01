import { PrismaClient } from "@prisma/client";
import { nwc } from "@getalby/sdk";
import { getPublicKey } from "nostr-tools";

const prisma = new PrismaClient();

export async function saveConnectionSecret(
  username: string | undefined,
  connectionSecret: string
): Promise<{ username: string }> {
  const parsed = nwc.NWCClient.parseWalletConnectUrl(connectionSecret);
  if (!parsed.secret) {
    throw new Error("no secret found in connection secret");
  }
  const pubkey = getPublicKey(parsed.secret);
  username = username || pubkey.substring(0, 6);

  const result = await prisma.connectionSecret.create({
    data: {
      id: connectionSecret,
      username,
      pubkey,
    },
  });
  return { username: result.username };
}

export async function findWalletConnection(query: { username: string }) {
  return prisma.connectionSecret.findUniqueOrThrow({
    where: {
      username: query.username,
    },
  });
}
