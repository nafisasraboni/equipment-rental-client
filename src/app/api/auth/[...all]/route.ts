import { withAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withAuth((auth) => auth.handler(request));
}

export async function POST(request: Request) {
  return withAuth((auth) => auth.handler(request));
}
