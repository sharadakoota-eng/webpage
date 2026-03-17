import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";

export default function KannadaKasturiPage() {
  return <ProgramPage program={programs.find((program) => program.slug === "kannada-kasturi")!} />;
}
