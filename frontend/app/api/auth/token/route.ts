import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function GET() {
    try {
        const { token: accessToken } = await auth0.getAccessToken();
        return NextResponse.json({ accessToken });
    } catch (error: any) {
        // If the user is not logged in, getAccessToken throws.
        return NextResponse.json({ error: 'Not authenticated', details: error.message }, { status: 401 });
    }
}
