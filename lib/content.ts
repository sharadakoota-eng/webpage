import { formatCurrency } from "@/lib/utils";

export type ProgramContent = {
  slug: string;
  title: string;
  subtitle: string;
  ageGroup: string;
  schedule: string;
  overview: string[];
  benefits: string[];
  features: string[];
  faq: { question: string; answer: string }[];
  ctaTitle: string;
  ctaDescription: string;
};

export const programs: ProgramContent[] = [
  {
    slug: "montessori-program",
    title: "Montessori Program",
    subtitle: "Child-led discovery in a beautifully prepared learning environment.",
    ageGroup: "2 to 6 years",
    schedule: "Weekdays | 9:00 AM to 1:00 PM",
    overview: [
      "Our Montessori environment nurtures concentration, independence, grace, and curiosity through self-paced, hands-on learning.",
      "Children engage with thoughtfully prepared materials across practical life, language, sensorial work, early mathematics, and cultural exploration.",
    ],
    benefits: [
      "Builds independence and confidence",
      "Supports communication and emotional growth",
      "Encourages a joyful love for learning",
    ],
    features: [
      "Prepared Montessori classroom",
      "Guided observation by trained educators",
      "Language-rich interactions",
      "Sensorial and practical life activities",
      "Holistic child development focus",
    ],
    faq: [
      {
        question: "How is Montessori different from a traditional preschool?",
        answer:
          "Montessori emphasizes self-directed learning, hands-on materials, mixed readiness levels, and guided independence instead of one-size-fits-all instruction.",
      },
      {
        question: "Is this suitable for first-time school goers?",
        answer:
          "Yes. The environment is designed to help children settle gently, develop routine, and grow in confidence.",
      },
    ],
    ctaTitle: "Experience our Montessori environment",
    ctaDescription: "Book a visit to see how calm, structured, joyful learning feels in person.",
  },
  {
    slug: "day-care",
    title: "Day Care",
    subtitle: "Flexible, nurturing support for working families.",
    ageGroup: "2 to 10 years",
    schedule: "Extended support options on weekdays",
    overview: [
      "Our day care experience offers a safe, caring, and well-supervised space where children can rest, play, and transition comfortably through their day.",
      "The rhythm balances calm care, light activity, and familiar routines that help children feel secure and seen.",
    ],
    benefits: [
      "Reliable care support for parents",
      "Consistent routines for children",
      "Warm supervision in a school setting",
    ],
    features: [
      "Safe pick-up and drop coordination",
      "Quiet rest time and guided free play",
      "Flexible pairing with school programs",
      "Child-friendly indoor engagement",
    ],
    faq: [
      {
        question: "Can day care be combined with Montessori and camp programs?",
        answer: "Yes. The structure is designed to support school-day extensions and special program combinations.",
      },
    ],
    ctaTitle: "Need flexible care support?",
    ctaDescription: "Speak with our team to find a schedule that suits your family rhythm.",
  },
  {
    slug: "after-school-activities",
    title: "After School Activities",
    subtitle: "Creative and confidence-building enrichment after regular school hours.",
    ageGroup: "4 to 10 years",
    schedule: "Afternoon and selected weekly slots",
    overview: [
      "After-school experiences extend learning into expression, exploration, and purposeful fun.",
      "The focus is on creativity, communication, participation, and practical confidence in a well-guided small-group environment.",
    ],
    benefits: [
      "Encourages creative exploration",
      "Supports social and verbal confidence",
      "Adds meaningful structure to afternoons",
    ],
    features: [
      "Art and craft sessions",
      "Language fun and storytelling",
      "Brain games and collaborative tasks",
      "Confidence-building activities",
    ],
    faq: [
      {
        question: "Can families choose selected activities?",
        answer: "Yes. The school can package enrichment options based on availability and age suitability.",
      },
    ],
    ctaTitle: "Build joyful learning beyond class hours",
    ctaDescription: "Explore enrichment that blends creativity, communication, and confidence.",
  },
  {
    slug: "summer-camp",
    title: "Summer Camp",
    subtitle: "Montessori-inspired summer days in a safe, caring, stimulating environment.",
    ageGroup: "Little Explorers: 2 to 6 years | Young Discoverers: 6 to 10 years",
    schedule: "9:30 AM to 12:30 PM",
    overview: [
      "Our summer camp combines Montessori-inspired exploration with rich seasonal activities that keep children curious, expressive, and joyfully engaged.",
      "The setting is warm and secure, with small group experiences and optional day care support for families who need greater flexibility.",
    ],
    benefits: [
      "Small group settings for better care and attention",
      "Safe, caring, and stimulating environment",
      "Day care support available",
    ],
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
      `2 months - ${formatCurrency(4000)}`,
      `1 month - ${formatCurrency(2300)}`,
    ],
    faq: [
      {
        question: "What are the available fee options?",
        answer: "The two-month plan is Rs. 4000 and the one-month plan is Rs. 2300.",
      },
      {
        question: "Is day care available during camp season?",
        answer: "Yes. The camp architecture is planned with day care support options for families that need extended care.",
      },
    ],
    ctaTitle: "Reserve your child’s summer experience",
    ctaDescription: "Book early for a warm, enriching camp rooted in curiosity and care.",
  },
  {
    slug: "creative-achievers",
    title: "Creative Achievers",
    subtitle: "A stage for creativity, confidence, and meaningful expression.",
    ageGroup: "4 to 10 years",
    schedule: "Selected weekly sessions",
    overview: [
      "Creative Achievers is designed for children who thrive when expression, imagination, and project work come together in a supportive space.",
      "The program highlights effort, participation, and celebration of each child’s developing voice.",
    ],
    benefits: [
      "Strengthens confidence and self-expression",
      "Encourages project-based participation",
      "Creates showcase moments for achievement",
    ],
    features: [
      "Presentation and communication activities",
      "Creative projects",
      "Collaborative challenges",
      "Recognition and showcase opportunities",
    ],
    faq: [
      {
        question: "Who is this best suited for?",
        answer: "Children who enjoy creating, expressing, presenting, and participating in structured project experiences.",
      },
    ],
    ctaTitle: "Nurture creative confidence",
    ctaDescription: "Let children discover how capable and expressive they can become.",
  },
  {
    slug: "kannada-kasturi",
    title: "Kannada Kasturi",
    subtitle: "Language-rich cultural learning rooted in local identity.",
    ageGroup: "4 to 10 years",
    schedule: "Selected weekly sessions",
    overview: [
      "Kannada Kasturi supports connection to language, story, rhythm, and culture through experiences that feel warm, familiar, and joyful.",
      "It helps children become comfortable with expression and cultural awareness in an age-appropriate way.",
    ],
    benefits: [
      "Builds comfort with Kannada language exposure",
      "Strengthens cultural connection",
      "Supports confident expression through stories and activities",
    ],
    features: [
      "Storytelling and rhymes",
      "Language games",
      "Cultural activities",
      "Vocabulary-rich interactions",
    ],
    faq: [
      {
        question: "Do children need prior fluency in Kannada?",
        answer: "No. The program can support beginners as well as children with some familiarity.",
      },
    ],
    ctaTitle: "Celebrate language and culture",
    ctaDescription: "Choose a program that blends identity, expression, and joyful learning.",
  },
];

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/montessori-program", label: "Montessori Program" },
  { href: "/day-care", label: "Day Care" },
  { href: "/after-school-activities", label: "After School Activities" },
  { href: "/summer-camp", label: "Summer Camp" },
  { href: "/creative-achievers", label: "Creative Achievers" },
  { href: "/kannada-kasturi", label: "Kannada Kasturi" },
  { href: "/admissions", label: "Admissions" },
  { href: "/fee-payments", label: "Fee & Payments" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/events", label: "Events" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];
