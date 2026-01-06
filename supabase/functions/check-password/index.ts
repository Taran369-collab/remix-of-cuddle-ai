supabase functions new check-password
import { serve } from "https://deno.land/std@0.192.0/http/server.ts"

async function sha1(password: string) {
  const data = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest("SHA-1", data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

serve(async (req) => {
  const { password } = await req.json()

  if (!password) {
    return new Response(
      JSON.stringify({ error: "Password required" }),
      { status: 400 }
    )
  }

  const hash = await sha1(password)
  const prefix = hash.slice(0, 5).toUpperCase()
  const suffix = hash.slice(5).toUpperCase()

  const res = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`,
    { headers: { "Add-Padding": "true" } }
  )

  const leaked = (await res.text()).includes(suffix)

  return new Response(
    JSON.stringify({ leaked }),
    { status: 200 }
  )
})
supabase functions deploy check-password
async function isPasswordLeaked(password) {
  const res = await fetch(
    "https://YOUR_PROJECT_ID.supabase.co/functions/v1/check-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer YOUR_SUPABASE_ANON_KEY`
      },
      body: JSON.stringify({ password })
    }
  )

  const { leaked } = await res.json()
  return leaked
}
const leaked = await isPasswordLeaked(password)

if (leaked) {
  alert("This password has been found in data breaches. Choose a stronger one.")
  return
}

await supabase.auth.signUp({
  email,
  password
})
