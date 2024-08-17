"use server";

import { saveConnectionSecret } from "./db";

export type Reserves = {
  numChannels: number;
  totalOutgoingCapacity: number;
  totalChannelCapacity: number;
  numApps: number;
  totalAppBalance: number;
};

export type Wallet = {
  connectionSecret: string;
  lightningAddress: string;
  valueTag: string;
};

const APP_NAME_PREFIX = process.env.APP_NAME_PREFIX || "Alby Jim ";

let nodePubkey: string;

export async function hasPassword() {
  return !!process.env.PASSWORD;
}

export async function createWallet(
  password: string | undefined
): Promise<Wallet | undefined> {
  try {
    if (!process.env.BASE_URL) {
      throw new Error("No BASE_URL set");
    }
    if (process.env.PASSWORD) {
      if (password !== process.env.PASSWORD) {
        return undefined;
      }
    }

    if (!nodePubkey) {
      const connectionInfoResponse = await fetch(
        `${process.env.ALBYHUB_URL}/api/node/connection-info`,
        {
          headers: getHeaders(),
        }
      );
      if (!connectionInfoResponse.ok) {
        throw new Error(
          "Failed to create app: " + (await connectionInfoResponse.text())
        );
      }
      const nodeInfo: { pubkey: string } = await connectionInfoResponse.json();
      if (!nodeInfo.pubkey) {
        throw new Error("Could not find pubkey in node response");
      }
      nodePubkey = nodeInfo.pubkey;
    }

    let appId: number;
    const newAppResponse = await fetch(`${process.env.ALBYHUB_URL}/api/apps`, {
      method: "POST",
      body: JSON.stringify({
        name: APP_NAME_PREFIX + Math.floor(Date.now() / 1000),
        pubkey: "",
        budgetRenewal: "monthly",
        maxAmount: 0,
        scopes: [
          "pay_invoice",
          "get_balance",
          "make_invoice",
          "lookup_invoice",
          "list_transactions",
          "notifications",
        ],
        returnTo: "",
        isolated: true,
      }),
      headers: getHeaders(),
    });
    if (!newAppResponse.ok) {
      throw new Error("Failed to create app: " + (await newAppResponse.text()));
    }
    // TODO: app id should also be returned here
    const newApp: { pairingUri: string; pairingPublicKey: string } =
      await newAppResponse.json();
    if (!newApp.pairingUri) {
      throw new Error("No pairing URI in create app response");
    }

    // TODO: remove once app id is returned in create call
    const appResponse = await fetch(
      `${process.env.ALBYHUB_URL}/api/apps/${newApp.pairingPublicKey}`,
      {
        headers: getHeaders(),
      }
    );
    if (!appResponse.ok) {
      throw new Error("Failed to create app: " + (await appResponse.text()));
    }
    const appInfo: { id: number } = await appResponse.json();
    if (!appInfo.id) {
      throw new Error("Could not find id in app response");
    }
    appId = appInfo.id;

    const { username } = await saveConnectionSecret(newApp.pairingUri);

    const domain = process.env.BASE_URL.split("//")[1];
    const lightningAddress = username + "@" + domain;

    return {
      connectionSecret: newApp.pairingUri + `&lud16=${username}@${domain}`,
      lightningAddress,
      valueTag: `<podcast:value type="lightning" method="keysend">
    <podcast:valueRecipient name="${lightningAddress}" type="node" address="${nodePubkey}" customKey="696969"  customValue="${appId}" split="100"/>
  </podcast:value>`,
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getReserves(): Promise<Reserves | undefined> {
  try {
    const apps = (await fetch(`${process.env.ALBYHUB_URL}/api/apps`, {
      headers: getHeaders(),
    }).then((res) => res.json())) as { name: string; balance: number }[];

    const channels = (await fetch(`${process.env.ALBYHUB_URL}/api/channels`, {
      headers: getHeaders(),
    }).then((res) => res.json())) as {
      localSpendableBalance: number;
      localBalance: number;
      remoteBalance: number;
    }[];

    const relevantApps = apps.filter(
      (app) => app.name.startsWith(APP_NAME_PREFIX) && app.balance > 0
    );
    const totalAppBalance = relevantApps
      .map((app) => app.balance)
      .reduce((a, b) => a + b, 0);

    const totalOutgoingCapacity = channels
      .map((channel) => channel.localSpendableBalance)
      .reduce((a, b) => a + b, 0);
    const totalChannelCapacity = channels
      .map((channel) => channel.localBalance + channel.remoteBalance)
      .reduce((a, b) => a + b, 0);

    return {
      numApps: relevantApps.length,
      totalAppBalance,
      numChannels: channels.length,
      totalOutgoingCapacity,
      totalChannelCapacity,
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
    "AlbyHub-Name": process.env.ALBYHUB_NAME || "",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}
