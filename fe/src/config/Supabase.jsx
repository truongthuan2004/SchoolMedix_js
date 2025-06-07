import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("supabase url: ", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const loginWithPhoneAndPassword = async (phone, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    phone,
    password,
  });

  if (error) {
    console.error("❌ Login error:", error.message);
  } else {
    console.log("✅ Logged in:", data);
  }
};

export const sendOtp = async (phone) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) {
    console.error("❌ Error sending OTP:", error.message);
  } else {
    console.log("✅ OTP sent to phone:", phone);
  }
};

export const verifyOtp = async (phone, token) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token, // OTP code sent via SMS
    type: "sms", // This must match the delivery method
  });

  console.log("Phone: " + phone + " | "  + "OTP: " + token)

  if (error) {
    console.error("❌ OTP verification failed:", error.message);
  } else {
    console.log("✅ OTP verified, user signed in:", data);
  }
};
