import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

/**
 * The database, or null when Supabase is not configured.
 * Only this server holds the service key. Saving and withdrawing never depend on it.
 */
export const db =
  config.supabaseUrl && config.supabaseServiceKey
    ? createClient(config.supabaseUrl, config.supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
