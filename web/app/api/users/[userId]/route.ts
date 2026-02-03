import { NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-helper';

type UserResponse = {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  avaUrl: string;
  role: string;
  createdAt?: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  
  console.log('[API Route] Fetching user with ID:', userId);
  console.log('[API Route] Full URL:', `${process.env.AUTH_SERVICE_URL}/user/${userId}`);

  return fetchWithAuth<UserResponse>({
    url: `${process.env.AUTH_SERVICE_URL}/user/${userId}`,
    method: 'GET',
  });
}
