export async function getAuthToken(): Promise<string> {
    try {
        // Fetch the access token from the dedicated token API route
        const response = await fetch('/api/auth/token');
        if (response.ok) {
            const data = await response.json();
            return data.accessToken || '';
        }
    } catch (e) {
        console.error('Failed to get access token', e);
    }
    return '';
}
