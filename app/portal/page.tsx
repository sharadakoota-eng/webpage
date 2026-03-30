import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortalRedirectPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (role === "PARENT") {
    redirect("/parent");
  }

  if (role === "TEACHER") {
    redirect("/teacher");
  }

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  redirect("/login");
}
