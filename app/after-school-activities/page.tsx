import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";

export default function AfterSchoolActivitiesPage() {
  return <ProgramPage program={programs.find((program) => program.slug === "after-school-activities")!} />;
}
