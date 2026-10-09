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

const BOOTSTRAP_ADMIN_EMAIL = "markzeezibro739@gmail.com";

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) return null;

  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  );
  const verifiedEmails = clerkUser.emailAddresses.filter(
    (email) => email.verification?.status === "verified"
  );
  const bootstrapAdminEmail = verifiedEmails.find(
    (email) => email.emailAddress.trim().toLowerCase() === BOOTSTRAP_ADMIN_EMAIL
  );
  const accountEmail =
    primaryEmail?.verification?.status === "verified"
      ? primaryEmail
      : bootstrapAdminEmail;
  if (!accountEmail) return null;

  const role =
    bootstrapAdminEmail !== undefined ||
    clerkUser.publicMetadata.role === "admin"
      ? "admin"
      : "user";
  const supabase = createSupabaseAdminClient();
  const { data: linkedProfile, error: linkedProfileError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (linkedProfileError) throw linkedProfileError;
  if (linkedProfile) {
    return { ...linkedProfile, role } as AuthenticatedUser;
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("users")
    .select("*")
    .eq("email", accountEmail.emailAddress)
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
    return { ...linked, role } as AuthenticatedUser;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .insert({
      id: crypto.randomUUID(),
      clerk_user_id: userId,
      name:
        clerkUser.fullName ||
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        accountEmail.emailAddress.split("@")[0],
      email: accountEmail.emailAddress,
      role,
      onboarding_completed: false,
      onboarding_data: {},
    })
    .select("*")
    .single();

  if (error) throw error;
  return { ...profile, role } as AuthenticatedUser;
}

export async function getAuthenticatedAdmin(): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser();
  return user?.role === "admin" ? user : null;
}