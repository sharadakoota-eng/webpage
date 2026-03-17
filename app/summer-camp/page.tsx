import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";

export default function SummerCampPage() {
  return <ProgramPage program={programs.find((program) => program.slug === "summer-camp")!} />;
}
