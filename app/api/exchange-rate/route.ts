import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const CURRENCY_CODE_RE = /^[A-Z]{3}$/;

export async function GET(request: NextRequest) {
  const baseCurrency = request.nextUrl.searchParams.get("base");

  if (!baseCurrency) {
    return NextResponse.json(
      { error: "Missing 'base' query parameter" },
      { status: 400 },
    );
  }

  if (!CURRENCY_CODE_RE.test(baseCurrency)) {
    return NextResponse.json(
      { error: "Invalid currency code — must be 3 uppercase letters (e.g. USD)" },
      { status: 400 },
    );
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Exchange rate API key is not configured" },
      { status: 500 },
    );
  }

  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency}`,
    { signal: AbortSignal.timeout(10_000) },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "External exchange rate service unavailable" },
      { status: 502 },
    );
  }

  const data = await res.json();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
