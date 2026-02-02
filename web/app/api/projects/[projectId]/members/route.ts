import { fetchWithAuth } from "@/lib/api-helper";

type Member = {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  avaUrl: string;
  role: string;
  joinedAt?: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

// GET - Lấy danh sách members của project
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';
    
    console.log('[API Route] Fetching members for project:', projectId, { page, size });
    
    const response = await fetchWithAuth<PageResponse<Member>>({
      url: `${process.env.PROJECT_SERVICE_URL}/projects/${projectId}/members?page=${page}&size=${size}`,
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
      { message: 'Failed to fetch members', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Thêm member vào project
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      return Response.json(
        { message: 'userId is required' },
        { status: 400 }
      );
    }
    
    console.log('[API Route] Adding member to project:', { projectId, userId });
    
    const response = await fetchWithAuth<Member>({
      url: `${process.env.PROJECT_SERVICE_URL}/projects/${projectId}/members`,
      method: "POST",
      body: { userId },
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
    // Extract the actual data from result field if exists
    if (jsonData.result !== undefined) {
      return Response.json(jsonData.result);
    }
    
    return Response.json(jsonData);
  } catch (error) {
    console.error('[API Route] Error:', error);
    return Response.json(
      { message: 'Failed to add member', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Xóa member khỏi project
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return Response.json(
        { message: 'userId is required' },
        { status: 400 }
      );
    }
    
    console.log('[API Route] Removing member from project:', { projectId, userId });
    
    const response = await fetchWithAuth({
      url: `${process.env.PROJECT_SERVICE_URL}/projects/${projectId}/members/${userId}`,
      method: "DELETE",
    });
    
    console.log('[API Route] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] Error response:', errorText);
      return response;
    }
    
    return Response.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('[API Route] Error:', error);
    return Response.json(
      { message: 'Failed to remove member', error: String(error) },
      { status: 500 }
    );
  }
}
