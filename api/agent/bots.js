import { query } from '../../backend/core/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure table exists
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS active_bots (
        id SERIAL PRIMARY KEY,
        user_id UUID,
        name VARCHAR(255) NOT NULL,
        strategy VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        pnl NUMERIC(10, 2) DEFAULT 0.00,
        target NUMERIC(10, 2) DEFAULT 0.00,
        allocation NUMERIC(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error('Error ensuring table exists:', err);
  }

  // Mock user for now since auth might not be fully wired on serverless
  const userId = '00000000-0000-0000-0000-000000000000';

  try {
    if (req.method === 'GET') {
      const result = await query('SELECT * FROM active_bots ORDER BY id DESC');
      return res.status(200).json({ status: 'success', data: result.rows });
    }

    if (req.method === 'POST') {
      const { name, strategy, target, allocation } = req.body;
      const result = await query(
        `INSERT INTO active_bots (user_id, name, strategy, target, allocation, status) 
         VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
        [userId, name, strategy, target || 0, allocation || 0]
      );
      return res.status(201).json({ status: 'success', data: result.rows[0] });
    }

    if (req.method === 'PUT') {
      const { id, status, pnl } = req.body;
      let updateQuery = 'UPDATE active_bots SET ';
      const values = [];
      let paramIdx = 1;

      if (status) {
        updateQuery += `status = $${paramIdx}, `;
        values.push(status);
        paramIdx++;
      }
      if (pnl !== undefined) {
        updateQuery += `pnl = $${paramIdx}, `;
        values.push(pnl);
        paramIdx++;
      }

      updateQuery = updateQuery.slice(0, -2); // remove last comma
      updateQuery += ` WHERE id = $${paramIdx} RETURNING *`;
      values.push(id);

      const result = await query(updateQuery, values);
      return res.status(200).json({ status: 'success', data: result.rows[0] });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await query('DELETE FROM active_bots WHERE id = $1', [id]);
      return res.status(200).json({ status: 'success', message: 'Bot deleted' });
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Bot API Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
