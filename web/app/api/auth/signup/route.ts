export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, displayName } = body;

    // Validate
    if (!email || !password || !fullName || !displayName) {
      return Response.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log('[Signup API] Creating user:', { email, fullName, displayName });

    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        fullName,
        displayName,
      }),
    });

    const data = await response.json();
    console.log('[Signup API] Response:', response.status, data);

    if (!response.ok) {
      return Response.json(
        { message: data.message || 'Sign up failed' },
        { status: response.status }
      );
    }

    return Response.json(
      { message: 'Sign up successful', data: data.result || data },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Signup API] Error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
