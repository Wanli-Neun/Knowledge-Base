import { fetchWithAuth } from "@/lib/api-helper";

type ProjectDetail = {
  projectId: string;
  projectName: string;
  description: string;
  createdBy: string;
  createdByDisplayName?: string;
  createdAt?: string;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    console.log('[API Route] Fetching project with ID:', projectId);
    
    const response = await fetchWithAuth<ProjectDetail>({
      url: `${process.env.PROJECT_SERVICE_URL}/projects/${projectId}`,
      method: "GET",
    });
    
    console.log('[API Route] Response status:', response.status);
    
    return response;
  } catch (error) {
    console.error('[API Route] Error:', error);
    return Response.json(
      { message: 'Failed to fetch project details', error: String(error) },
      { status: 500 }
    );
  }
}
