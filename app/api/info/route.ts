import { getInfo } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const info = await getInfo();

  return Response.json(info);
}
