"use server";

import { saveConnectionSecret, UsernameTakenError } from "./db";
import { getAlbyHubUrl, getDailyWalletLimit, getDomain } from "./utils";

export type Reserves = {
  numChannels: number;
  totalOutgoingCapacity: number;
  totalChannelCapacity: number;
  numApps: number;
  totalAppBalance: number;
  hasPublicChannels: boolean;
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
  request: { username: string | undefined } | undefined,
  servicePassword: string | undefined
): Promise<{ wallet: Wallet | undefined; error: string | undefined }> {
  try {
    if (process.env.PASSWORD) {
      if (servicePassword !== process.env.PASSWORD) {
        return { wallet: undefined, error: "wrong password" };
      }
    }

    const apps = (await fetch(new URL("/api/apps", getAlbyHubUrl()), {
      headers: getHeaders(),
    }).then((res) => res.json())) as { createdAt: string }[];

    const walletsCreatedToday = apps.filter(
      (app) =>
        new Date(app.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    if (walletsCreatedToday.length > getDailyWalletLimit()) {
      return { wallet: undefined, error: "daily wallet limit reached" };
    }

    if (!nodePubkey) {
      const connectionInfoResponse = await fetch(
        new URL("/api/node/connection-info", getAlbyHubUrl()),
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
    const newAppResponse = await fetch(new URL("/api/apps", getAlbyHubUrl()), {
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
      new URL(`/api/apps/${newApp.pairingPublicKey}`, getAlbyHubUrl()),
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

    const { username } = await saveConnectionSecret(
      request?.username,
      newApp.pairingUri
    );

    const domain = getDomain();
    const lightningAddress = username + "@" + domain;

    return {
      wallet: {
        connectionSecret: newApp.pairingUri + `&lud16=${username}@${domain}`,
        lightningAddress,
        valueTag: `<podcast:value type="lightning" method="keysend">
    <podcast:valueRecipient name="${lightningAddress}" type="node" address="${nodePubkey}" customKey="696969"  customValue="${appId}" split="100"/>
  </podcast:value>`,
      },
      error: undefined,
    };
  } catch (error) {
    console.error(error);

    // only expose known errors
    if (error instanceof UsernameTakenError) {
      return { wallet: undefined, error: error.message };
    }

    return { wallet: undefined, error: "internal error" };
  }
}

export async function getReserves(): Promise<Reserves | undefined> {
  try {
    const apps = (await fetch(new URL("/api/apps", getAlbyHubUrl()), {
      headers: getHeaders(),
    }).then((res) => res.json())) as { name: string; balance: number }[];

    const channels = (await fetch(new URL("api/channels", getAlbyHubUrl()), {
      headers: getHeaders(),
    }).then((res) => res.json())) as {
      localSpendableBalance: number;
      localBalance: number;
      remoteBalance: number;
      public: boolean;
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
      hasPublicChannels: channels.some((channel) => channel.public),
      totalOutgoingCapacity,
      totalChannelCapacity,
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getInfo() {
  const passwordRequired: boolean = Boolean(process.env.PASSWORD);
  return {
    name: process.env.NAME,
    description: process.env.DESCRIPTION,
    image: process.env.IMAGE,
    dailyWalletLimit: getDailyWalletLimit(),
    passwordRequired,
  };
}

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
    "AlbyHub-Name": process.env.ALBYHUB_NAME || process.env.ALBY_HUB_NAME || "",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}
