import { fetchWithAuth } from "@/lib/api-helper";

type User = {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  avaUrl: string;
  role: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '100';
    
    console.log('[API Route] Fetching all users');
    
    const response = await fetchWithAuth<PageResponse<User>>({
      url: `${process.env.AUTH_SERVICE_URL}/user/all?page=${page}&size=${size}`,
      method: "GET",
    });
    
    console.log('[API Route] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] Error response:', errorText);
      return response;
    }
    
    const jsonData = await response.json();
    console.log('[API Route] JSON data:', jsonData);
    
    // Backend wraps response in ApiResponse {status, message, metadata, result}
    // Extract the actual PageResponse from result field
    if (jsonData.result) {
      return Response.json(jsonData.result);
    }
    
    return Response.json(jsonData);
  } catch (error) {
    console.error('[API Route] Error:', error);
    return Response.json(
      { message: 'Failed to fetch users', error: String(error) },
      { status: 500 }
    );
  }
}
