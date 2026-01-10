
import { Octokit } from "octokit";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;

// Validation au démarrage
if (!REPO_OWNER || !REPO_NAME) {
    console.warn(
        "⚠️ GitHub configuration incomplete:\n" +
        "GITHUB_REPO_OWNER and GITHUB_REPO_NAME should be set in environment variables.\n" +
        "GitHub sync will be disabled."
    );
}

// Initialize Octokit
const octokit = new Octokit({
    auth: GITHUB_TOKEN,
});

export async function pushToGitHub(path: string, content: string, message: string) {
    if (!GITHUB_TOKEN) {
        console.warn("GITHUB_TOKEN missing, skipping GitHub sync");
        return null;
    }

    try {
        // 1. Get current file SHA (if exists) to update
        let sha;
        try {
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: path,
            });
            if (!Array.isArray(data)) {
                sha = data.sha;
            }
        } catch (e) {
            // File doesn't exist, that's fine
        }

        // 2. Create or Update file
        const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: path,
            message: message,
            committer: {
                name: 'CVMatch AI Bot',
                email: 'bot@cvmatch.ai'
            },
            content: Buffer.from(content).toString('base64'),
            sha: sha, // Include SHA if updating
        });

        return response.data;
    } catch (error) {
        console.error("GitHub Push Error:", error);
        return null;
    }
}
