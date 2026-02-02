import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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
  console.log("=== Refresh Token Request ===");
  
  // Thử lấy refresh token từ body trước, nếu không có thì lấy từ cookie
  let refreshToken: string | undefined;
  
  try {
    const body = await req.json();
    refreshToken = body.refreshToken;
    console.log("Refresh token from body:", refreshToken ? "Found" : "Not provided");
  } catch (e) {
    console.log("No body or invalid JSON, checking cookies...");
  }
  
  // Nếu không có trong body, lấy từ cookie
  if (!refreshToken) {
    const cookieStore = await cookies();
    refreshToken = cookieStore.get("refresh_token")?.value;
    console.log("Refresh token from cookie:", refreshToken ? `Found (${refreshToken.substring(0, 20)}...)` : "NOT FOUND");
  }

  if (!refreshToken) {
    console.log("No refresh token - returning 401");
    return NextResponse.json(
      { message: "No refresh token found" },
      { status: 401 }
    );
  }

  console.log("Calling backend refresh endpoint...");
  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  console.log("Backend refresh response status:", res.status);

  const json: ApiResponse<AuthResponse> = await res.json();
  
  console.log("Backend refresh response:", JSON.stringify(json, null, 2));

  if (!res.ok || !json?.result) {
    console.log("Refresh failed - clearing cookies");
    // Clear cookies if refresh failed
    const response = NextResponse.json(
      { message: json?.message ?? "Refresh token failed" },
      { status: json?.status || res.status || 500 }
    );
    
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    
    return response;
  }

  console.log("Refresh successful - updating cookies");

  const { accessToken, refreshToken: newRefreshToken } = json.result;

  // Cập nhật cookies với tokens mới
  const response = NextResponse.json({ 
    success: true,
    accessToken,
    refreshToken: newRefreshToken 
  });

  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: false, // Force false for development
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  response.cookies.set("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: false, // Force false for development
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 10, // 10 days
  });

  return response;
}
