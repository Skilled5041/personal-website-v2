export const prerender = false

export async function GET() {
    const apiUrl = "https://api.github.com/repos/skilled5041/personal-website-v2/commits?per_page=1";
    const response = await fetch(apiUrl);
    const data = await response.json();
    const shortSha = data[0].sha.substring(0, 7);
    const commitUrl = data[0].html_url;
    const commitDate = data[0].commit.author.date;

    return new Response(JSON.stringify({shortSha, commitUrl, commitDate}), {
        headers: {"Content-Type": "application/json"}
    });
}