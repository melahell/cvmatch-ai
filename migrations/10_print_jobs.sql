CREATE TABLE IF NOT EXISTS print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes')
);

CREATE INDEX IF NOT EXISTS idx_print_jobs_user_id ON print_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_expires_at ON print_jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_print_jobs_token ON print_jobs(token);

ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own print jobs"
  ON print_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own print jobs"
  ON print_jobs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own print jobs"
  ON print_jobs FOR DELETE
  USING (user_id = auth.uid());
