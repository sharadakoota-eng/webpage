import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";

export default function MontessoriProgramPage() {
  return <ProgramPage program={programs.find((program) => program.slug === "montessori-program")!} />;
}
