import { getDomain, getBaseUrl } from "@/app/utils";
import { getPublicKey } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  if (!params.username) {
    throw new Error("No username provided");
  }
  const domain = getDomain();
  const NOSTR_NIP57_PRIVATE_KEY = process.env.NOSTR_NIP57_PRIVATE_KEY;

  return Response.json({
    status: "OK",
    tag: "payRequest",
    commentAllowed: 255,
    callback: `${getBaseUrl()}/.well-known/lnurlp/${params.username}/callback`,
    minSendable: 1000,
    maxSendable: 10000000000,
    metadata: `[["text/identifier","${params.username}@${domain}"],["text/plain","Sats for Alby Jim user ${params.username}"]]`,
    ...(NOSTR_NIP57_PRIVATE_KEY
      ? {
          allowsNostr: true,
          nostrPubkey: getPublicKey(hexToBytes(NOSTR_NIP57_PRIVATE_KEY)),
        }
      : {}),
  });
}
