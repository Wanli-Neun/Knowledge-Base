import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type FetchWithAuthOptions = {
  url: string;
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

/**
 * Helper function to make authenticated API calls with automatic token refresh
 */
export async function fetchWithAuth<T>(
  options: FetchWithAuthOptions
): Promise<NextResponse<T | { message: string }>> {
  const cookieStore = await cookies();
  
  let accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { url, method = "GET", body, headers = {} } = options;

  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...headers,
    },
  };

  if (body) {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
    fetchOptions.headers = {
      ...fetchOptions.headers,
      "Content-Type": "application/json",
    };
  }

  let res = await fetch(url, fetchOptions);

  console.log(`${method} ${url} - Status:`, res.status);

  // If access token expired (401), try refresh
  if (res.status === 401) {
    console.log("Token expired, attempting refresh...");
    
    const refreshToken = cookieStore.get("refresh_token")?.value;
    
    if (!refreshToken) {
      console.log("No refresh token found");
      return NextResponse.json(
        { message: "Session expired, please login again" },
        { status: 401 }
      );
    }

    // Try to refresh token
    console.log("Calling refresh API...");
    
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/refresh`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cookie": `refresh_token=${refreshToken}`
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    console.log("Refresh API response status:", refreshRes.status);

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      console.log("Refresh successful");
      
      const tokens = refreshData.result || refreshData;
      
      if (tokens.accessToken && tokens.refreshToken) {
        accessToken = tokens.accessToken;
        
        console.log("Retrying request with new token...");
        
        // Retry request with new token
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${accessToken}`,
        };
        
        res = await fetch(url, fetchOptions);
        console.log("Retry response status:", res.status);

        // Parse response
        const json = await res.json();

        if (!res.ok) {
          const errorResponse = NextResponse.json(
            { message: json?.message ?? "Request failed" },
            { status: json?.status || res.status || 500 }
          );
          return errorResponse;
        }

        // Create successful response with updated cookies
        const successResponse = NextResponse.json(json.result || json);
        successResponse.cookies.set("access_token", tokens.accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60,
        });
        successResponse.cookies.set("refresh_token", tokens.refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 10,
        });
        
        console.log("Cookies set on response successfully");
        return successResponse;
      }
    }
    
    // Refresh failed - clearing session
    console.log("Refresh failed - clearing session");
    
    const errorResponse = NextResponse.json(
      { message: "Session expired, please login again" },
      { status: 401 }
    );
    errorResponse.cookies.delete("access_token");
    errorResponse.cookies.delete("refresh_token");
    
    return errorResponse;
  }

  const json = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { message: json?.message ?? "Request failed" },
      { status: json?.status || res.status || 500 }
    );
  }

  return NextResponse.json(json.result || json);
}
