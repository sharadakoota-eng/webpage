import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/erp-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortalRedirectPage() {
  const session = await getPortalSession();
  const role = session?.role;

  if (role === "PARENT") {
    redirect("/parent/dashboard");
  }

  if (role === "TEACHER") {
    redirect("/teacher/dashboard");
  }

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/login");
}
