import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import {
  AdmissionStatus,
  ApplicationDocumentStatus,
  AttendanceStatus,
  HomeworkUpdateAudience,
  InvoiceStatus,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  PaymentStatus,
  PrismaClient,
  ProgramCategory,
  RoleType,
  TeacherAttendanceStatus,
} from "@prisma/client";

function loadEnvFile(fileName: string) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;
  const fileContents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of fileContents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [keyPart, ...valueParts] = line.split("=");
    const key = keyPart.trim();
    let value = valueParts.join("=").trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const prisma = new PrismaClient();

const permissions = [
  ["content.manage", "Manage content"],
  ["inquiries.manage", "Manage inquiries"],
  ["admissions.manage", "Manage admissions"],
  ["students.manage", "Manage students"],
  ["payments.manage", "Manage payments"],
  ["attendance.manage", "Manage attendance"],
  ["announcements.manage", "Manage announcements"],
] as const;

const roleConfigs = [
  { type: RoleType.SUPER_ADMIN, name: "Super Admin" },
  { type: RoleType.ADMIN, name: "Admin" },
  { type: RoleType.FRONT_DESK, name: "Front Desk" },
  { type: RoleType.PARENT, name: "Parent" },
  { type: RoleType.TEACHER, name: "Teacher" },
];

const classSeeds = [
  { id: "class-montessori-a", name: "Montessori", section: "A", ageGroup: "2-4 years", roomLabel: "Lotus Room", capacity: 18 },
  { id: "class-montessori-b", name: "Montessori", section: "B", ageGroup: "4-6 years", roomLabel: "Tulip Room", capacity: 18 },
  { id: "class-daycare-a", name: "Day Care", section: "A", ageGroup: "2-10 years", roomLabel: "Sun Room", capacity: 22 },
  { id: "class-activity-a", name: "Activity Batch", section: "A", ageGroup: "6-10 years", roomLabel: "Discovery Hall", capacity: 24 },
] as const;

const teacherSeeds = [
  { key: "ananya", name: "Ananya Rao", email: "teacher.ananya@shaaradakoota.com", phone: "9880001101", designation: "Montessori Lead Guide", qualifications: "AMI Diploma", bio: "Leads Montessori work cycles.", classIds: ["class-montessori-a"] },
  { key: "meera", name: "Meera Nair", email: "teacher.meera@shaaradakoota.com", phone: "9880001102", designation: "Montessori Guide", qualifications: "ECE + Montessori", bio: "Supports independence and language growth.", classIds: ["class-montessori-b"] },
  { key: "kiran", name: "Kiran Kumar", email: "teacher.kiran@shaaradakoota.com", phone: "9880001103", designation: "Day Care Mentor", qualifications: "Child Care Specialist", bio: "Coordinates day care routines and safety.", classIds: ["class-daycare-a"] },
  { key: "shilpa", name: "H N Shilpa", email: "teacher.shilpa@shaaradakoota.com", phone: "9880001104", designation: "Activity Mentor", qualifications: "Language & Math Facilitator", bio: "Handles language and enrichment batches.", classIds: ["class-activity-a"] },
] as const;

