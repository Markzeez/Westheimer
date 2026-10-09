import { auth, currentUser } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export type AuthenticatedUser = {
  id: string;
  clerk_user_id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: unknown;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createSupabaseAdminClient();
  const { data: linkedProfile, error: linkedProfileError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (linkedProfileError) throw linkedProfileError;
  if (linkedProfile) return linkedProfile as AuthenticatedUser;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) return null;

  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  );
  if (!primaryEmail || primaryEmail.verification?.status !== "verified") return null;

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("users")
    .select("*")
    .eq("email", primaryEmail.emailAddress)
    .maybeSingle();

  if (existingProfileError) throw existingProfileError;

  if (existingProfile) {
    if (existingProfile.clerk_user_id && existingProfile.clerk_user_id !== userId) {
      throw new Error("This profile is already linked to another Clerk account");
    }

    const { data: linked, error } = await supabase
      .from("users")
      .update({ clerk_user_id: userId })
      .eq("id", existingProfile.id)
      .select("*")
      .single();

    if (error) throw error;
    return linked as AuthenticatedUser;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .insert({
      id: crypto.randomUUID(),
      clerk_user_id: userId,
      name:
        clerkUser.fullName ||
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        primaryEmail.emailAddress.split("@")[0],
      email: primaryEmail.emailAddress,
      role: "user",
      onboarding_completed: false,
      onboarding_data: {},
    })
    .select("*")
    .single();

  if (error) throw error;
  return profile as AuthenticatedUser;
}

export async function getAuthenticatedAdmin(): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser();
  return user?.role === "admin" ? user : null;
}