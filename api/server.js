const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

app.post('/api/create-post', async (req, res) => {
    const { title, content } = req.body;
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = 'main'; 

    try {
        const postHtml = `<!DOCTYPE html><html><head><title>${title}</title></head>
        <body><h1>${title}</h1><p>${content.replace(/\n/g, '<br>')}</p>
        <a href="/posts/index.html">Back to Posts</a></body></html>`;

        await octokit.repos.createOrUpdateFileContents({
            owner, repo,
            path: `posts/${slug}.html`,
            message: `Add new post: ${title}`,
            content: Buffer.from(postHtml).toString('base64'),
            branch
        });

        const { data: indexData } = await octokit.repos.getContent({
            owner, repo,
            path: 'posts/index.html',
            ref: branch
        });

        let indexHtml = Buffer.from(indexData.content, 'base64').toString('utf8');
        const newLink = `<li><a href="/${repo}/posts/${slug}.html">${title}</a></li>`;
        
        indexHtml = indexHtml.replace('</ul>', `    ${newLink}\n    </ul>`);

        await octokit.repos.createOrUpdateFileContents({
            owner, repo,
            path: 'posts/index.html',
            message: `Update index with: ${title}`,
            content: Buffer.from(indexHtml).toString('base64'),
            sha: indexData.sha,
            branch
        });

        res.json({ success: true, url: `/${repo}/posts/${slug}.html` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));