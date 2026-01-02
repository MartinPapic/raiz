import { AuthClient } from '@auth0/nextjs-auth0/server';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('--- Testing AuthClient Instantiation ---');
try {
    const auth0 = new AuthClient({
        authorizationParameters: {
            audience: process.env.AUTH0_AUDIENCE,
            scope: 'openid profile email offline_access'
        },
        domain: process.env.AUTH0_DOMAIN,
        clientId: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        baseURL: process.env.AUTH0_BASE_URL,
        secret: process.env.AUTH0_SECRET,
        issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
        routes: {
            login: '/api/auth/login',
            callback: '/api/auth/callback',
            postLogoutRedirect: '/'
        }
    });
    console.log('--- AuthClient Inspection ---');
    console.log('AuthClient keys:', Object.keys(auth0));
    console.log('AuthClient.routes:', auth0.routes);

    if (!auth0.routes) {
        console.error('CRITICAL: auth0.routes is UNDEFINED');
    } else {
        console.log('Routes found:', JSON.stringify(auth0.routes, null, 2));
    }

    // Mock a NextRequest-like object (NextRequest extends Request but adds cookies)
    const mockReq = new Request('http://localhost:3000/api/auth/logout', {
        method: 'GET',
        headers: { host: 'localhost:3000' }
    });
    // Mock NextRequest.cookies
    mockReq.cookies = {
        get: (name) => {
            console.log(`Checking cookie: ${name}`);
            return undefined;
        },
        getAll: () => []
    };
    // Mock NextRequest.nextUrl (critical for AuthClient)
    mockReq.nextUrl = {
        pathname: '/api/auth/logout',
        basePath: '',
        searchParams: new URLSearchParams(''),
        toString: () => 'http://localhost:3000/api/auth/logout'
    };


    // mock context with params as promise (Next 15 style) or object
    const mockCtx = { params: Promise.resolve({ auth0: ['logout'] }) };
    // Wait, handler expects resolved params usually? Or the context object itself?
    // Let's try passing what we do in route.ts

    console.log('--- Testing Handler Invocation ---');
    try {
        const params = await mockCtx.params;
        const response = await auth0.handler(mockReq, { ...mockCtx, params });
        console.log('Handler returned status:', response.status);
    } catch (handlerError) {
        console.error('Handler crashed:', handlerError);
    }

} catch (e) {
    console.error('Instantiation failed:', e);
}

