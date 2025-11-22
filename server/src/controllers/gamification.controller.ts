import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

/**
 * Get user achievements and progress
 */
export const getUserAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all achievements with user progress
    const query = `
      SELECT
        a.id,
        a.code,
        a.name,
        a.description,
        a.category,
        a.icon,
        a.points,
        a.requirement,
        COALESCE(ua.earned_at, NULL) as earned_at,
        COALESCE(ua.progress, 0) as progress,
        CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as is_earned
      FROM neurocare.achievements a
      LEFT JOIN neurocare.user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
      ORDER BY a.category, a.points
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      achievements: result.rows,
      totalEarned: result.rows.filter((a: any) => a.is_earned).length,
      totalPoints: result.rows
        .filter((a: any) => a.is_earned)
        .reduce((sum: number, a: any) => sum + a.points, 0),
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

/**
 * Get user activity streak
 */
export const getUserStreak = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      'SELECT * FROM neurocare.activity_streaks WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create initial streak record
      const newStreak = await pool.query(
        `INSERT INTO neurocare.activity_streaks (user_id, current_streak, longest_streak, last_activity_date)
         VALUES ($1, 0, 0, CURRENT_DATE)
         RETURNING *`,
        [userId]
      );
      res.json(newStreak.rows[0]);
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
};

/**
 * Update streak after game completion
 */
export const updateStreak = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get current streak
    const streakResult = await pool.query(
      'SELECT * FROM neurocare.activity_streaks WHERE user_id = $1',
      [userId]
    );

    let streak;
    const today = new Date().toISOString().split('T')[0];

    if (streakResult.rows.length === 0) {
      // Create new streak
      streak = await pool.query(
        `INSERT INTO neurocare.activity_streaks
         (user_id, current_streak, longest_streak, last_activity_date, total_games_played)
         VALUES ($1, 1, 1, $2, 1)
         RETURNING *`,
        [userId, today]
      );
    } else {
      const current = streakResult.rows[0];
      const lastDate = new Date(current.last_activity_date);
      const todayDate = new Date(today);
      const dayDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = current.current_streak;

      if (dayDiff === 0) {
        // Same day, just increment games played
        streak = await pool.query(
          `UPDATE neurocare.activity_streaks
           SET total_games_played = total_games_played + 1,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1
           RETURNING *`,
          [userId]
        );
      } else if (dayDiff === 1) {
        // Consecutive day - increment streak
        newStreak = current.current_streak + 1;
        const newLongest = Math.max(newStreak, current.longest_streak);

        streak = await pool.query(
          `UPDATE neurocare.activity_streaks
           SET current_streak = $1,
               longest_streak = $2,
               last_activity_date = $3,
               total_games_played = total_games_played + 1,
               total_login_days = total_login_days + 1,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $4
           RETURNING *`,
          [newStreak, newLongest, today, userId]
        );

        // Check for streak achievements
        await checkStreakAchievements(userId, newStreak);
      } else {
        // Streak broken - reset to 1
        streak = await pool.query(
          `UPDATE neurocare.activity_streaks
           SET current_streak = 1,
               last_activity_date = $1,
               total_games_played = total_games_played + 1,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $2
           RETURNING *`,
          [today, userId]
        );
      }
    }

    res.json(streak.rows[0]);
  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
};

/**
 * Check and award achievements based on criteria
 */
export const checkAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const newlyEarned: any[] = [];

    // Get total games played
    const streakResult = await pool.query(
      'SELECT total_games_played FROM neurocare.activity_streaks WHERE user_id = $1',
      [userId]
    );
    const gamesPlayed = streakResult.rows[0]?.total_games_played || 0;

    // Check game-based achievements
    const gameAchievements = [
      { code: 'first_game', required: 1 },
      { code: 'games_10', required: 10 },
      { code: 'games_50', required: 50 },
      { code: 'games_100', required: 100 },
    ];

    for (const achievement of gameAchievements) {
      if (gamesPlayed >= achievement.required) {
        const awarded = await awardAchievement(userId, achievement.code);
        if (awarded) {
          newlyEarned.push(awarded);
        }
      }
    }

    res.json({ newlyEarned });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
};

/**
 * Helper function to check streak achievements
 */
async function checkStreakAchievements(userId: number, streak: number): Promise<void> {
  const streakAchievements = [
    { code: 'streak_3', required: 3 },
    { code: 'streak_7', required: 7 },
    { code: 'streak_30', required: 30 },
  ];

  for (const achievement of streakAchievements) {
    if (streak >= achievement.required) {
      await awardAchievement(userId, achievement.code);
    }
  }
}

/**
 * Helper function to award an achievement to a user
 */
async function awardAchievement(userId: number, code: string): Promise<any> {
  try {
    // Get achievement details
    const achievementResult = await pool.query(
      'SELECT * FROM neurocare.achievements WHERE code = $1',
      [code]
    );

    if (achievementResult.rows.length === 0) {
      return null;
    }

    const achievement = achievementResult.rows[0];

    // Check if already earned
    const existingResult = await pool.query(
      'SELECT id FROM neurocare.user_achievements WHERE user_id = $1 AND achievement_id = $2',
      [userId, achievement.id]
    );

    if (existingResult.rows.length > 0) {
      return null; // Already earned
    }

    // Award achievement
    await pool.query(
      'INSERT INTO neurocare.user_achievements (user_id, achievement_id, progress) VALUES ($1, $2, 100)',
      [userId, achievement.id]
    );

    // Create notification
    await pool.query(
      `INSERT INTO neurocare.notifications (user_id, type, category, subject, message, data)
       VALUES ($1, 'in_app', 'achievement', $2, $3, $4)`,
      [
        userId,
        'Achievement Unlocked!',
        `Congratulations! You've earned the "${achievement.name}" achievement.`,
        JSON.stringify({ achievement_code: code, points: achievement.points }),
      ]
    );

    return achievement;
  } catch (error) {
    console.error('Award achievement error:', error);
    return null;
  }
}

/**
 * Get leaderboard (top users by points)
 */
export const getLeaderboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        u.id,
        u.full_name,
        u.role,
        COUNT(ua.id) as achievements_earned,
        COALESCE(SUM(a.points), 0) as total_points
      FROM neurocare.users u
      LEFT JOIN neurocare.user_achievements ua ON u.id = ua.user_id
      LEFT JOIN neurocare.achievements a ON ua.achievement_id = a.id
      WHERE u.role = 'patient'
      GROUP BY u.id, u.full_name, u.role
      HAVING COUNT(ua.id) > 0
      ORDER BY total_points DESC
      LIMIT 50
    `;

    const result = await pool.query(query);
    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
