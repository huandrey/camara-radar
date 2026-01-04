-- Ensure session_id is unique (required for upsert)
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_session_id_key;
ALTER TABLE sessions ADD CONSTRAINT sessions_session_id_key UNIQUE (session_id);

-- Ensure all detail columns exist (in case migration 002 wasn't run)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_number INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS pauta_url TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ata_url TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS anexo_url TEXT;
