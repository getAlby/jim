import { createWallet } from "@/app/actions";

export async function POST(request: Request) {
  const credentials = request.headers.get("Authorization")?.split(" ")?.[1];

  const password = credentials
    ? Buffer.from(credentials, "base64").toString().split(":")?.[1]
    : undefined;

  const { wallet, error } = await createWallet(password);

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
