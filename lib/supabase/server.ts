import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value ?? null,
      set: (name, value, options) => {
        cookieStore.set(name, value, options);
      },
      remove: (name) => {
        cookieStore.delete(name);
      },
    },
  });
}
