import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bvxfqjyybjmzojlkxfhk.supabase.co";
const supabaseKey = "sb_publishable_bEg3wPwYJqr2GY7v74AC5w_oaJncPiu";

export const supabase = createClient(supabaseUrl, supabaseKey);