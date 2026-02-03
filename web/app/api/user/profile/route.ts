import { fetchWithAuth } from "@/lib/api-helper";

type UserProfile = {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  avaUrl: string;
  role: string;
};

export async function GET() {
  return fetchWithAuth<UserProfile>({
    url: `${process.env.AUTH_SERVICE_URL}/user/profile`,
    method: "GET",
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();

  return fetchWithAuth<UserProfile>({
    url: `${process.env.AUTH_SERVICE_URL}/user/profile`,
    method: "PATCH",
    body,
  });
}
