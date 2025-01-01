import { createWallet } from "@/app/actions";

export async function POST(request: Request) {
  const credentials = request.headers.get("Authorization")?.split(" ")?.[1];

  const servicePassword = credentials
    ? Buffer.from(credentials, "base64").toString().split(":")?.[1]
    : undefined;

  let createWalletRequest: { username: string | undefined } = {
    username: undefined,
  };
  try {
    if (request.body) {
      const body = await request.json();
      createWalletRequest.username = body.username;
    }
  } catch (error) {
    console.error("Failed to parse request body", error);
  }

  // force lowercase username
  if (createWalletRequest.username) {
    createWalletRequest.username = createWalletRequest.username.toLowerCase();
  }

  const { wallet, error } = await createWallet(
    createWalletRequest,
    servicePassword
  );

  if (!wallet) {
    return new Response(error, {
      status: 400,
    });
  }

  return Response.json({
    connectionSecret: wallet.connectionSecret,
    lightningAddress: wallet.lightningAddress,
    valueTag: wallet.valueTag,
  });
}
