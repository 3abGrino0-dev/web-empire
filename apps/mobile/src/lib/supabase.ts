import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { mobileEnv } from "@/lib/env";
import { secureStorage } from "@/lib/secure-storage";
export const supabase=createClient(mobileEnv.supabaseUrl,mobileEnv.supabasePublishableKey,{auth:{storage:secureStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}});
