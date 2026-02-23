import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pqnomuginxrfpjhgqckn.supabase.co';
const supabaseKey = 'sb_publishable_f2REUNvQk0eB1eX2LKJ5ZA_O9KfnpOZ';

export const supabase = createClient(supabaseUrl.trim(), supabaseKey.trim());