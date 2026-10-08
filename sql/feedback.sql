-- Chạy độc lập trên database hiện có; không xóa hay thay đổi bảng cũ.
CREATE TABLE IF NOT EXISTS feedbacks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content TEXT NOT NULL,
  phone VARCHAR(16) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT feedbacks_content_nonempty CHECK (length(btrim(content)) > 0),
  CONSTRAINT feedbacks_phone_format CHECK (phone ~ '^(0|\+?84)[0-9]{9,10}$')
);
