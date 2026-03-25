import bcrypt from "bcryptjs";
import { PrismaClient, ProgramCategory, RoleType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const permissions = [
    ["content.manage", "Manage content"],
    ["inquiries.manage", "Manage inquiries"],
    ["admissions.manage", "Manage admissions"],
    ["students.manage", "Manage students"],
    ["payments.manage", "Manage payments"],
    ["attendance.manage", "Manage attendance"],
    ["announcements.manage", "Manage announcements"],
  ] as const;

  for (const [code, name] of permissions) {
    await prisma.permission.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  const roleConfigs = [
    { type: RoleType.SUPER_ADMIN, name: "Super Admin" },
    { type: RoleType.ADMIN, name: "Admin" },
    { type: RoleType.FRONT_DESK, name: "Front Desk" },
    { type: RoleType.PARENT, name: "Parent" },
    { type: RoleType.TEACHER, name: "Teacher" },
  ];

  for (const role of roleConfigs) {
    await prisma.role.upsert({
      where: { type: role.type },
      update: { name: role.name },
      create: role,
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { type: RoleType.ADMIN } });
  const parentRole = await prisma.role.findUniqueOrThrow({ where: { type: RoleType.PARENT } });
  const teacherRole = await prisma.role.findUniqueOrThrow({ where: { type: RoleType.TEACHER } });

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@shaaradakoota.com" },
    update: { name: "Sharada Koota Admin", passwordHash, roleId: adminRole.id },
    create: {
      name: "Sharada Koota Admin",
      email: process.env.ADMIN_EMAIL ?? "admin@shaaradakoota.com",
      passwordHash,
      phone: "9880199221",
      roleId: adminRole.id,
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@shaaradakoota.com" },
    update: {},
    create: {
      name: "Ananya Rao",
      email: "teacher@shaaradakoota.com",
      passwordHash,
      phone: "9880857935",
      roleId: teacherRole.id,
    },
  });

  const parentUser = await prisma.user.upsert({
    where: { email: "parent@shaaradakoota.com" },
    update: {},
    create: {
      name: "Maya Sharma",
      email: "parent@shaaradakoota.com",
      passwordHash,
      phone: "9876543210",
      roleId: parentRole.id,
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      designation: "Montessori Lead Guide",
      qualifications: "AMI Trained, Early Childhood Education",
      bio: "Supports experiential Montessori learning through language-rich and observation-led classrooms.",
    },
  });

  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      occupation: "Product Designer",
      addressLine1: "HSR Layout",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560102",
    },
  });

  const classRoom = await prisma.class.upsert({
    where: { id: "seed-class-little-explorers" },
    update: {},
    create: {
      id: "seed-class-little-explorers",
      name: "Little Explorers",
      section: "A",
      ageGroup: "2-6 years",
      capacity: 20,
      roomLabel: "Sunflower Studio",
    },
  });

  await prisma.teacherClassMap.upsert({
    where: {
      teacherId_classId: {
        teacherId: teacher.id,
        classId: classRoom.id,
      },
    },
    update: {},
    create: {
      teacherId: teacher.id,
      classId: classRoom.id,
      isLead: true,
    },
  });

  const programs = [
    {
      slug: "montessori-program",
      name: "Montessori Program",
      shortIntro: "Holistic early years education rooted in independence, curiosity, and confidence.",
      overview:
        "A carefully prepared Montessori environment that nurtures concentration, order, language, sensorial refinement, and joyful discovery.",
      benefits: [
        "Hands-on learning experiences",
        "Confidence and communication building",
        "Age-appropriate independence",
      ],
      ageGroup: "2-6 years",
      schedule: "Weekdays, 9:00 AM - 1:00 PM",
      features: ["Practical life", "Sensorial work", "Language", "Math readiness", "Culture"],
      faqItems: [
        { q: "What is the age group?", a: "The Montessori environment is designed for children between 2 and 6 years." },
      ],
      ctaLabel: "Book a Montessori Visit",
      category: ProgramCategory.CORE,
    },
    {
      slug: "day-care",
      name: "Day Care",
      shortIntro: "A safe, nurturing extension of the school day for working families.",
      overview:
        "Structured routines, rest, nourishment, and guided play in a caring environment with trained supervision.",
      benefits: ["Flexible support", "Calm supervised care", "Continuity for children"],
      ageGroup: "2-10 years",
      schedule: "Weekdays, extended hours",
      features: ["Rest routine", "Snacks", "Indoor play", "Quiet activities"],
      faqItems: [{ q: "Is day care available with school programs?", a: "Yes, day care can be paired with academic and camp programs." }],
      ctaLabel: "Enquire About Day Care",
      category: ProgramCategory.DAYCARE,
    },
    {
      slug: "after-school-activities",
      name: "After School Activities",
      shortIntro: "Creative, confidence-building enrichment after regular school hours.",
      overview:
        "A vibrant set of guided activities that support expression, communication, and practical skills.",
      benefits: ["Skill exploration", "Social confidence", "Structured afternoons"],
      ageGroup: "4-10 years",
      schedule: "Weekdays, afternoon slots",
      features: ["Art", "Language fun", "Brain games", "Confidence activities"],
      faqItems: [{ q: "Can children join selected activities only?", a: "Yes, the school can package flexible enrichment options." }],
      ctaLabel: "Explore Enrichment",
      category: ProgramCategory.ENRICHMENT,
    },
    {
      slug: "summer-camp",
      name: "Summer Camp",
      shortIntro: "Montessori-inspired summer experiences in a safe and stimulating setting.",
      overview:
        "A joyful camp with art, DIY crafts, science experiments, storytelling, sensorial work, and confidence-building in small groups.",
      benefits: ["Small group setting", "Safe and caring environment", "Day care support available"],
      ageGroup: "Little Explorers 2-6 years, Young Discoverers 6-10 years",
      schedule: "9:30 AM - 12:30 PM",
      features: [
        "Art",
        "DIY crafts",
        "Science experiments",
        "Brain games",
        "Storytelling",
        "Language fun",
        "Sensorial activities",
        "Cultural activities",
        "Fireless cooking",
        "Confidence building",
      ],
      faqItems: [{ q: "What are the fees?", a: "Two months: Rs. 4000. One month: Rs. 2300." }],
      ctaLabel: "Reserve a Summer Camp Seat",
      category: ProgramCategory.CAMP,
    },
    {
      slug: "creative-achievers",
      name: "Creative Achievers",
      shortIntro: "A focused enrichment track for expression, exploration, and creativity.",
      overview:
        "Designed to bring out communication, imagination, artistic confidence, and meaningful participation in group settings.",
      benefits: ["Creative confidence", "Stage presence", "Hands-on achievement"],
      ageGroup: "4-10 years",
      schedule: "Selected weekly sessions",
      features: ["Presentation skills", "Creative projects", "Showcase opportunities"],
      faqItems: [{ q: "Who is this suitable for?", a: "Children who enjoy expressive and project-based learning." }],
      ctaLabel: "Join Creative Achievers",
      category: ProgramCategory.ENRICHMENT,
    },
    {
      slug: "kannada-kasturi",
      name: "Kannada Kasturi",
      shortIntro: "Language and cultural grounding through Kannada-rich activities and stories.",
      overview:
        "A culturally rooted experience that builds vocabulary, expression, and pride in local language and traditions.",
      benefits: ["Language familiarity", "Cultural awareness", "Story-led confidence"],
      ageGroup: "4-10 years",
      schedule: "Selected weekly sessions",
      features: ["Storytelling", "Rhymes", "Cultural activities", "Language fun"],
      faqItems: [{ q: "Is prior Kannada fluency required?", a: "No, the program can support beginners and mixed familiarity levels." }],
      ctaLabel: "Explore Kannada Kasturi",
      category: ProgramCategory.LANGUAGE,
    },
  ];

  for (const program of programs) {
    await prisma.program.upsert({
      where: { slug: program.slug },
      update: program,
      create: program,
    });
  }

  const student = await prisma.student.upsert({
    where: { admissionNumber: "SKM-2026-001" },
    update: {},
    create: {
      admissionNumber: "SKM-2026-001",
      firstName: "Aarav",
      lastName: "Sharma",
      dateOfBirth: new Date("2021-06-15"),
      gender: "Male",
      bloodGroup: "O+",
      currentClassId: classRoom.id,
    },
  });

  await prisma.parentStudentMap.upsert({
    where: {
      parentId_studentId: {
        parentId: parent.id,
        studentId: student.id,
      },
    },
    update: {},
    create: {
      parentId: parent.id,
      studentId: student.id,
      relation: "Mother",
      isPrimary: true,
    },
  });

  await prisma.testimonial.createMany({
    data: [
      {
        parentName: "Ritika N.",
        childName: "Vihaan",
        quote: "The school feels warm, polished, and deeply thoughtful. Our child has become more expressive and confident.",
        isFeatured: true,
      },
      {
        parentName: "Karthik R.",
        childName: "Anika",
        quote: "We loved the balance of care, structure, and creativity. The team is responsive and reassuring.",
        isFeatured: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.galleryItem.createMany({
    data: [
      {
        title: "Sensorial Discovery",
        description: "Children exploring tactile and sorting materials in a calm learning corner.",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        category: "Classroom",
        sortOrder: 1,
      },
      {
        title: "Circle Time",
        description: "Group conversation, songs, and collaborative storytelling.",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        category: "Community",
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.announcement.createMany({
    data: [
      {
        title: "Admissions Open for 2026",
        content: "Admissions are now open for Montessori, Day Care, and enrichment programs.",
        audience: "PUBLIC",
      },
      {
        title: "Summer Camp Registrations Live",
        content: "Choose from one-month and two-month camp options with Montessori-inspired activities.",
        audience: "PUBLIC",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.event.createMany({
    data: [
      {
        title: "Campus Visit Week",
        description: "Guided family visits to experience the environment and meet the school team.",
        startsAt: new Date("2026-04-05T10:00:00+05:30"),
        location: "Sharada Koota Montessori, HSR Layout",
      },
      {
        title: "Summer Camp Orientation",
        description: "Meet mentors, review schedules, and prepare for the summer learning experience.",
        startsAt: new Date("2026-04-20T11:00:00+05:30"),
        location: "Sharada Koota Montessori, HSR Layout",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.setting.upsert({
    where: { key: "school_profile" },
    update: {},
    create: {
      key: "school_profile",
      description: "Primary school metadata used throughout the platform.",
      value: {
        name: "Sharada Koota Montessori",
        tagline: "A House of Learning",
        phoneNumbers: ["9880199221", "9880857935"],
        email: "sharadakoota@gmail.com",
        address: [
          "#1062, 22nd Main Road",
          "22nd A Cross",
          "Sector-2",
          "HSR Layout",
          "Bangalore - 560102",
        ],
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
