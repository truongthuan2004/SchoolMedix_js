// controllers/post.controller.js
import { query } from '../config/database.js';

export const createPost = async (req, res) => {
      const { content } = req.body;

      if (!content) {
            return res.status(400).json({ error: 'Content is required' });
      }

      try {
            const result = await query(
                  'INSERT INTO posts (content) VALUES ($1) RETURNING *',
                  [content]
            );
            res.status(201).json(result.rows[0]);
      } catch (err) {
            console.error('❌ Database insert error:', err);
            res.status(500).json({ error: 'Database error' });
      }
};
