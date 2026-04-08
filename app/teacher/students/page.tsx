import { getPortalSession } from "@/lib/erp-auth";
import { getTeacherPortalData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeacherStudentsPage() {
  const session = await getPortalSession();
  const teacher = await getTeacherPortalData(session?.sub);
  const classes = teacher?.classes ?? [];

  return (
    <div className="space-y-6">
      {classes.length > 0 ? (
        classes.map((entry) => (
          <section key={entry.class.id} className="rounded-[2rem] bg-white p-8 shadow-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Assigned Class</p>
                <h2 className="mt-2 font-display text-3xl text-navy">
                  {entry.class.name}
                  {entry.class.section ? ` - ${entry.class.section}` : ""}
                </h2>
                <p className="mt-2 text-sm leading-7 text-navy/68">
                  {entry.class.ageGroup ?? "Age group pending"} | {entry.class.students.length} student(s)
                </p>
              </div>
              <p className="rounded-full bg-cream px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                {entry.isLead ? "Lead teacher" : "Supporting teacher"}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {entry.class.students.map((student) => (
                <div key={student.id} className="rounded-[1.45rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">
                    {student.firstName} {student.lastName ?? ""}
                  </p>
                  <p className="mt-2 text-sm text-navy/65">Admission No: {student.admissionNumber}</p>
                  <p className="mt-1 text-sm text-navy/58">
                    {student.gender ?? "Gender pending"} | DOB {new Intl.DateTimeFormat("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(student.dateOfBirth)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="rounded-[2rem] bg-white p-8 shadow-card text-sm leading-7 text-navy/70">
          No class assignments have been created yet. Once admin maps teachers to classes and students, the roster will reflect here automatically.
        </div>
      )}
    </div>
  );
}
