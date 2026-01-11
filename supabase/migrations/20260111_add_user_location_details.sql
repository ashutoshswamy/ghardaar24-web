-- Add location details to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_nri BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Update handle_new_user function to extract new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, name, phone, email, is_nri, country, state, city)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'is_nri')::boolean, false),
        NEW.raw_user_meta_data->>'country',
        NEW.raw_user_meta_data->>'state',
        NEW.raw_user_meta_data->>'city'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
