const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: { encrypt: true, trustServerCertificate: true }
};

async function initErpDB() {
    try {
        await sql.connect(dbConfig);
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ErpCompanies' and xtype='U')
            BEGIN
                CREATE TABLE ErpCompanies (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Name NVARCHAR(100) NOT NULL,
                    Type NVARCHAR(50) NOT NULL
                )
            END

            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ErpUsers' and xtype='U')
            BEGIN
                CREATE TABLE ErpUsers (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Username NVARCHAR(50) UNIQUE NOT NULL,
                    PasswordHash NVARCHAR(255) NOT NULL,
                    Role NVARCHAR(20) NOT NULL,
                    CompanyId INT NULL FOREIGN KEY REFERENCES ErpCompanies(Id),
                    IsActive BIT NOT NULL DEFAULT 1
                )
            END
        `);
        console.log("Line ERP Database tables are ready.");
    } catch (err) {
        console.error("Line ERP Database Connection Failed:", err.message);
    }
}
initErpDB();

app.get('/api/check-setup', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT COUNT(*) as count FROM ErpUsers");
        res.json({ success: true, isSetup: result.recordset[0].count > 0 });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/setup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const check = await pool.request().query("SELECT COUNT(*) as count FROM ErpUsers");
        if (check.recordset[0].count > 0) return res.status(400).json({ success: false, error: "System already initialized." });

        const hash = await bcrypt.hash(password, 10);
        await pool.request()
            .input('u', sql.NVarChar, username)
            .input('h', sql.NVarChar, hash)
            .input('r', sql.NVarChar, 'SuperAdmin')
            .query("INSERT INTO ErpUsers (Username, PasswordHash, Role) VALUES (@u, @h, @r)");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().input('u', sql.NVarChar, username).query("SELECT * FROM ErpUsers WHERE Username = @u");
        if (result.recordset.length === 0) return res.status(401).json({ success: false, error: "Invalid credentials." });
        
        const user = result.recordset[0];
        if (!user.IsActive) return res.status(403).json({ success: false, error: "Account disabled." });

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) return res.status(401).json({ success: false, error: "Invalid credentials." });

        const token = jwt.sign(
            { userId: user.Id, username: user.Username, role: user.Role, companyId: user.CompanyId }, 
            process.env.JWT_SECRET || 'fallback-secret', 
            { expiresIn: '24h' }
        );
        res.json({ success: true, token, role: user.Role, username: user.Username, companyId: user.CompanyId });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: "Missing token" });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        next();
    } catch (err) { res.status(401).json({ success: false, error: "Session expired" }); }
};

app.get('/api/dashboard', requireAuth, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        if (req.user.role === 'SuperAdmin') {
            const companies = await pool.request().query("SELECT * FROM ErpCompanies");
            const users = await pool.request().query("SELECT Username, Role FROM ErpUsers WHERE Role != 'SuperAdmin'");
            res.json({ success: true, companies: companies.recordset, users: users.recordset });
        } else {
            const companyRes = await pool.request().input('cId', sql.Int, req.user.companyId).query("SELECT * FROM ErpCompanies WHERE Id = @cId");
            const usersRes = await pool.request().input('cId', sql.Int, req.user.companyId).query("SELECT Username, Role FROM ErpUsers WHERE CompanyId = @cId");
            res.json({ success: true, company: companyRes.recordset[0], users: usersRes.recordset });
        }
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/companies', requireAuth, async (req, res) => {
    if (req.user.role !== 'SuperAdmin') return res.status(403).json({ error: "Access denied." });
    const { name, type, adminUsername, adminPassword } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const check = await pool.request().input('u', sql.NVarChar, adminUsername).query("SELECT Id FROM ErpUsers WHERE Username = @u");
        if (check.recordset.length > 0) return res.status(400).json({ error: "Username already taken." });

        const hash = await bcrypt.hash(adminPassword, 10);
        
        // Insert company, get its ID, then insert the CompanyAdmin account dynamically linked to it
        const compRes = await pool.request()
            .input('n', sql.NVarChar, name)
            .input('t', sql.NVarChar, type)
            .query("INSERT INTO ErpCompanies (Name, Type) OUTPUT INSERTED.Id VALUES (@n, @t)");
        const newCompanyId = compRes.recordset[0].Id;

        await pool.request()
            .input('u', sql.NVarChar, adminUsername)
            .input('h', sql.NVarChar, hash)
            .input('r', sql.NVarChar, 'CompanyAdmin')
            .input('c', sql.Int, newCompanyId)
            .query("INSERT INTO ErpUsers (Username, PasswordHash, Role, CompanyId) VALUES (@u, @h, @r, @c)");
            
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/users', requireAuth, async (req, res) => {
    if (req.user.role !== 'CompanyAdmin') return res.status(403).json({ error: "Access denied." });
    const { username, password, role } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const check = await pool.request().input('u', sql.NVarChar, username).query("SELECT Id FROM ErpUsers WHERE Username = @u");
        if (check.recordset.length > 0) return res.status(400).json({ error: "Username already taken." });

        const hash = await bcrypt.hash(password, 10);
        await pool.request()
            .input('u', sql.NVarChar, username)
            .input('h', sql.NVarChar, hash)
            .input('r', sql.NVarChar, role || 'Employee')
            .input('c', sql.Int, req.user.companyId)
            .query("INSERT INTO ErpUsers (Username, PasswordHash, Role, CompanyId) VALUES (@u, @h, @r, @c)");
            
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

const PORT = process.env.ERP_PORT || 3001;
app.listen(PORT, () => console.log(`Line ERP Server running on port ${PORT}`));