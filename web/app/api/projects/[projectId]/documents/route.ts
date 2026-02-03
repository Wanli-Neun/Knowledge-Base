import { fetchWithAuth } from "@/lib/api-helper";

type DocumentResponse = {
  id: string;
  projectId: string;
  title: string;
  fileType: string;
  fileSize: number;
  downloadUrl?: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

// GET - Lấy danh sách documents của project
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';
    
    console.log('[API Route] Fetching documents for project:', projectId, { page, size });
    
    const response = await fetchWithAuth<PageResponse<DocumentResponse>>({
      url: `${process.env.PROJECT_SERVICE_URL}/projects/${projectId}/documents?page=${page}&size=${size}`,
      method: "GET",
    });
    
    console.log('[API Route] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] Error response:', errorText);
      return response;
    }
    
    const jsonData = await response.json();
    console.log('[API Route] Documents data:', jsonData);
    
    return Response.json(jsonData);
    
  } catch (error) {
    console.error('[API Route] Error fetching documents:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Upload document
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const formData = await req.formData();
    
    console.log('[API Route] Uploading document to project:', projectId);
    
    const response = await fetchWithAuth<DocumentResponse>({
      url: `${process.env.PROJECT_SERVICE_URL}/projects/${projectId}/documents`,
      method: "POST",
      body: formData,
      isFormData: true,
    });
    
    console.log('[API Route] Upload response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] Upload error:', errorText);
      return response;
    }
    
    const jsonData = await response.json();
    console.log('[API Route] Upload success:', jsonData);
    
    return Response.json(jsonData);
    
  } catch (error) {
    console.error('[API Route] Error uploading document:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
