import { fetchWithAuth } from "@/lib/api-helper";

export async function PATCH(req: Request) {
  const body = await req.json();
  
  return fetchWithAuth({
    url: `${process.env.AUTH_SERVICE_URL}/user/password`,
    method: "PATCH",
    body,
  });
}
