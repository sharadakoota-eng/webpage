import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

const styles = {
  primary: "bg-gold text-ink hover:bg-[#e0b85f] shadow-soft",
  secondary: "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15",
  ghost: "bg-cream text-navy hover:bg-white",
};

export function Button({ children, href, className, variant = "primary" }: ButtonProps) {
  const baseClassName = cn(
    "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition duration-200",
    styles[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={baseClassName}>
        {children}
      </Link>
    );
  }

  return <button className={baseClassName}>{children}</button>;
}
