# NeuroCare AI - Neon PostgreSQL Setup

## Quick Setup with Neon Database

Your NeuroCare AI platform is now configured to use Neon PostgreSQL (serverless PostgreSQL).

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-multipart pandas joblib scikit-learn
```

### Step 2: Create Database Schema

```bash
python backend/create_neon_schema.py
```

This will:
- Connect to your Neon database
- Create the `neurocare` schema
- Create all 7 tables:
  - `neurocare.users`
  - `neurocare.patients`
  - `neurocare.game_scores`
  - `neurocare.predictions`
  - `neurocare.game_assignments`
  - `neurocare.medical_documents`
  - `neurocare.patient_reports`

### Step 3: Setup Demo Data

```bash
python scripts/setup_doctor_patient_demo.py
```

Creates:
- 1 Doctor: `doctor@demo.com` / `doctor123`
- 3 Patients: `patient1@demo.com`, `patient2@demo.com`, `patient3@demo.com` / `patient123`

### Step 4: Start Backend

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Access Frontend

Open in browser:
- Doctor Dashboard: `frontend/doctor_dashboard_v2.html`
- Patient Dashboard: `frontend/patient_dashboard.html`

## Database Connection Details

**Connection String:**
```
postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Schema:** `neurocare`

**Connection Pooling:** Enabled with `pool_pre_ping=True` for serverless compatibility

## Verify Database

### Using psql CLI:

```bash
psql 'postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
```

Then run:
```sql
-- List all schemas
\dn

-- Set search path
SET search_path TO neurocare, public;

-- List tables
\dt

-- View users
SELECT id, email, role FROM users;

-- View patients
SELECT * FROM patients;

-- View game assignments
SELECT * FROM game_assignments;
```

### Using Python:

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
)

with engine.connect() as conn:
    # List tables
    result = conn.execute(text(
        "SELECT table_name FROM information_schema.tables "
        "WHERE table_schema = 'neurocare'"
    ))
    for row in result:
        print(row[0])
    
    # Count users
    result = conn.execute(text("SELECT COUNT(*) FROM neurocare.users"))
    print(f"Total users: {result.scalar()}")
```

## Environment Variables (Optional)

For production, set environment variable:

```bash
export DATABASE_URL="postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

Or create `.env` file:
```
DATABASE_URL=postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-key-here
```

## Neon-Specific Features

### Serverless Benefits:
- ✅ Auto-scaling
- ✅ Auto-suspend when idle (saves costs)
- ✅ Instant branching for dev/test
- ✅ Point-in-time recovery
- ✅ No server management

### Connection Pooling:
The app uses `pool_pre_ping=True` to handle Neon's serverless nature:
- Validates connections before use
- Handles auto-suspend/resume gracefully
- Prevents stale connection errors

### Schema Isolation:
All tables are in the `neurocare` schema:
- Keeps your data organized
- Avoids conflicts with other apps
- Easy to backup/restore specific schema

## Troubleshooting

### Connection timeout
```bash
# Neon may auto-suspend. First connection might be slow.
# Just retry - it will wake up the database.
```

### SSL errors
```bash
# Ensure sslmode=require is in connection string
# Neon requires SSL connections
```

### Schema not found
```bash
# Run schema creation script
python backend/create_neon_schema.py
```

### Table not found
```bash
# Check search_path is set correctly
# Tables are in 'neurocare' schema, not 'public'
```

## Migration from MySQL

If you were using MySQL before:

1. ✅ Database driver changed: `pymysql` → `psycopg2-binary`
2. ✅ Connection string updated
3. ✅ Schema added: All tables now in `neurocare` schema
4. ✅ TEXT type used for long strings (instead of VARCHAR)
5. ✅ Connection pooling optimized for serverless

No code changes needed - SQLAlchemy handles the differences!

## Performance Tips

1. **Connection Pooling**: Already configured
2. **Indexes**: Already added on frequently queried columns
3. **Prepared Statements**: SQLAlchemy uses them automatically
4. **Batch Operations**: Use bulk inserts for game scores

## Backup & Recovery

### Manual Backup:
```bash
pg_dump 'postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' \
  --schema=neurocare \
  > neurocare_backup.sql
```

### Restore:
```bash
psql 'postgresql://...' < neurocare_backup.sql
```

### Neon Console:
- Use Neon web console for point-in-time recovery
- Create branches for testing
- Monitor query performance

## Next Steps

1. ✅ Database configured with Neon PostgreSQL
2. ✅ Schema created
3. ✅ Demo data loaded
4. 🚀 Start building!

Your NeuroCare AI platform is now running on serverless PostgreSQL with Neon! 🎉
