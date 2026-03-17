"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { PageHero } from "@/components/sections/page-hero";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid login credentials.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Login"
        title="Secure role-based access for admin, parent, and teacher users"
        description="This login screen is wired for credentials authentication and can be extended later with password reset, OTP, and stronger operational controls."
      />
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-card">
        <div className="grid gap-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="rounded-2xl border border-navy/10 px-4 py-3"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="rounded-2xl border border-navy/10 px-4 py-3"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
            Login
          </button>
        </div>
      </form>
      <section className="grid gap-4 lg:grid-cols-3">
        {[
          { title: "Admin access", copy: "Operations, admissions, content management, notifications, and reporting." },
          { title: "Parent access", copy: "Attendance view, child profile, announcements, fee history, and updates." },
          { title: "Teacher access", copy: "Class lists, attendance marking, classroom updates, and observation notes." },
        ].map((item) => (
          <div key={item.title} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <h2 className="font-display text-2xl text-navy">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">{item.copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
