import { PrismaClient } from "@prisma/client";
import { nwc } from "@getalby/sdk";
import { getPublicKey } from "nostr-tools";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { hexToBytes } from "@noble/hashes/utils";

const prisma = new PrismaClient();

export class UsernameTakenError extends Error {
  constructor() {
    super("username taken");
  }
}

export async function saveConnectionSecret(
  username: string | undefined,
  connectionSecret: string
) {
  const parsed = nwc.NWCClient.parseWalletConnectUrl(connectionSecret);
  if (!parsed.secret) {
    throw new Error("no secret found in connection secret");
  }
  const pubkey = getPublicKey(hexToBytes(parsed.secret));
  username = username || pubkey.substring(0, 6);

  try {
    const result = await prisma.connectionSecret.create({
      data: {
        id: connectionSecret,
        username,
        pubkey,
      },
    });
    return result;
  } catch (error) {
    console.error("failed to save wallet", { error });
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002" // unique constraint
    ) {
      throw new UsernameTakenError();
    }
    throw error;
  }
}

export async function findWalletConnection(
  query: { username: string } | { pubkey: string }
) {
  return prisma.connectionSecret.findUniqueOrThrow({
    where: query,
  });
}

export async function markConnectionSecretSubscribed(id: string) {
  return prisma.connectionSecret.update({
    where: {
      id,
    },
    data: {
      subscribed: true,
    },
  });
}

export async function getAllConnections() {
  return prisma.connectionSecret.findMany();
}
