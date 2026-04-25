import { Router } from 'express';
import User from '../models/User';

const router = Router();

// Middleware to check API key
const authorize = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];
  const secret = process.env.API_SECRET || 'dev_secret_key_123';
  if (!apiKey || apiKey !== secret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
};

// GET user by externalId
router.get('/:id', authorize, async (req, res) => {
  try {
    const user = await User.findOne({ externalId: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST sync user data
router.post('/sync', authorize, async (req, res) => {
  const { externalId, ...updates } = req.body;
  try {
    let user = await User.findOneAndUpdate(
      { externalId },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
