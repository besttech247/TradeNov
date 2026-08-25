import { query } from '../../backend/core/db.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // NOTE: For a real app, user_id should come from session/JWT.
  // Hardcoding user_id = 1 for the scope of this project unless specified otherwise.
  const userId = 1;

  if (req.method === 'GET') {
    try {
      const keys = await query(
        `SELECT id, exchange, api_key, is_demo, created_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return res.status(200).json({ status: 'success', data: keys });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to fetch API keys' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { exchange, api_key, api_secret, passphrase, is_demo } = req.body;
      
      if (!exchange || !api_key || !api_secret) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
      }

      const result = await query(
        `INSERT INTO api_keys (user_id, exchange, api_key, api_secret, passphrase, is_demo)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, exchange, api_key, is_demo`,
        [userId, exchange, api_key, api_secret, passphrase, is_demo === true]
      );

      return res.status(201).json({ status: 'success', data: result[0] });
    } catch (error) {
      console.error('Error saving API key:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to save API key' });
    }
  }
  
  if (req.method === 'DELETE') {
      try {
          const { id } = req.body;
          if (!id) {
             return res.status(400).json({ status: 'error', message: 'Missing ID' }); 
          }
          await query(`DELETE FROM api_keys WHERE id = $1 AND user_id = $2`, [id, userId]);
          return res.status(200).json({ status: 'success' });
      } catch (error) {
          console.error('Error deleting API key:', error);
          return res.status(500).json({ status: 'error', message: 'Failed to delete API key' });
      }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
