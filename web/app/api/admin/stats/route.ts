import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type ApiResponse<T> = {
  status: number;
  message: string;
  metadata?: object;
  result?: T;
};

type StatsDetail = {
  total: number;
  active: number;
  inactive: number;
};

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const queryString = params.toString() ? `?${params.toString()}` : "";

  try {
    // Fetch stats from services
    const [usersRes, projectsRes, documentsRes] = await Promise.all([
      fetch(`${process.env.AUTH_SERVICE_URL}/admin/stats/users${queryString}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(`${process.env.PROJECT_SERVICE_URL}/admin/stats/projects${queryString}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(`${process.env.PROJECT_SERVICE_URL}/admin/stats/documents${queryString}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    let users: StatsDetail = { total: 0, active: 0, inactive: 0 };
    let projects: StatsDetail = { total: 0, active: 0, inactive: 0 };
    let documents: StatsDetail = { total: 0, active: 0, inactive: 0 };

    // Parse responses
    if (usersRes.ok) {
      const data: ApiResponse<StatsDetail> = await usersRes.json();
      users = data.result || users;
    }

    if (projectsRes.ok) {
      const data: ApiResponse<StatsDetail> = await projectsRes.json();
      projects = data.result || projects;
    }

    if (documentsRes.ok) {
      const data: ApiResponse<StatsDetail> = await documentsRes.json();
      documents = data.result || documents;
    }

    return NextResponse.json({
      users,
      projects,
      documents,
    });

  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
