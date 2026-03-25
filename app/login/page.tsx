"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { LockKeyhole, School, ShieldCheck, Users } from "lucide-react";
import logoImage from "@/assets/logo.png";
import heroImage from "@/assets/contact.png";

const accessCards = [
  {
    title: "Admin ERP",
    copy: "Website leads, admissions, users, events, lunch menu, fees, receipts, and school operations in one control center.",
    icon: ShieldCheck,
  },
  {
    title: "Teacher Workspace",
    copy: "Assigned students, attendance, classroom observations, updates, and performance workflow tracking.",
    icon: School,
  },
  {
    title: "Parent Portal",
    copy: "Child performance, announcements, lunch menu, fees, receipts, and communication in one mobile-first dashboard.",
    icon: Users,
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demoAccounts = useMemo(
    () => [
      { label: "Admin", value: "admin@shaaradakoota.com" },
      { label: "Teacher", value: "teacher@shaaradakoota.com" },
      { label: "Parent", value: "parent@shaaradakoota.com" },
    ],
    [],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid login credentials.");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;

    if (role === "PARENT") {
      window.location.href = "/parent";
      return;
    }

    if (role === "TEACHER") {
      window.location.href = "/teacher";
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative overflow-hidden rounded-[2.4rem] bg-navy text-white shadow-soft">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="Sharada Koota Montessori login experience" fill className="object-cover object-center opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(9,22,43,0.92)_0%,rgba(9,22,43,0.82)_52%,rgba(214,164,54,0.18)_100%)]" />
        </div>

        <div className="relative space-y-8 p-8 sm:p-10 lg:p-12">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/10 p-2 backdrop-blur">
              <Image src={logoImage} alt="Sharada Koota Montessori logo" width={64} height={64} className="rounded-full" />
            </div>
            <div>
              <p className="font-display text-3xl">Sharada Koota Montessori</p>
              <p className="mt-1 text-sm uppercase tracking-[0.24em] text-white/60">ERP & Role-Based Access</p>
            </div>
          </div>

          <div>
            <p className="inline-flex rounded-full border border-gold/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-gold backdrop-blur">
              School Website + ERP Platform
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.98] sm:text-6xl">
              Secure access for the people who run the school every day
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
              This portal is designed for real school operations: lead capture from the website, admissions handling, teacher workflows, parent communication, student tracking, and future-ready fee payments.
            </p>
          </div>

          <div className="grid gap-4">
            {accessCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="stagger-rise rounded-[1.6rem] border border-white/12 bg-white/10 p-5 backdrop-blur"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-white/75">{item.copy}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[2.4rem] bg-white p-8 shadow-card sm:p-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-gold">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-gold">Portal Login</p>
        <h2 className="mt-2 font-display text-4xl text-navy">Welcome back</h2>
        <p className="mt-3 text-sm leading-7 text-navy/70">
          Login with your assigned credentials. Users are redirected automatically to the correct workspace for admin, teacher, or parent access.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-navy/10 px-4 py-3"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-navy/10 px-4 py-3"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
            {loading ? "Signing in..." : "Login to portal"}
          </button>
        </form>

        <div className="mt-8 rounded-[1.75rem] bg-cream p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Demo Accounts</p>
          <div className="mt-4 grid gap-3">
            {demoAccounts.map((account) => (
              <div key={account.label} className="rounded-[1.25rem] bg-white px-4 py-3 shadow-card">
                <p className="text-xs uppercase tracking-[0.2em] text-navy/50">{account.label}</p>
                <p className="mt-1 text-sm font-medium text-navy">{account.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-navy/70">
            Current seeded users share the password stored in `ADMIN_PASSWORD` inside your environment configuration.
          </p>
        </div>
      </section>
    </div>
  );
}
