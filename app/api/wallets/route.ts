import { createWallet } from "@/app/actions";

export async function POST(request: Request) {
  const credentials = request.headers.get("Authorization")?.split(" ")?.[1];

  const password = credentials
    ? Buffer.from(credentials, "base64").toString().split(":")?.[1]
    : undefined;

  const response = await createWallet(password);

  if (!response) {
    return Response.error();
  }

  return Response.json({
    connectionSecret: response?.connectionSecret,
    lightningAddress: response?.lightningAddress,
    valueTag: response?.valueTag,
  });
}
