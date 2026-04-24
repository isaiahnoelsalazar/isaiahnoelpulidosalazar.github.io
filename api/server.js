const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

async function initDB() {
    try {
        await sql.connect(dbConfig);
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U')
            CREATE TABLE Users (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                Username NVARCHAR(50) UNIQUE NOT NULL,
                PasswordHash NVARCHAR(255) NOT NULL
            )
        `);
        console.log("Database connected & Users table ready.");
    } catch (err) {
        console.error("Database Connection Failed:", err.message);
    }
}
initDB();

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: "Missing fields" });

    try {
        const pool = await sql.connect(dbConfig);
        
        const checkUser = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT Id FROM Users WHERE Username = @username');
            
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ success: false, error: "Username already taken." });
        }

        const hash = await bcrypt.hash(password, 10);
        
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('hash', sql.NVarChar, hash)
            .query('INSERT INTO Users (Username, PasswordHash) VALUES (@username, @hash)');
            
        res.json({ success: true, message: "Registered successfully! You can now log in." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Database error." });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: "Missing fields" });

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @username');
            
        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, error: "Invalid username or password." });
        }

        const user = result.recordset[0];
        
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Invalid username or password." });
        }

        const token = jwt.sign({ userId: user.Id, username: user.Username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ success: true, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Database error." });
    }
});

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: "Unauthorized. Missing token." });
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: "Session expired or invalid. Please log in again." });
    }
};

app.post('/api/create-post', requireAuth, async (req, res) => {
    const { title, content } = req.body;
    const authorUsername = req.user.username;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = 'main'; 

    try {
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const publishDate = new Date().toLocaleDateString('en-US', dateOptions);

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
        
        <h1 class="color-var(--ec-text,_#212529) marginTop-24px marginBottom-8px fontSize-32px">${title}</h1>
        <p class="color-var(--ec-text-muted,_#6c757d) fontSize-14px margin-0">Published on ${publishDate} by ${authorUsername}</p>
        
        <hr class="borderTop-1px_solid_var(--ec-border,_#dee2e6) borderBottom-none margin-24px_0">
        <div class="color-var(--ec-text,_#212529) fontSize-16px lineHeight-1.6">
            ${content.replace(/\n/g, '<br>')}
        </div>
    </div>
</body>
</html>`;

        await octokit.repos.createOrUpdateFileContents({
            owner, repo, path: `posts/${slug}.html`,
            message: `Add new post: ${title} by ${authorUsername}`,
            content: Buffer.from(postHtml).toString('base64'),
            branch
        });

        const { data: indexData } = await octokit.repos.getContent({
            owner, repo, path: 'posts/index.html', ref: branch
        });

        let indexHtml = Buffer.from(indexData.content, 'base64').toString('utf8');
        
        const date = new Date();
        date.setHours(date.getHours() + 8);

        const dateOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
        };

        const publishDate = date.toLocaleString('en-US', dateOptions);
        
        const newLink = `
        <div class="padding-20px border-1px_solid_var(--ec-border,_#dee2e6) borderRadius-12px background-#fff hover:boxShadow-0_4px_16px_rgba(0,0,0,0.08) transition-boxShadow_0.2s_ease">
            <h2 class="margin-0"><a href="${slug}.html" class="color-var(--ec-text,_#212529) textDecoration-none hover:color-var(--ec-accent,_#1a73e8)">${title}</a></h2>
            <p class="color-var(--ec-text-muted,_#6c757d) fontSize-14px marginTop-8px marginBottom-0">Published on ${publishDate} by ${authorUsername}</p>
        </div>`;
        
        indexHtml = indexHtml.replace('<!-- INJECT_HERE -->', `<!-- INJECT_HERE -->\n${newLink}`);

        await octokit.repos.createOrUpdateFileContents({
            owner, repo, path: 'posts/index.html',
            message: `Update index with: ${title}`,
            content: Buffer.from(indexHtml).toString('base64'),
            sha: indexData.sha, branch
        });

        res.json({ success: true, url: `/${slug}.html` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));