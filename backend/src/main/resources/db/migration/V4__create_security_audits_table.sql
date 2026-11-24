-- V4: Create security audit reports table
CREATE TABLE IF NOT EXISTS security_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_score INT NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    summary TEXT NOT NULL,
    vulnerabilities TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audits_repository_id ON security_audits(repository_id);
