import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Gọi backend logout nếu có refresh token
  if (refreshToken) {
    try {
      await fetch(`${process.env.AUTH_SERVICE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Backend logout failed:", error);
    }
  }

  // Clear cookies
  const response = NextResponse.json({ success: true });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");

  return response;
}
