import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type ApiResponse<T> = {
  status: number;
  message: string;
  metadata?: object;
  result?: T;
};

type TimeSeriesDataPoint = {
  date: string;
  count: number;
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
  const days = searchParams.get("days") || "30";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  
  const params = new URLSearchParams();
  params.append("days", days);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const queryString = `?${params.toString()}`;

  try {
    const [usersRes, projectsRes, documentsRes] = await Promise.all([
      fetch(`${process.env.AUTH_SERVICE_URL}/admin/stats/users/timeseries${queryString}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(`${process.env.PROJECT_SERVICE_URL}/admin/stats/projects/timeseries${queryString}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(`${process.env.PROJECT_SERVICE_URL}/admin/stats/documents/timeseries${queryString}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    let users: TimeSeriesDataPoint[] = [];
    let projects: TimeSeriesDataPoint[] = [];
    let documents: TimeSeriesDataPoint[] = [];

    if (usersRes.ok) {
      const data: ApiResponse<TimeSeriesDataPoint[]> = await usersRes.json();
      users = data.result || [];
    }

    if (projectsRes.ok) {
      const data: ApiResponse<TimeSeriesDataPoint[]> = await projectsRes.json();
      projects = data.result || [];
    }

    if (documentsRes.ok) {
      const data: ApiResponse<TimeSeriesDataPoint[]> = await documentsRes.json();
      documents = data.result || [];
    }

    return NextResponse.json({
      users,
      projects,
      documents,
    });

  } catch (error) {
    console.error("Failed to fetch time series data:", error);
    return NextResponse.json(
      { message: "Failed to fetch time series data" },
      { status: 500 }
    );
  }
}
