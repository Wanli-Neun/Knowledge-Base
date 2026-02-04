import { fetchWithAuth } from "@/lib/api-helper";

type DocumentResponse = {
  id: string;
  projectId: string;
  title: string;
  fileType: string;
  fileSize: number;
  downloadUrl?: string;
};

// GET - Lấy chi tiết document (kèm download URL)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  try {
    const { projectId, documentId } = await params;
    
    console.log('[API Route] Fetching document detail:', { projectId, documentId });
    
    const response = await fetchWithAuth<DocumentResponse>({
      url: `${process.env.PROJECT_SERVICE_URL}/projects/${projectId}/documents/${documentId}`,
      method: "GET",
    });
    
    console.log('[API Route] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] Error response:', errorText);
      return response;
    }
    
    const jsonData = await response.json();
    console.log('[API Route] Document detail:', jsonData);
    
    return Response.json(jsonData);
    
  } catch (error) {
    console.error('[API Route] Error fetching document detail:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa document
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  try {
    const { projectId, documentId } = await params;
    
    console.log('[API Route] Deleting document:', { projectId, documentId });
    
    const response = await fetchWithAuth({
      url: `${process.env.PROJECT_SERVICE_URL}/projects/${projectId}/documents/${documentId}`,
      method: "DELETE",
    });
    
    console.log('[API Route] Delete response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] Delete error:', errorText);
      return response;
    }
    
    return new Response(null, { status: 204 });
    
  } catch (error) {
    console.error('[API Route] Error deleting document:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
