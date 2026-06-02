import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://krijjcllbelotvywmvtp.supabase.co';
const SUPABASE_ANON = 'sb_publishable_5MBQ0NN-8BCDGIEWJJPjzw_DD2JW2HX';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
