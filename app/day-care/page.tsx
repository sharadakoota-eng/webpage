import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";

export default function DayCarePage() {
  return <ProgramPage program={programs.find((program) => program.slug === "day-care")!} />;
}
