// Native fetch is available in Node 18+

// Replace with a valid slug from your database
const SLUG = 'partido-de-la-gente-oficializa-llamado-al-voto-nulo-tras-abrupto-rechazo-de-militancia-a-endosos';

async function checkCanonical() {
    try {
        const url = `http://localhost:3000/article/${SLUG}`;
        console.log(`Fetching: ${url}`);
        const res = await fetch(url);
        const html = await res.text();

        console.log("Status:", res.status);

        if (html.includes('rel="canonical"')) {
            console.log("SUCCESS: Canonical tag found!");
            const match = html.match(/<link rel="canonical" href="([^"]+)"/);
            console.log("Tag:", match ? match[0] : "Found but couldn't parse regex");
        } else {
            console.log("FAILURE: Canonical tag NOT found in HTML.");
            console.log("Partial HTML content (first 500 chars):");
            console.log(html.substring(0, 500));
        }
    } catch (error) {
        console.error("Error fetching page:", error);
    }
}

checkCanonical();
