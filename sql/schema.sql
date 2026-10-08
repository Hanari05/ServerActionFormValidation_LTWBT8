BEGIN;

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(30) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_username_unique UNIQUE (username),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$'),
  CONSTRAINT users_email_normalized CHECK (email = lower(btrim(email)))
);

CREATE TABLE posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id BIGINT NOT NULL REFERENCES users(id),
  content VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT posts_content_nonempty CHECK (length(btrim(content)) > 0)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  token_hash TEXT NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sessions_token_hash_unique UNIQUE (token_hash)
);

CREATE INDEX posts_feed_idx ON posts (created_at DESC, id DESC);
CREATE INDEX posts_author_idx ON posts (author_id);
CREATE INDEX sessions_user_idx ON sessions (user_id);

CREATE TABLE feedbacks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content TEXT NOT NULL,
  phone VARCHAR(16) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT feedbacks_content_nonempty CHECK (length(btrim(content)) > 0),
  CONSTRAINT feedbacks_phone_format CHECK (phone ~ '^(0|\+?84)[0-9]{9,10}$')
);

COMMIT;
