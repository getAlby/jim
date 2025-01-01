import { NextRequest } from "next/server";
import { findWalletConnection } from "@/app/db";
import { nwc } from "@getalby/sdk";
import { validateZapRequest } from "nostr-tools/nip57";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  if (!params.username) {
    throw new Error("No username provided");
  }

  const searchParams = request.nextUrl.searchParams;
  const amount = searchParams.get("amount");
  const comment = searchParams.get("comment") || "";
  const nostr = searchParams.get("nostr") || "";

  if (!amount) {
    throw new Error("No amount provided");
  }

  const connection = await findWalletConnection({
    username: params.username,
  });

  // subscribe to existing lightning addresses
  if (!connection.subscribed) {
    await this.subscribeUser(connection);
  }

  const nwcClient = new nwc.NWCClient({ nostrWalletConnectUrl: connection.id });

  let zapRequest: Event | undefined;
  if (nostr) {
    const zapValidationError = validateZapRequest(nostr);
    if (zapValidationError) {
      throw new Error(zapValidationError);
    }
    zapRequest = JSON.parse(nostr);
  }

  const transaction = await nwcClient.makeInvoice({
    amount: +amount,
    description: comment,
    metadata: {
      nostr: zapRequest,
    },
  });

  return Response.json({
    pr: transaction.invoice,
  });
}
