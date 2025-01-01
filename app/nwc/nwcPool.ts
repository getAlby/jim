import { Event, finalizeEvent, getPublicKey, SimplePool } from "nostr-tools";
import { makeZapReceipt } from "nostr-tools/nip57";
import { nwc } from "@getalby/sdk";
import { hexToBytes } from "@noble/hashes/utils";
import { markConnectionSecretSubscribed } from "../db";
import { ConnectionSecret } from "@prisma/client";
import { getBaseUrl } from "../utils";

class NWCPool {
  private readonly pool: SimplePool;

  constructor() {
    this.pool = new SimplePool();
  }

  async subscribeUser(connectionSecret: ConnectionSecret) {
    try {
      const HTTP_NOSTR_URL = process.env.HTTP_NOSTR_URL;
      if (!HTTP_NOSTR_URL) {
        throw new Error("No HTTP_NOSTR_URL set");
      }

      console.debug("subscribing to user", {
        username: connectionSecret.username,
      });

      const parsedNwcUrl = nwc.NWCClient.parseWalletConnectUrl(
        connectionSecret.id
      );
      if (!parsedNwcUrl.secret) {
        throw new Error("no secret in NWC URL");
      }

      const result = await fetch(`${HTTP_NOSTR_URL}/nip47/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl: `${getBaseUrl()}/api/http_nostr`,
          walletPubkey: parsedNwcUrl.walletPubkey,
          connectionPubkey: getPublicKey(hexToBytes(parsedNwcUrl.secret)),
        }),
      });
      if (!result.ok) {
        throw new Error(
          "Failed to subscribe to http-nostr notifications: " +
            result.status +
            " " +
            (await result.text())
        );
      }

      await markConnectionSecretSubscribed(connectionSecret.id);
    } catch (error) {
      console.error("failed to subscribe user", { error });
    }
  }

  async publishZap(
    connectionSecret: ConnectionSecret,
    transaction: nwc.Nip47Transaction
  ) {
    const metadata = transaction.metadata;
    const requestEvent = metadata?.nostr as Event;

    if (!requestEvent) {
      return;
    }

    const NOSTR_NIP57_PRIVATE_KEY = process.env.NOSTR_NIP57_PRIVATE_KEY;

    if (!NOSTR_NIP57_PRIVATE_KEY) {
      throw new Error("no zapper private key set");
    }

    const zapReceipt = makeZapReceipt({
      zapRequest: JSON.stringify(requestEvent),
      preimage: transaction.preimage,
      bolt11: transaction.invoice,
      paidAt: new Date(transaction.settled_at * 1000),
    });
    const relays = requestEvent.tags
      .find((tag) => tag[0] === "relays")
      ?.slice(1);
    if (!relays || !relays.length) {
      console.error("no relays specified in zap request", {
        username: connectionSecret.username,
        transaction,
      });
      return;
    }

    const signedEvent = finalizeEvent(
      zapReceipt,
      hexToBytes(NOSTR_NIP57_PRIVATE_KEY)
    );

    const results = await Promise.allSettled(
      this.pool.publish(relays, signedEvent)
    );

    const successfulRelays: string[] = [];
    const failedRelays: string[] = [];

    results.forEach((result, index) => {
      const relay = relays[index];
      if (result.status === "fulfilled") {
        successfulRelays.push(relay);
      } else {
        failedRelays.push(relay);
      }
    });

    if (failedRelays.length === relays.length) {
      console.error("failed to publish zap", {
        username: connectionSecret.username,
        event_id: signedEvent.id,
        payment_hash: transaction.payment_hash,
        failed_relays: relays,
      });
      return;
    }

    console.debug("published zap", {
      username: connectionSecret.username,
      event_id: signedEvent.id,
      payment_hash: transaction.payment_hash,
      successful_relays: successfulRelays,
      failed_relays: failedRelays,
    });
  }
}
export const NWC_POOL = new NWCPool();
