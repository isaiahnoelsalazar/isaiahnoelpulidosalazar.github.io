const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

app.post('/api/create-post', async (req, res) => {
    const { title, content, password } = req.body;
    
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, error: "Unauthorized. Incorrect password." });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = 'main'; 

    try {
        const postHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="../js/ECStyleSheet.js"></script>
    <script src="../js/ECElements.js"></script>
</head>
<body class="background-var(--ec-surface,_#f8f9fa) padding-20px margin-0">
    <div class="maxWidth-800px margin-40px_auto background-var(--ec-bg,_#fff) padding-32px borderRadius-12px boxShadow-0_4px_12px_rgba(0,0,0,0.05) border-1px_solid_var(--ec-border,_#dee2e6)">
        <a href="/posts/" class="color-var(--ec-text-muted,_#6c757d) textDecoration-none hover:color-var(--ec-accent,_#1a73e8) fontSize-14px fontWeight-500">← Back to Posts</a>
        <h1 class="color-var(--ec-text,_#212529) marginTop-24px marginBottom-16px fontSize-32px">${title}</h1>
        <hr class="borderTop-1px_solid_var(--ec-border,_#dee2e6) borderBottom-none margin-24px_0">
        <div class="color-var(--ec-text,_#212529) fontSize-16px lineHeight-1.6">
            ${content.replace(/\n/g, '<br>')}
        </div>
    </div>
</body>
</html>`;

        await octokit.repos.createOrUpdateFileContents({
            owner, repo,
            path: `posts/${slug}.html`,
            message: `Add new post: ${title}`,
            content: Buffer.from(postHtml).toString('base64'),
            branch
        });

        const { data: indexData } = await octokit.repos.getContent({
            owner, repo,
            path: 'posts/',
            ref: branch
        });

        let indexHtml = Buffer.from(indexData.content, 'base64').toString('utf8');
        
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const publishDate = new Date().toLocaleDateString('en-US', dateOptions);

        const newLink = `
        <div class="padding-20px border-1px_solid_var(--ec-border,_#dee2e6) borderRadius-12px background-#fff hover:boxShadow-0_4px_16px_rgba(0,0,0,0.08) transition-boxShadow_0.2s_ease">
            <h2 class="margin-0"><a href="${slug}.html" class="color-var(--ec-text,_#212529) textDecoration-none hover:color-var(--ec-accent,_#1a73e8)">${title}</a></h2>
            <p class="color-var(--ec-text-muted,_#6c757d) fontSize-14px marginTop-8px marginBottom-0">Published on ${publishDate}</p>
        </div>`;
        
        indexHtml = indexHtml.replace('<!-- INJECT_HERE -->', `<!-- INJECT_HERE -->\n${newLink}`);

        await octokit.repos.createOrUpdateFileContents({
            owner, repo,
            path: 'posts/',
            message: `Update index with: ${title}`,
            content: Buffer.from(indexHtml).toString('base64'),
            sha: indexData.sha,
            branch
        });

        res.json({ success: true, url: `/${slug}.html` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));