ALTER TABLE print_jobs
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '30 minutes');

CREATE OR REPLACE FUNCTION cleanup_print_jobs()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM print_jobs
  WHERE expires_at < NOW() - INTERVAL '1 hour';

  DELETE FROM print_jobs
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM print_jobs
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC
      LIMIT 50
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_print_jobs ON print_jobs;

CREATE TRIGGER trigger_cleanup_print_jobs
  AFTER INSERT ON print_jobs
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_print_jobs();
