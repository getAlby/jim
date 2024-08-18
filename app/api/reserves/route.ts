import { getReserves } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const reserves = await getReserves();

  return Response.json(reserves);
}