const programSeeds = [
  { slug: "montessori-program", name: "Montessori Program", category: ProgramCategory.CORE, ageGroup: "2-6 years", schedule: "Mon-Fri | 9:00 AM - 1:00 PM", shortIntro: "Montessori-led early years program.", overview: "A calm Montessori environment focused on independence, order, language, sensorial development, and practical life.", benefits: ["Prepared environment", "Hands-on learning", "Confident independence"], features: ["Practical life", "Sensorial", "Language", "Math readiness"], faqItems: [{ q: "Who is this for?", a: "Children aged 2 to 6 years." }], ctaLabel: "Book a visit" },
  { slug: "day-care", name: "Day Care", category: ProgramCategory.DAYCARE, ageGroup: "1.5-10 years", schedule: "Mon-Fri | Extended support", shortIntro: "Structured, safe day care support.", overview: "Reliable day care support with guided routines, rest, meals, and supervised play for working families.", benefits: ["Flexible support", "Safe routine", "Comfort and care"], features: ["Meals", "Rest time", "Indoor play", "Quiet learning"], faqItems: [{ q: "Can this be paired with school?", a: "Yes, day care can be paired with school programs." }], ctaLabel: "Ask about day care" },
  { slug: "after-school-activities", name: "After School Activities", category: ProgramCategory.ENRICHMENT, ageGroup: "4-10 years", schedule: "Mon-Fri | Afternoon batches", shortIntro: "Creative and skill-building activity sessions.", overview: "After-school enrichment that supports confidence, communication, creativity, and practical skills.", benefits: ["Structured afternoons", "Skill building", "Social confidence"], features: ["Art", "Games", "Language", "Hands-on projects"], faqItems: [{ q: "Can children join specific activities?", a: "Yes, selected activities can be assigned." }], ctaLabel: "Explore activities" },
  { slug: "summer-camp", name: "Summer Camp", category: ProgramCategory.CAMP, ageGroup: "2-10 years", schedule: "Seasonal batches", shortIntro: "Holiday camp with themed activities.", overview: "A joyful summer experience with science, art, games, storytelling, and confidence-building activities.", benefits: ["Small-group learning", "Safe holiday engagement", "Creative exploration"], features: ["Art", "DIY", "Stories", "Games", "Cultural activities"], faqItems: [{ q: "How are fees handled?", a: "Summer camp is billed through manual activity invoices." }], ctaLabel: "Reserve a camp seat" },
  { slug: "creative-achievers", name: "Creative Achievers", category: ProgramCategory.ENRICHMENT, ageGroup: "5-10 years", schedule: "Weekend enrichment", shortIntro: "Project-led creative confidence program.", overview: "Focused enrichment for expressive confidence, showcase-based learning, and hands-on achievement.", benefits: ["Expression", "Stage confidence", "Creative output"], features: ["Projects", "Showcase", "Communication"], faqItems: [{ q: "Is this separate from school?", a: "Yes, it can be taken as an add-on enrichment track." }], ctaLabel: "Join Creative Achievers" },
  { slug: "kannada-kasturi", name: "Kannada Kasturi", category: ProgramCategory.LANGUAGE, ageGroup: "5-10 years", schedule: "Weekday language batches", shortIntro: "Kannada language and culture sessions.", overview: "A culturally rooted language program built around stories, rhymes, expression, and identity.", benefits: ["Language comfort", "Cultural grounding", "Story-led learning"], features: ["Rhymes", "Stories", "Language games", "Culture"], faqItems: [{ q: "Is this for beginners?", a: "Yes, mixed-language comfort levels are supported." }], ctaLabel: "Explore Kannada Kasturi" },
];

const feeStructuresByProgram: Record<string, Array<{ title: string; frequency: string; amount: number; description?: string }>> = {
  "montessori-program": [
    { title: "Admission Fee", frequency: "One-time", amount: 5000, description: "One-time enrollment charge" },
    { title: "Monthly Fee", frequency: "Monthly", amount: 4500, description: "Core Montessori monthly tuition" },
  ],
  "day-care": [
    { title: "Admission Fee", frequency: "One-time", amount: 3000, description: "Day care onboarding fee" },
    { title: "Monthly Fee", frequency: "Monthly", amount: 3500, description: "Day care monthly support fee" },
  ],
  "after-school-activities": [{ title: "Activity Fee", frequency: "Monthly", amount: 2200, description: "Monthly enrichment charge" }],
  "creative-achievers": [{ title: "Creative Track Fee", frequency: "Monthly", amount: 2800, description: "Creative Achievers monthly fee" }],
  "kannada-kasturi": [{ title: "Language Batch Fee", frequency: "Monthly", amount: 1800, description: "Kannada Kasturi monthly batch fee" }],
};

const firstNames = ["Aarav","Diya","Sithara","Vihaan","Anika","Ishaan","Myra","Kabir","Aadhya","Reyansh","Nivya","Advik","Saanvi","Rudra","Tara","Neil","Mira","Arjun","Kiara","Dev"] as const;
const lastNames = ["Sharma","Nair","Rao","Kumar","Shetty","Iyer","Patil","Das","Menon","Bhat"] as const;
const streets = ["27th Main Road","19th Cross","Sector 2 Main","Silver Oak Lane","Park View Street","Tulip Avenue","Green Glen Road"] as const;

