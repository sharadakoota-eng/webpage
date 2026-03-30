"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

type LoginState = {
  error?: string;
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/portal",
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid login credentials." };
      }

      return { error: "Unable to sign in right now. Please try again." };
    }

    throw error;
  }
}
