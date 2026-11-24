CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    github_id BIGINT NOT NULL UNIQUE,

    github_username VARCHAR(100) NOT NULL,

    display_name VARCHAR(200) NOT NULL,

    avatar_url VARCHAR(500),

    access_token TEXT NOT NULL,

    token_scopes VARCHAR(500),

    created_at TIMESTAMP WITH TIME ZONE NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL,

    github_repo_id BIGINT NOT NULL,

    owner VARCHAR(100) NOT NULL,

    name VARCHAR(200) NOT NULL,

    full_name VARCHAR(300) NOT NULL,

    is_private BOOLEAN NOT NULL DEFAULT FALSE,

    default_branch VARCHAR(100) NOT NULL,

    language VARCHAR(100),

    html_url VARCHAR(500),

    description TEXT,

    index_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    indexed_at TIMESTAMP WITH TIME ZONE,

    chunk_count INTEGER NOT NULL DEFAULT 0,

    files_total INTEGER NOT NULL DEFAULT 0,

    files_processed INTEGER NOT NULL DEFAULT 0,

    error_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_repository_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_repository_user_github
        UNIQUE (user_id, github_repo_id)
);


CREATE INDEX IF NOT EXISTS idx_repositories_user_id
ON repositories(user_id);


CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL,

    repository_id UUID NOT NULL,

    title VARCHAR(200) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chat_session_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_chat_session_repository
        FOREIGN KEY (repository_id)
        REFERENCES repositories(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_repo
ON chat_sessions(user_id, repository_id);


CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    session_id UUID NOT NULL,

    role VARCHAR(20) NOT NULL,

    content TEXT NOT NULL,

    citations TEXT,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chat_message_session
        FOREIGN KEY (session_id)
        REFERENCES chat_sessions(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_chat_messages_session
ON chat_messages(session_id);


CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
ON chat_messages(created_at);