import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { signToken } from '../middleware/auth.js';
import { firebaseAuth } from '../firebaseAdmin.js';

const router: RouterType = Router();

// ═══════════════════════════════════
// POST /auth/firebase
// Verify Firebase ID token, upsert athlete, return our JWT
// ═══════════════════════════════════
const firebaseAuthSchema = z.object({
  idToken: z.string().min(1),
});

router.post('/firebase', async (req, res) => {
  try {
    const { idToken } = firebaseAuthSchema.parse(req.body);

    // Verify the Firebase ID token
    const decoded = await firebaseAuth.verifyIdToken(idToken);

    const { uid, email, name, picture } = decoded;
    if (!email) {
      res.status(401).json({ error: 'No email in Firebase token' });
      return;
    }

    // Upsert: create if new, update picture if returning
    const result = await pool.query(
      `INSERT INTO athletes (google_id, email, name, picture_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_id) DO UPDATE
         SET email = EXCLUDED.email,
             name = CASE WHEN athletes.name = '' THEN EXCLUDED.name ELSE athletes.name END,
             picture_url = EXCLUDED.picture_url,
             updated_at = NOW()
       RETURNING id, google_id, email, name, picture_url, age, height, weight,
                 power_level, current_block, current_week,
                 total_sessions_completed, streak_days, five_km_time, onboarded`,
      [uid, email, name || '', picture || ''],
    );

    const athlete = result.rows[0];
    const token = signToken({ athleteId: athlete.id, email: athlete.email });

    res.json({ token, athlete, isNewUser: !athlete.onboarded });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    console.error('Firebase auth error:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

export default router;
