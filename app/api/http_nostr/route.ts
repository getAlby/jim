import { findWalletConnection } from "@/app/db";
import { Event } from "nostr-tools";
import { decrypt } from "nostr-tools/nip04";
import { nwc } from "@getalby/sdk";
import { NWC_POOL } from "@/app/nwc/nwcPool";

export async function POST(request: Request) {
  let body: Event | undefined;
  try {
    body = await request.json();
    if (!body) {
      throw new Error("no body in request");
    }

    // get wallet
    const pTagValue = body.tags.find((tag) => tag[0] === "p")?.[1];
    if (!pTagValue) {
      throw new Error("p tag not found");
    }
    const wallet = await findWalletConnection({ pubkey: pTagValue });
    if (!wallet) {
      throw new Error("could not find wallet by pubkey");
    }

    // deserialize content
    const parsedNWCUrl = nwc.NWCClient.parseWalletConnectUrl(wallet.id);
    const secretKey = parsedNWCUrl.secret;
    if (!secretKey) {
      throw new Error("no secret key");
    }
    // TODO: update to NIP-44
    const decryptedContent = await decrypt(
      secretKey,
      parsedNWCUrl.walletPubkey,
      body.content
    );

    const notification = JSON.parse(decryptedContent) as nwc.Nip47Notification;
    if (notification.notification_type !== "payment_received") {
      console.debug("skipping notification that is not payment_received");
      return Response.json({});
    }

    // console.debug("publishing zap", { notification });

    await NWC_POOL.publishZap(wallet, notification.notification);
  } catch (error) {
    console.error("failed to process http-nostr request", { body });
  }

  return Response.json({});
}
