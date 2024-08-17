export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  if (!params.username) {
    throw new Error("No username provided");
  }
  const domain = process.env.BASE_URL?.split("//")[1];

  return Response.json({
    status: "OK",
    tag: "payRequest",
    commentAllowed: 255,
    callback: `${process.env.BASE_URL}/.well-known/lnurlp/${params.username}/callback`,
    minSendable: 1000,
    maxSendable: 10000000000,
    metadata: `[["text/identifier","${params.username}@${domain}"],["text/plain","Sats for Alby Jim user ${params.username}"]]`,
  });
}
