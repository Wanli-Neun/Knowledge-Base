import { fetchWithAuth } from "@/lib/api-helper";

type RecentDocument = {
  id: string;
  projectId: string;
  title: string;
  fileType: string;
  fileSize: number;
  updatedAt: string;
};

export async function GET() {
  return fetchWithAuth<RecentDocument[]>({
    url: `${process.env.PROJECT_SERVICE_URL}/projects/recent-documents`,
    method: "GET",
  });
}
