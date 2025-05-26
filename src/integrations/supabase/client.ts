
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jzctvriycdmmroeeshrg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Y3R2cml5Y2RtbXJvZWVzaHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTQ3ODIsImV4cCI6MjA2MjYzMDc4Mn0.muutGzxFtB77I6XWlsa2iNAzr_UehPuETP_4EeQhBbM";


export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
