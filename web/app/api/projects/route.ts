import { fetchWithAuth } from "@/lib/api-helper";

type ProjectResponse = {
  projectId: string;
  projectName: string;
  description: string;
  createdBy: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "100";

  return fetchWithAuth<PageResponse<ProjectResponse>>({
    url: `${process.env.PROJECT_SERVICE_URL}/projects?page=${page}&size=${size}`,
    method: "GET",
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  return fetchWithAuth<ProjectResponse>({
    url: `${process.env.PROJECT_SERVICE_URL}/projects`,
    method: "POST",
    body,
  });
}
