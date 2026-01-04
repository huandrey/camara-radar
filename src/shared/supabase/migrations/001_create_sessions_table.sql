-- Create enum type for detail status
CREATE TYPE detail_status AS ENUM ('NAO_COLETADO', 'PROCESSANDO', 'COLETADO', 'ERRO');

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  opening_date TIMESTAMP WITH TIME ZONE NOT NULL,
  legislature TEXT NOT NULL,
  legislative_session TEXT NOT NULL,
  url TEXT NOT NULL,
  detalhes_coletados detail_status NOT NULL DEFAULT 'NAO_COLETADO',
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_opening_date ON sessions(opening_date);
CREATE INDEX IF NOT EXISTS idx_sessions_scraped_at ON sessions(scraped_at);
CREATE INDEX IF NOT EXISTS idx_sessions_detalhes_coletados ON sessions(detalhes_coletados);
