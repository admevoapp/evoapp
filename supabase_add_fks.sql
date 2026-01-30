
-- Add Foreign Key for Posts
ALTER TABLE posts
ADD CONSTRAINT posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add Foreign Key for Connections (User side)
ALTER TABLE connections
ADD CONSTRAINT connections_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add Foreign Key for Connections (Friend side)
ALTER TABLE connections
ADD CONSTRAINT connections_friend_id_fkey
FOREIGN KEY (friend_id) REFERENCES profiles(id)
ON DELETE CASCADE;
