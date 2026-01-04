-- Create session_order_of_day table
CREATE TABLE IF NOT EXISTS session_order_of_day (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    external_id INTEGER UNIQUE NOT NULL,
    order_number INTEGER,
    content TEXT,
    result TEXT,
    materia_id INTEGER,
    data_ordem DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_attendance table
CREATE TABLE IF NOT EXISTS session_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    external_id INTEGER UNIQUE NOT NULL,
    parliamentarian_id INTEGER,
    parliamentarian_name TEXT,
    present BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_order_session_id ON session_order_of_day(session_id);
CREATE INDEX IF NOT EXISTS idx_session_attendance_session_id ON session_attendance(session_id);
