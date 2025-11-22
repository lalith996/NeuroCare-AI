# 🎯 NeuroCare AI - Complete Features Guide

## 📚 Table of Contents
- [Overview](#overview)
- [For Patients](#for-patients)
- [For Doctors](#for-doctors)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Components](#components)

---

## 🌟 Overview

NeuroCare AI now includes **9+ comprehensive features** for cognitive assessment, patient engagement, and medical analytics.

### ✅ Implemented Features

1. **Real-time Progress Tracking with Charts** 📊
2. **Memory Match Cognitive Game** 🎮
3. **Dark Mode Toggle** 🌓
4. **Gamification System** 🏆
5. **Search & Filtering** 🔍
6. **Notification System** 🔔
7. **Enhanced Patient Dashboard** 👤
8. **Enhanced Doctor Dashboard** 👨‍⚕️
9. **Data Export (CSV)** 📥

---

## 👤 For Patients

### Accessing the Enhanced Dashboard

**URL:** `/patient/enhanced-dashboard`

### Features Available:

#### 1. **Quick Stats Dashboard**
- Total Achievements Earned
- Total Points
- Current Streak (consecutive days)
- Longest Streak
- Total Games Played
- Global Leaderboard Rank

#### 2. **Cognitive Games** 🎮

##### Memory Match Game
- 16-card matching game
- Tests short-term memory
- Tracks time and moves
- Automatic score calculation
- Earns achievements on completion
- Updates activity streak

**How to Play:**
1. Navigate to "Games" tab
2. Click "Play Now" on Memory Match
3. Click cards to flip and match pairs
4. Complete all pairs to finish
5. Score is automatically submitted

#### 3. **Progress Tracking** 📈

View your cognitive performance over time:
- **Timeline Chart**: Score progression by day
- **Game Breakdown**: Performance by game type
- **Statistics**: Average score, total games, best score
- **Trend Indicator**: Improvement rate

**Available Views:**
- Last 30 days (default)
- Last 60 days
- Last 90 days

#### 4. **Achievements System** 🏆

Earn badges for various accomplishments:

**Categories:**
- **Games**: Play 10, 50, 100 games
- **Consistency**: 3, 7, 30-day streaks
- **Improvement**: 10%, 25% score improvement
- **Milestones**: First game, perfect score

**How to View:**
- Click "Achievements" tab
- Filter by category
- See earned and locked achievements
- Track progress towards next unlocks

#### 5. **Leaderboard** 🎯

Compete with other patients:
- View top 10 players
- See your current rank
- Compare points and achievements
- Track your position over time

---

## 👨‍⚕️ For Doctors

### Accessing the Enhanced Dashboard

**URL:** `/doctor/dashboard` (enhanced version available at `/doctor/dashboard/enhanced-page`)

### Features Available:

#### 1. **Comprehensive Stats** 📊
- Total Patients
- Active Assessments
- High Risk Patients
- Average Score across all patients

#### 2. **Search & Filtering** 🔍

**Search by:**
- Patient name
- Patient code
- Email address

**Filter by:**
- Risk Level (All, High, Medium, Low)

**Sort by:**
- Name (A-Z)
- Risk Level (High to Low)
- Progress (Most to Least complete)

**How to Use:**
1. Type in search box for instant filtering
2. Select risk level from dropdown
3. Choose sort order
4. Results update in real-time

#### 3. **Data Export** 📥

**Export patient data as CSV:**
- Click "Export CSV" button
- Downloads: `patients-YYYY-MM-DD.csv`
- Includes: Name, Code, Email, Risk Level
- Use for reports and analysis

#### 4. **Patient Analytics** 📈

**For each patient:**
- View detailed progress charts
- Compare across cognitive domains
- Track improvement trends
- Generate progress snapshots

**Accessing:**
1. Click "View" on any patient
2. See comprehensive progress charts
3. View game-specific performance
4. Create progress snapshots for records

#### 5. **Comparative Analytics**

View aggregated data across all patients:
- Average scores by age group
- Performance by cognitive domain
- Risk distribution
- Activity trends

**API Endpoint:** `GET /api/progress/comparative`

---

## 🗄️ Database Setup

### Running Migrations

```bash
cd server
npx ts-node src/scripts/run-migrations.ts
```

### Tables Created:
- `achievements` - Master achievement list (10 pre-configured)
- `user_achievements` - User progress tracking
- `activity_streaks` - Daily streak tracking
- `progress_snapshots` - Historical progress data
- `notifications` - In-app and email notifications
- `notification_preferences` - User notification settings
- `doctor_analytics` - Aggregated doctor statistics

### Pre-populated Data:
- 10 achievements across 4 categories
- Default notification preferences for all users

---

## 🔌 API Endpoints

### Gamification (`/api/gamification`)

```typescript
GET    /achievements          // Get all achievements with user progress
POST   /achievements/check    // Check for newly earned achievements
GET    /streak                // Get current activity streak
POST   /streak/update         // Update streak after game
GET    /leaderboard           // Get top players by points
```

### Progress Tracking (`/api/progress`)

```typescript
GET    /patient/:code                 // Get patient progress (supports ?days=30)
GET    /patient/:code/snapshots       // Get historical snapshots
POST   /patient/:code/snapshot        // Create new snapshot
GET    /comparative                   // Get comparative analytics (doctors)
```

### Notifications (`/api/notifications`)

```typescript
GET    /                         // Get notifications (?limit=50&unreadOnly=true)
PATCH  /:id/read                 // Mark notification as read
POST   /mark-all-read            // Mark all as read
GET    /preferences              // Get notification preferences
PUT    /preferences              // Update preferences
```

---

## 🎨 Components

### Frontend Components

#### Gamification
- **Achievements.tsx**: Display all achievements with filtering
- **Location**: `client/src/components/gamification/Achievements.tsx`

#### Progress Tracking
- **ProgressChart.tsx**: Visualize patient progress with charts
- **Location**: `client/src/components/progress/ProgressChart.tsx`
- **Uses**: Recharts for data visualization

#### Games
- **MemoryMatchGame.tsx**: Interactive memory game
- **Location**: `client/src/components/games/MemoryMatchGame.tsx`
- **Features**: Timer, move counter, score calculation

### Usage Example:

```typescript
import { Achievements } from '@/components/gamification/Achievements'
import { ProgressChart } from '@/components/progress/ProgressChart'
import { MemoryMatchGame } from '@/components/games/MemoryMatchGame'

// In your page:
<Achievements />
<ProgressChart patientCode="123" days={30} />
<MemoryMatchGame />
```

---

## 📱 User Flows

### Patient Flow

1. **Login** → Patient Dashboard
2. **View Stats** → Quick overview of progress
3. **Play Game** → Select and play Memory Match
4. **Earn Achievement** → Automatic unlock + notification
5. **Check Progress** → View charts and trends
6. **View Leaderboard** → Compare with others

### Doctor Flow

1. **Login** → Doctor Dashboard
2. **Search Patient** → Type name or code
3. **Filter by Risk** → Focus on high-risk patients
4. **View Patient** → See detailed progress
5. **Export Data** → Download CSV for records
6. **Check Analytics** → View comparative data

---

## 🎮 Game Integration

### How Games Work:

1. **User plays game** → Component tracks performance
2. **Game completes** → Score calculated
3. **API submission** → `POST /api/scores`
4. **Streak update** → `POST /api/gamification/streak/update`
5. **Achievement check** → `POST /api/gamification/achievements/check`
6. **Notifications** → User gets achievement notifications

### Score Calculation (Memory Match):

```javascript
moveScore = max(0, 100 - (moves - perfectMoves) * 5)
timeScore = max(0, 100 - floor(time / 2))
finalScore = round((moveScore + timeScore) / 2)
```

---

## 🔔 Notification System

### Types:
- **in_app**: Shown in dashboard
- **email**: Sent via email (requires SendGrid/SES setup)
- **sms**: SMS notifications (future)

### Categories:
- **achievement**: New achievements unlocked
- **reminder**: Daily game reminders
- **alert**: High-risk alerts (doctors)
- **report**: New reports available
- **system**: System announcements

### User Preferences:

Users can customize:
- Email reminders (on/off)
- Email reports (on/off)
- Email achievements (on/off)
- In-app notifications (on/off)
- Reminder frequency (daily/weekly/never)

**Access:** Patient Settings → Notifications

---

## 📊 Analytics & Reporting

### Available Analytics:

1. **Individual Patient**
   - Score trends over time
   - Game-specific performance
   - Improvement rate
   - Cognitive domain breakdown

2. **Comparative (Doctors)**
   - Patient cohort comparison
   - Average scores by demographics
   - Risk level distribution
   - Activity patterns

3. **Gamification**
   - Achievement earn rates
   - Leaderboard rankings
   - Streak statistics
   - Engagement metrics

---

## 🚀 Quick Start Guide

### For Development:

```bash
# 1. Install dependencies
npm install

# 2. Run database migrations
cd server
npx ts-node src/scripts/run-migrations.ts

# 3. Start development servers
cd ..
npm run dev
```

### For Testing:

**Patient Account:**
- Email: `patient1@demo.com`
- Password: `patient123`
- Access: `/patient/enhanced-dashboard`

**Doctor Account:**
- Email: `doctor@demo.com`
- Password: `doctor123`
- Access: `/doctor/dashboard`

---

## 🎯 Achievement List

| Code | Name | Description | Category | Points |
|------|------|-------------|----------|--------|
| first_game | First Steps | Complete your first game | milestones | 10 |
| games_10 | Dedicated Player | Complete 10 games | games | 50 |
| games_50 | Game Master | Complete 50 games | games | 200 |
| games_100 | Century Club | Complete 100 games | games | 500 |
| streak_3 | 3-Day Streak | Play for 3 consecutive days | consistency | 30 |
| streak_7 | Week Warrior | Play for 7 consecutive days | consistency | 100 |
| streak_30 | Monthly Marathon | Play for 30 consecutive days | consistency | 500 |
| improvement_10 | Getting Better | Improve score by 10% | improvement | 50 |
| improvement_25 | Rapid Progress | Improve score by 25% | improvement | 150 |
| perfect_score | Perfect Performance | Achieve a perfect score | milestones | 200 |

---

## 🔧 Technical Stack

### Frontend:
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI + Radix UI
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State**: Zustand + TanStack Query

### Backend:
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **Auth**: JWT

---

## 📈 Future Enhancements

Planned features:
- More cognitive games (Pattern Recognition, Attention Test, Language Tasks)
- PDF report generation
- Email integration (SendGrid/AWS SES)
- Real-time notifications
- Mobile app (PWA)
- Video/audio assessment
- Multi-language support
- Telehealth integration

---

## 🐛 Troubleshooting

### Common Issues:

**Issue**: Achievements not unlocking
- **Solution**: Check database connection, run migrations

**Issue**: Progress charts not showing
- **Solution**: Ensure patient has played games, check patientCode

**Issue**: Leaderboard empty
- **Solution**: Patients need to earn achievements first

**Issue**: Export button not working
- **Solution**: Ensure patients exist, check browser download permissions

---

## 📞 Support

For issues or questions:
- Check the [API Reference](API_REFERENCE.md)
- Review [Migration Guide](MIGRATION_COMPLETE.md)
- Submit issues on GitHub

---

**Built with ❤️ for cognitive health assessment**
