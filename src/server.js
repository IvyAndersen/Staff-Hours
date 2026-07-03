// server.js
// Express server that serves the built Staff Hours frontend and exposes
// GET /api/employees, which reads active employees directly from Airtable.
// The Airtable token stays server-side (env var) and is never sent to the browser.

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appFwWJwzZq75TN0l';
const AIRTABLE_EMPLOYEES_TABLE_ID = process.env.AIRTABLE_EMPLOYEES_TABLE_ID || 'tbl0DalKH83WICpEy';

app.get('/api/employees', async (req, res) => {
  if (!AIRTABLE_TOKEN) {
    console.error('AIRTABLE_TOKEN env var is not set');
    return res.status(500).json({ error: 'Server is not configured with an Airtable token' });
  }

  try {
    const fields = ['Name', 'Staff ID', 'role', 'Wage Rate', 'Percentage', 'Department', 'Active'];
    const baseParams = new URLSearchParams();
    baseParams.set('filterByFormula', '{Active} = TRUE()');
    fields.forEach((f) => baseParams.append('fields[]', f));

    const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_EMPLOYEES_TABLE_ID}?${baseParams.toString()}`;

    let allRecords = [];
    let offset;

    do {
      const pageUrl = offset ? `${baseUrl}&offset=${offset}` : baseUrl;
      const response = await fetch(pageUrl, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Airtable error ${response.status}: ${text}`);
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset;
    } while (offset);

    const employees = allRecords
      .map((record) => {
        const f = record.fields;
        return {
          id: f['Staff ID'],
          name: f['Name'],
          role: f['role'] || '',
          department: f['Department'] || 'General',
          wage: f['Wage Rate'] || 0,
          percentage: f['Percentage'] ?? 0,
        };
      })
      .filter((emp) => emp.id != null && emp.name)
      .sort((a, b) => a.id - b.id);

    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees from Airtable:', err);
    res.status(502).json({ error: 'Failed to fetch employees from Airtable' });
  }
});

// Serve the built frontend (output of `npm run build`)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Staff Hours server listening on port ${PORT}`);
});
