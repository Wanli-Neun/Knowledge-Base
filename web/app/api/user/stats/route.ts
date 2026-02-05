import { fetchWithAuth } from "@/lib/api-helper";

type UserStats = {
  projectCount: number;
  documentCount: number;
};

export async function GET() {
  return fetchWithAuth<UserStats>({
    url: `${process.env.PROJECT_SERVICE_URL}/projects/stats`,
    method: "GET",
  });
}
