CREATE TABLE IF NOT EXISTS public.user_stamps (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) NOT NULL,
    category text NOT NULL,
    unlocked_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, category)
);

ALTER TABLE public.user_stamps ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own stamps') THEN
        CREATE POLICY "Users can read own stamps" ON public.user_stamps
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage stamps') THEN
        CREATE POLICY "Admins can manage stamps" ON public.user_stamps
            FOR ALL USING (true);
    END IF;
END
$$;
