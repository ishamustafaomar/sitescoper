
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Websites table
CREATE TABLE public.websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT,
  last_score INTEGER,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own websites" ON public.websites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own websites" ON public.websites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own websites" ON public.websites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own websites" ON public.websites FOR DELETE USING (auth.uid() = user_id);

-- Analysis history table
CREATE TABLE public.analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  summary TEXT,
  categories JSONB NOT NULL DEFAULT '[]',
  scrape_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history" ON public.analysis_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own history" ON public.analysis_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_websites_user_id ON public.websites(user_id);
CREATE INDEX idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX idx_analysis_history_website_id ON public.analysis_history(website_id);
CREATE INDEX idx_analysis_history_created_at ON public.analysis_history(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON public.websites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
