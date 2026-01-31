import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value ?? null,
      set: (name: string, value: string, options: Parameters<typeof cookieStore.set>[2]) => {
        cookieStore.set(name, value, options);
      },
      remove: (name: string) => {
        cookieStore.delete(name);
      },
    },
  });
}
