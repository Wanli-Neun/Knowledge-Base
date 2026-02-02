import { NextResponse } from "next/server";

type ApiResponse<T> = {
  status: number;
  message: string;
  metadata?: object;
  result?: T;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function POST(req: Request) {
  const body = await req.json(); // { email, password }

  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
    }),
  });

  const json: ApiResponse<AuthResponse> = await res.json();

  if (!res.ok || !json?.result) {
    return NextResponse.json(
      { message: json?.message ?? "Login failed" },
      { status: json?.status || res.status || 500 }
    );
  }

  const { accessToken, refreshToken } = json.result;

  // Lưu cả accessToken và refreshToken vào cookie HttpOnly
  const response = NextResponse.json({ success: true });

  console.log("Setting access_token cookie...");
  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: false, // Force false for development
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  console.log("Setting refresh_token cookie...");
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false, // Force false for development
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 10, // 10 days
  });

  console.log("Both cookies set successfully");
  console.log("Response cookies:", response.cookies.getAll());

  return response;
}
