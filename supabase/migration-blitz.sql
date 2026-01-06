-- Add guest columns to quiz_sessions for Lead Gen
ALTER TABLE public.quiz_sessions 
ADD COLUMN IF NOT EXISTS guest_name text,
ADD COLUMN IF NOT EXISTS guest_email text;

-- Ensure user_id can be null (it should be by default, but nice to be explicit if we were creating it)
-- We don't need to alter it if it's already nullable, which UUID references usually are unless specified NOT NULL.
-- But let's check policies.

-- Update policies to allow public inserting (for guests) if we want that, 
-- OR we keep it secure and use a server action with SERVICE ROLE for guest submissions.
-- Since we are using Next.js Server Actions, we can just use the Service Role in the action
-- to bypass RLS for guest inserts, which is safer than opening RLS to "public".

-- Create an index on score for global analytics if needed
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_score ON public.quiz_sessions(score);