function makeInvoiceNumber(index: number) {
  return `INV-2026-${String(index).padStart(5, "0")}`;
}

function makeReceiptNumber(index: number) {
  return `RCT-2026-${String(index).padStart(5, "0")}`;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function addDays(base: Date, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function randomPhone(index: number) {
  return `98801${String(10000 + index).slice(-5)}`;
}

async function main() {
  const defaultPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.receipt.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.teacherAttendance.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.homeworkUpdateStudent.deleteMany(),
    prisma.homeworkUpdate.deleteMany(),
    prisma.studentObservation.deleteMany(),
    prisma.applicationDocument.deleteMany(),
    prisma.admission.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.parentStudentMap.deleteMany(),
    prisma.teacherClassMap.deleteMany(),
    prisma.leaveRequest.deleteMany(),
    prisma.student.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.inquiry.deleteMany(),
    prisma.feeStructure.deleteMany(),
    prisma.program.deleteMany(),
    prisma.class.deleteMany(),
    prisma.galleryItem.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.event.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.session.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.user.deleteMany(),
    prisma.rolePermission.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.role.deleteMany(),
  ]);

  for (const [code, name] of permissions) {
    await prisma.permission.create({ data: { code, name } });
  }
  for (const role of roleConfigs) {
    await prisma.role.create({ data: role });
  }

  const [adminRole, superAdminRole, parentRole, teacherRole, frontDeskRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { type: RoleType.ADMIN } }),
    prisma.role.findUniqueOrThrow({ where: { type: RoleType.SUPER_ADMIN } }),
    prisma.role.findUniqueOrThrow({ where: { type: RoleType.PARENT } }),
    prisma.role.findUniqueOrThrow({ where: { type: RoleType.TEACHER } }),
    prisma.role.findUniqueOrThrow({ where: { type: RoleType.FRONT_DESK } }),
  ]);

  await prisma.user.createMany({
    data: [
      { name: "Sharada Koota Admin", email: "admin@shaaradakoota.com", phone: "9880199221", passwordHash, roleId: adminRole.id, passwordResetRequired: false },
      { name: "School Director", email: "director@shaaradakoota.com", phone: "9880199222", passwordHash, roleId: superAdminRole.id, passwordResetRequired: false },
      { name: "Front Desk Team", email: "frontdesk@shaaradakoota.com", phone: "9880199223", passwordHash, roleId: frontDeskRole.id, passwordResetRequired: false },
    ],
  });

  const teacherMap = new Map<string, { teacherId: string; name: string; classIds: string[] }>();
  for (const seed of teacherSeeds) {
    const user = await prisma.user.create({
      data: { name: seed.name, email: seed.email, phone: seed.phone, passwordHash, roleId: teacherRole.id, passwordResetRequired: false },
    });
    const teacher = await prisma.teacher.create({
      data: { userId: user.id, designation: seed.designation, qualifications: seed.qualifications, bio: seed.bio },
    });
    teacherMap.set(seed.key, { teacherId: teacher.id, name: seed.name, classIds: [...seed.classIds] });
  }

  for (const classSeed of classSeeds) {
    await prisma.class.create({ data: classSeed });
  }

  for (const seed of teacherSeeds) {
    const teacher = teacherMap.get(seed.key)!;
    for (const classId of seed.classIds) {
      await prisma.teacherClassMap.create({ data: { teacherId: teacher.teacherId, classId, isLead: true } });
    }
  }

  const programs = new Map<string, { id: string; category: ProgramCategory }>();
  for (const programSeed of programSeeds) {
    const program = await prisma.program.create({ data: programSeed });
    programs.set(program.slug, { id: program.id, category: program.category });
  }

  for (const [slug, structures] of Object.entries(feeStructuresByProgram)) {
    const program = programs.get(slug);
    if (!program) continue;
    for (const fee of structures) {
      await prisma.feeStructure.create({
        data: { programId: program.id, title: fee.title, frequency: fee.frequency, amount: fee.amount, description: fee.description },
      });
    }
  }

  const classAssignment = ["class-montessori-a","class-montessori-a","class-montessori-b","class-montessori-b","class-daycare-a","class-activity-a"];
  const programAssignment = ["montessori-program","montessori-program","montessori-program","day-care","after-school-activities","kannada-kasturi"];
  const studentRecords: Array<{ studentId: string; classId: string; programSlug: string; admissionNumber: string }> = [];
  const parentRecords: Array<{ parentId: string; name: string }> = [];

  for (let index = 0; index < 20; index += 1) {
    const firstName = firstNames[index];
    const lastName = lastNames[index % lastNames.length];
    const parentName = `${index % 2 === 0 ? "Sarika" : "Sriram"} ${lastNames[(index + 2) % lastNames.length]}`;
    const email = `parent${index + 1}@shaaradakoota.com`;
    const phone = randomPhone(index + 1);
    const childDob = new Date(2020 + (index % 4), (index * 2) % 12, 5 + (index % 20));
    const classId = classAssignment[index % classAssignment.length];
    const programSlug = programAssignment[index % programAssignment.length];
    const program = programs.get(programSlug)!;

    const parentUser = await prisma.user.create({
      data: { name: parentName, email, phone, passwordHash, roleId: parentRole.id, passwordResetRequired: false },
    });
    const parent = await prisma.parent.create({
      data: {
        userId: parentUser.id,
        occupation: index % 2 === 0 ? "Software Engineer" : "Business Owner",
        alternatePhone: randomPhone(index + 51),
        addressLine1: `${100 + index}, ${streets[index % streets.length]}`,
        addressLine2: "HSR Layout",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560102",
      },
    });

    const student = await prisma.student.create({
      data: {
        admissionNumber: `SKM-2026-${String(index + 1).padStart(3, "0")}`,
        firstName,
        lastName,
        dateOfBirth: childDob,
        gender: index % 2 === 0 ? "Female" : "Male",
        bloodGroup: ["A+", "B+", "AB+", "O+"][index % 4],
        currentClassId: classId,
      },
    });

    await prisma.parentStudentMap.create({
      data: { parentId: parent.id, studentId: student.id, relation: index % 2 === 0 ? "Mother" : "Father", isPrimary: true },
    });

    await prisma.enrollment.create({
      data: {
        parentId: parent.id,
        studentId: student.id,
        programId: program.id,
        startDate: daysAgo(60 + index),
        notes: program.category === ProgramCategory.CAMP ? "Camp-based manual billing" : "Active recurring enrollment",
      },
    });

    const status =
      index < 10 ? AdmissionStatus.APPROVED :
      index < 13 ? AdmissionStatus.SUBMITTED :
      index < 16 ? AdmissionStatus.UNDER_REVIEW :
      index < 18 ? AdmissionStatus.DOCUMENTS_PENDING :
      AdmissionStatus.REJECTED;

    const applicationNumber = `ADM-2026-${String(10913 + index)}`;
    const admission = await prisma.admission.create({
      data: {
        applicationNumber,
        shareToken: `seed-token-${index + 1}`,
        parentId: index < 10 ? parent.id : null,
        studentId: index < 10 ? student.id : null,
        programId: program.id,
        parentName,
        childName: `${firstName} ${lastName}`,
        childDob,
        phone,
        email,
        notes: "Parent expects communication and activity visibility.",
        reviewNotes: index >= 16 ? "Document follow-up required before final decision." : "Reviewed by admissions desk.",
        submittedByParent: index % 3 !== 0,
        submittedAt: daysAgo(45 - index),
        approvedAt: status === AdmissionStatus.APPROVED ? daysAgo(30 - index) : null,
        rejectedAt: status === AdmissionStatus.REJECTED ? daysAgo(10 - index) : null,
        enrolledAt: index < 10 ? daysAgo(25 - index) : null,
        portalAccessSentAt: index < 10 ? daysAgo(24 - index) : null,
        status,
        familyProfile: {
          primaryParent: index % 2 === 0 ? "MOTHER" : "FATHER",
          fatherName: `Sriram ${lastName}`,
          motherName: `Sarika ${lastName}`,
          guardianName: index % 5 === 0 ? `Guardian ${lastName}` : undefined,
          fatherPhone: randomPhone(index + 101),
          motherPhone: phone,
          guardianPhone: index % 5 === 0 ? randomPhone(index + 151) : undefined,
          fatherEmail: `father${index + 1}@mail.com`,
          motherEmail: email,
          guardianEmail: index % 5 === 0 ? `guardian${index + 1}@mail.com` : undefined,
          fatherQualification: "Graduate",
          motherQualification: "Post Graduate",
          fatherOccupation: "Consultant",
          motherOccupation: "Manager",
          addressLine1: `${100 + index}, ${streets[index % streets.length]}`,
          addressLine2: "HSR Layout",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560102",
          emergencyContactName: `Emergency ${lastName}`,
          emergencyContactPhone: randomPhone(index + 201),
          emergencyRelationship: "Uncle",
        },
        childProfile: {
          gender: student.gender,
          bloodGroup: student.bloodGroup,
          ageText: `${Math.max(2, 6 - (index % 4))} years`,
          previousSchool: index % 2 === 0 ? "Euro School" : "Little Steps",
          previousGrade: index % 2 === 0 ? "PP1" : "Toddler",
          medicalNotes: index % 4 === 0 ? "Mild dust allergy" : undefined,
          allergies: index % 6 === 0 ? "Peanuts" : undefined,
        },
        admissionProfile: {
          preferredStartMonth: ["June", "July", "August"][index % 3],
          schoolVisitStatus: index % 2 === 0 ? "Completed" : "Scheduled",
          parentExpectations: "Safe environment, communication, and activity updates.",
          internalNotes: index % 7 === 0 ? "Family requested transport details." : undefined,
          source: index % 3 === 0 ? "Website" : "Front Desk",
          feePlanStatus: program.category === ProgramCategory.CAMP ? "Manual invoice required" : "Program fee configured",
          portalReady: index < 10,
        },
      },
    });

    const docs = [
      ["BIRTH_CERTIFICATE", "birth-certificate.pdf"],
      ["CHILD_AADHAAR", "child-aadhaar.pdf"],
      ["FATHER_AADHAAR", "father-aadhaar.pdf"],
      ["MOTHER_AADHAAR", "mother-aadhaar.pdf"],
      ["ADDRESS_PROOF", "address-proof.pdf"],
      ["PHOTO", "child-photo.pdf"],
      ["PREVIOUS_SCHOOL_RECORD", "previous-school.pdf"],
      ["MEDICAL_RECORD", "medical-record.pdf"],
    ] as const;

    for (const [docIndex, [documentType, fileName]] of docs.entries()) {
      const rejected = status === AdmissionStatus.DOCUMENTS_PENDING && docIndex % 3 === 0;
      const requested = status === AdmissionStatus.UNDER_REVIEW && docIndex > 5;
      await prisma.applicationDocument.create({
        data: {
          admissionId: admission.id,
          documentType: documentType as never,
          status: rejected ? ApplicationDocumentStatus.REJECTED : requested ? ApplicationDocumentStatus.REQUESTED : docIndex > 4 && status === AdmissionStatus.SUBMITTED ? ApplicationDocumentStatus.UPLOADED : ApplicationDocumentStatus.VERIFIED,
          fileUrl: `/uploads/admissions/${applicationNumber}/${fileName}`,
          fileName,
          notes: rejected ? "Uploaded copy is unclear. Please reupload a clearer scan." : null,
          verifiedAt: !rejected && !requested ? daysAgo(20 - docIndex) : null,
        },
      });
    }

    studentRecords.push({ studentId: student.id, classId, programSlug, admissionNumber: student.admissionNumber });
    parentRecords.push({ parentId: parent.id, name: parentName });

    if (index < 12 && program.category !== ProgramCategory.CAMP) {
      const invoiceAmount = programSlug === "day-care" ? 6500 : programSlug === "kannada-kasturi" ? 1800 : 9500;
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: makeInvoiceNumber(index + 1),
          studentId: student.id,
          amount: invoiceAmount,
          dueDate: addDays(daysAgo(5), index % 4 === 0 ? -10 : 20),
          status: index % 4 === 0 ? InvoiceStatus.PAID : index % 4 === 1 ? InvoiceStatus.ISSUED : index % 4 === 2 ? InvoiceStatus.PARTIALLY_PAID : InvoiceStatus.OVERDUE,
          lineItems: [{ title: "Program Fee", amount: invoiceAmount, programId: program.id }],
        },
      });

      if (index % 4 === 0) {
        const payment = await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            externalReference: `pay_seed_${index + 1}`,
            amount: invoiceAmount,
            method: index % 8 === 0 ? "CASH" : "RAZORPAY",
            status: PaymentStatus.SUCCESS,
            paidAt: daysAgo(3),
            gatewayPayload: { signatureVerified: true, source: index % 8 === 0 ? "admin-cash" : "seed-gateway" },
          },
        });
        await prisma.receipt.create({
          data: { receiptNumber: makeReceiptNumber(index + 1), studentId: student.id, invoiceId: invoice.id, paymentId: payment.id, amount: invoiceAmount, issuedAt: daysAgo(2) },
        });
      } else if (index % 4 === 2) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            externalReference: `pay_seed_partial_${index + 1}`,
            amount: invoiceAmount / 2,
            method: "CASH",
            status: PaymentStatus.SUCCESS,
            paidAt: daysAgo(2),
            gatewayPayload: { signatureVerified: true, source: "admin-cash" },
          },
        });
      } else if (index % 4 === 1) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            externalReference: `order_seed_${index + 1}`,
            amount: invoiceAmount,
            method: "RAZORPAY",
            status: PaymentStatus.PENDING,
            gatewayPayload: { signatureVerified: false, orderId: `order_seed_${index + 1}` },
          },
        });
      }
    }

    if (index < 6) {
      const campProgram = programs.get("summer-camp")!;
      await prisma.invoice.create({
        data: {
          invoiceNumber: makeInvoiceNumber(200 + index + 1),
          studentId: student.id,
          amount: 2500,
          dueDate: addDays(daysAgo(2), 15),
          status: index % 2 === 0 ? InvoiceStatus.ISSUED : InvoiceStatus.PAID,
          lineItems: [{ title: index % 2 === 0 ? "Summer Camp Junior" : "Chess Activity", amount: 2500, programId: campProgram.id, manualActivity: true }],
        },
      });
    }

    for (let day = 0; day < 45; day += 1) {
      const cycle = [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.HALF_DAY];
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId,
          date: daysAgo(day),
          status: cycle[(day + index) % cycle.length],
          remarks: day % 13 === 0 ? "Late arrival" : null,
        },
      });
    }
  }

  for (const seed of teacherSeeds) {
    const teacher = teacherMap.get(seed.key)!;
    for (let day = 0; day < 45; day += 1) {
      const cycle = [TeacherAttendanceStatus.PRESENT, TeacherAttendanceStatus.PRESENT, TeacherAttendanceStatus.PRESENT, TeacherAttendanceStatus.HALF_DAY, TeacherAttendanceStatus.LEAVE];
      await prisma.teacherAttendance.create({
        data: {
          teacherId: teacher.teacherId,
          classId: seed.classIds[0],
          date: daysAgo(day),
          status: cycle[(day + teacher.name.length) % cycle.length],
          remarks: day % 15 === 0 ? "Approved leave / half day coverage arranged." : null,
        },
      });
    }

    const classStudents = studentRecords.filter((student) => student.classId === seed.classIds[0]).slice(0, 5);
    await prisma.homeworkUpdate.create({
      data: {
        teacherId: teacher.teacherId,
        classId: seed.classIds[0],
        audienceType: HomeworkUpdateAudience.CLASS_UPDATE,
        title: `${seed.designation} weekly class update`,
        content: "This week the class focused on language work, sensorial exploration, and practical life routines.",
        publishedAt: daysAgo(2),
        students: { create: classStudents.map((student) => ({ studentId: student.studentId })) },
      },
    });

    if (classStudents[0]) {
      await prisma.homeworkUpdate.create({
        data: {
          teacherId: teacher.teacherId,
          classId: seed.classIds[0],
          audienceType: HomeworkUpdateAudience.INDIVIDUAL_NOTE,
          title: `${classStudents[0].admissionNumber} individual note`,
          content: "Child showed stronger concentration this week and responded well to guided practical life work.",
          publishedAt: daysAgo(1),
          students: { create: [{ studentId: classStudents[0].studentId }] },
        },
      });

      await prisma.studentObservation.create({
        data: {
          teacherId: teacher.teacherId,
          studentId: classStudents[0].studentId,
          title: "Weekly Montessori observation",
          content: "The child is showing improved confidence in group transition and follows work-cycle routines more independently.",
          observedAt: daysAgo(3),
        },
      });
    }
  }

  for (let index = 0; index < 8; index += 1) {
    const program = programs.get(studentRecords[index].programSlug)!;
    await prisma.inquiry.create({
      data: {
        parentName: parentRecords[index].name,
        childName: firstNames[index],
        childAge: `${3 + (index % 4)} years`,
        phone: randomPhone(300 + index),
        email: `lead${index + 1}@mail.com`,
        message: "Interested in school visit and fee details.",
        source: index % 2 === 0 ? "Website" : "WhatsApp",
        preferredDate: addDays(new Date(), index + 1),
        status: index % 3 === 0 ? "CONTACTED" as never : "NEW" as never,
        programId: program.id,
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      { title: "New admission submitted", message: "A new parent application is waiting for review.", type: NotificationType.ADMISSION, channel: NotificationChannel.DASHBOARD, status: NotificationStatus.SENT },
      { title: "Payment created", message: "A new invoice has been released to a parent portal.", type: NotificationType.PAYMENT, channel: NotificationChannel.DASHBOARD, status: NotificationStatus.SENT },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
      { parentName: "Ritika N.", childName: "Vihaan", quote: "The school feels warm, polished, and deeply thoughtful. Our child has become more expressive and confident.", isFeatured: true },
      { parentName: "Karthik R.", childName: "Anika", quote: "We loved the balance of care, structure, and creativity. The team is responsive and reassuring.", isFeatured: true },
    ],
  });

  await prisma.galleryItem.createMany({
    data: [
      { title: "Sensorial Discovery", description: "Children exploring tactile and sorting materials in a calm learning corner.", imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg", category: "Classroom", sortOrder: 1 },
      { title: "Circle Time", description: "Group conversation, songs, and collaborative storytelling.", imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg", category: "Community", sortOrder: 2 },
    ],
  });

  await prisma.announcement.createMany({
    data: [
      { title: "Admissions Open for 2026", content: "Admissions are now open for Montessori, Day Care, and enrichment programs.", audience: "PUBLIC" },
      { title: "Summer Camp Registrations Live", content: "Choose from one-month and two-month camp options with Montessori-inspired activities.", audience: "PUBLIC" },
    ],
  });

  await prisma.event.createMany({
    data: [
      { title: "Campus Visit Week", description: "Guided family visits to experience the environment and meet the school team.", startsAt: new Date("2026-04-15T10:00:00+05:30"), location: "Sharada Koota Montessori, HSR Layout" },
      { title: "Summer Camp Orientation", description: "Meet mentors, review schedules, and prepare for the summer learning experience.", startsAt: new Date("2026-04-20T11:00:00+05:30"), location: "Sharada Koota Montessori, HSR Layout" },
    ],
  });

  await prisma.setting.create({
    data: {
      key: "school_profile",
      description: "Primary school metadata used throughout the platform.",
      value: {
        name: "Sharada Koota Montessori",
        tagline: "A House of Learning",
        phoneNumbers: ["9880199221", "9880857935"],
        email: "sharadakoota@gmail.com",
        address: ["#1062, 22nd Main Road", "22nd A Cross", "Sector-2", "HSR Layout", "Bangalore - 560102"],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
