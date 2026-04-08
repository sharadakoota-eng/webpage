"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, School, ShieldCheck, Sparkles, Users } from "lucide-react";
import logoImage from "@/assets/logo.png";
import heroImage from "@/assets/login-bg.png";
import { cn } from "@/lib/utils";

type RoleKey = "parent" | "teacher" | "admin";

const roleConfig: Record<
  RoleKey,
  {
    label: string;
    endpoint: string;
    title: string;
    description: string;
    icon: typeof Users;
    redirectHint: string;
  }
> = {
  parent: {
    label: "Parent",
    endpoint: "/api/auth/login-parent",
    title: "Parent access",
    description: "Attendance, updates, lunch menu, announcements, and fees in one calm parent workspace.",
    icon: Users,
    redirectHint: "Parent Dashboard",
  },
  teacher: {
    label: "Teacher",
    endpoint: "/api/auth/login-teacher",
    title: "Teacher access",
    description: "Assigned students, attendance, observations, and class updates in one clean teaching workspace.",
    icon: School,
    redirectHint: "Teacher Dashboard",
  },
  admin: {
    label: "Admin",
    endpoint: "/api/auth/login-admin",
    title: "Admin access",
    description: "Admissions, users, communication, lunch publishing, and finance operations in one organized workspace.",
    icon: ShieldCheck,
    redirectHint: "Admin Dashboard",
  },
};

export default function LoginPage() {
  const [role, setRole] = useState<RoleKey>("parent");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentRole = useMemo(() => roleConfig[role], [role]);
  const CurrentIcon = currentRole.icon;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(currentRole.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
          rememberMe,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result?.message ?? "Invalid login credentials.");
        setLoading(false);
        return;
      }

      window.location.href = result?.redirectTo ?? "/portal";
    } catch {
      setError("Unable to login right now. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f7f1e5_0%,#efe6d7_42%,#e6dccb_100%)]">
      <div className="grid h-screen lg:grid-cols-[0.82fr_1.18fr]">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative hidden overflow-hidden lg:block"
        >
          <Image src={heroImage} alt="Montessori themed learning environment" fill className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-[linear-gradient(138deg,rgba(14,29,52,0.72)_0%,rgba(18,38,61,0.88)_46%,rgba(101,75,45,0.62)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16)_0%,transparent_30%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(214,164,54,0.18)_0%,transparent_22%)]" />

          <div className="relative flex h-full flex-col justify-between px-8 py-6 text-white xl:px-10">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Website
              </Link>

              <div className="flex items-center gap-4">
                <div className="rounded-full bg-white/12 p-2 backdrop-blur">
                  <Image src={logoImage} alt="Shaarada Koota Montessori logo" width={62} height={62} className="rounded-full" />
                </div>
                <div>
                  <p className="font-display text-[1.95rem] leading-none xl:text-[2.25rem]">Shaarada Koota</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.32em] text-white/75 xl:text-xs">Montessori School</p>
                </div>
              </div>
            </div>

            <div className="max-w-[26rem] space-y-3">
              <p className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-cream backdrop-blur">
                Montessori ERP & Parent Communication
              </p>
              <h1 className="font-display text-[2.65rem] leading-[0.9] xl:text-[3.05rem]">
                Secure School Access
              </h1>
              <p className="max-w-sm text-sm leading-6 text-white/82">
                Login to manage attendance, communication, updates, and daily school operations in one calm Montessori-first workspace.
              </p>
            </div>

            <div className="rounded-[1.2rem] border border-white/14 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Need help?</p>
              <p className="mt-2 text-sm font-semibold text-white">Contact the school office for access support.</p>
              <p className="mt-1.5 text-sm leading-6 text-white/76">
                Get help with portal access, temporary passwords, and account assistance from the school team.
              </p>
            </div>
          </div>
        </motion.section>

        <section className="relative flex h-screen items-center justify-center overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 lg:hidden">
            <Image src={heroImage} alt="Montessori themed learning environment" fill className="object-cover object-center" priority />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,241,230,0.92)_0%,rgba(248,241,230,0.97)_42%,rgba(245,238,228,0.98)_100%)]" />
          </div>

          <Link
            href="/"
            className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white/86 px-4 py-3 text-sm font-semibold text-navy shadow-card backdrop-blur lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[35rem] overflow-hidden rounded-[1.8rem] border border-white/55 bg-white/82 px-6 py-4 shadow-[0_28px_80px_rgba(19,34,57,0.14)] backdrop-blur-xl sm:px-7 sm:py-4"
          >
            <div className="flex items-start gap-4">
              <div>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-[1rem] bg-cream text-gold shadow-card">
                  <LockKeyhole className="h-4.5 w-4.5" />
                </div>
                <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Portal Login</p>
                <h2 className="mt-1.5 font-display text-[1.95rem] leading-none text-navy sm:text-[2.35rem]">Welcome back</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-navy/68">
                  Choose your role and sign in with your assigned school credentials.
                </p>
              </div>
            </div>

            <div className="mt-2 inline-flex rounded-full border border-gold/20 bg-cream/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Secure Access
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 rounded-[1.1rem] bg-[#f7f2e9] p-2">
              {(Object.keys(roleConfig) as RoleKey[]).map((key) => {
                const isActive = role === key;
                const Icon = roleConfig[key].icon;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setRole(key);
                      setError("");
                    }}
                    className={cn(
                      "rounded-[0.95rem] px-3 py-2 text-sm font-semibold transition duration-300",
                      isActive ? "bg-white text-navy shadow-card" : "text-navy/55 hover:text-navy",
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Icon className="h-4 w-4" />
                      {roleConfig[key].label}
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                className="mt-2.5 rounded-[1.15rem] bg-white/78 p-3 shadow-card"
              >
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-cream text-gold">
                    <CurrentIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[1.05rem] leading-tight text-navy">{currentRole.title}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">{currentRole.redirectHint}</p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-navy/68">{currentRole.description}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="mt-2.5 space-y-2.5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-navy/50">Email or phone</label>
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Enter your email or phone number"
                  className="w-full rounded-[1.05rem] border border-navy/10 bg-white px-4 py-2.5 text-navy shadow-card outline-none transition focus:border-gold/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-navy/50">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-[1.05rem] border border-navy/10 bg-white px-4 py-2.5 pr-14 text-navy shadow-card outline-none transition focus:border-gold/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/45 transition hover:text-navy"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-3 text-sm text-navy/68">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-navy/15 accent-navy"
                  />
                  Remember me
                </label>

                <button type="button" className="self-start text-sm font-semibold text-gold transition hover:text-navy sm:self-auto">
                  Forgot password?
                </button>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }} disabled={loading} className="w-full rounded-[1.05rem] bg-navy px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? "Signing in..." : `Login as ${currentRole.label}`}
              </motion.button>
            </form>

          </motion.div>
        </section>
      </div>
    </div>
  );
}
