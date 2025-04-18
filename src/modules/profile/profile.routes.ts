import express from 'express';
import { ProfileService } from './profile.service';
import { validateRequest } from '../../middleware/validateRequest';
import { authMiddleware } from '../../middleware/auth';

const router = express.Router();
const profileService = new ProfileService();

// Create profile
router.post(
  '/',
  authMiddleware,
  validateRequest({
    body: {
      username: { type: 'string', required: true },
      bio: { type: 'string', required: false },
      location: { type: 'string', required: true },
      moq: { type: 'number', required: false },
      interests: { type: 'array', items: { type: 'string' }, required: false },
    },
  }),
  async (req, res) => {
    const profile = await profileService.createProfile(req.user.id, req.body);
    res.json(profile);
  }
);

// Update profile
router.put(
  '/',
  authMiddleware,
  validateRequest({
    body: {
      username: { type: 'string', required: false },
      bio: { type: 'string', required: false },
      location: { type: 'string', required: false },
      moq: { type: 'number', required: false },
      interests: { type: 'array', items: { type: 'string' }, required: false },
    },
  }),
  async (req, res) => {
    const profile = await profileService.updateProfile(req.user.id, req.body);
    res.json(profile);
  }
);

// Get profile
router.get('/', authMiddleware, async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);
  res.json(profile);
});

// Delete profile
router.delete('/', authMiddleware, async (req, res) => {
  await profileService.deleteProfile(req.user.id);
  res.json({ message: 'Profile deleted successfully' });
});

export default router; 