export type Speaker = {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  bio: string;
  talkTitle: string;
  imageUrl?: string;
  featured?: boolean;
};

export const speakers: Speaker[] = [
  {
    id: "spk_1",
    name: "Dr. Elena Rostova",
    title: "Chief AI Scientist",
    affiliation: "Neural Dynamics Inc.",
    bio: "Dr. Rostova has 15 years of experience in distributed ML systems and leads research on scalable LLMs.",
    talkTitle: "The Future of Distributed AI Systems",
    featured: true,
  },
  {
    id: "spk_2",
    name: "Marcus Thorne",
    title: "VP of Engineering",
    affiliation: "CloudScale",
    bio: "Marcus is a cloud architecture veteran and author of 'Designing Resilient Microservices'.",
    talkTitle: "Building Zero-Downtime Architectures",
    featured: true,
  },
  {
    id: "spk_3",
    name: "Aisha Rahman",
    title: "Founder & CEO",
    affiliation: "InnovateTech",
    bio: "Aisha founded InnovateTech to democratize access to coding education globally.",
    talkTitle: "From Idea to Series A: The Founder's Journey",
    featured: true,
  },
  {
    id: "spk_4",
    name: "Dr. James Lin",
    title: "Director of Robotics",
    affiliation: "Tech University",
    bio: "Dr. Lin specializes in autonomous navigation and human-robot interaction.",
    talkTitle: "Navigating the Unknown: Autonomous Systems",
    featured: true,
  },
  {
    id: "spk_5",
    name: "Sarah Jenkins",
    title: "Lead Product Manager",
    affiliation: "FinTech Solutions",
    bio: "Sarah bridges the gap between engineering and business to deliver high-impact financial products.",
    talkTitle: "Product Management in High-Stakes Environments",
  },
  {
    id: "spk_6",
    name: "David Chen",
    title: "Principal Security Engineer",
    affiliation: "CyberShield",
    bio: "David is a leading expert in zero-trust architectures and penetration testing.",
    talkTitle: "Implementing Zero-Trust from Scratch",
  },
  {
    id: "spk_7",
    name: "Dr. Maya Patel",
    title: "Head of Data Science",
    affiliation: "HealthAI",
    bio: "Dr. Patel leverages machine learning to improve patient outcomes and optimize healthcare workflows.",
    talkTitle: "AI in Healthcare: Ethical and Practical Challenges",
  },
  {
    id: "spk_8",
    name: "Chris Wood",
    title: "Agile Coach",
    affiliation: "Transform Consulting",
    bio: "Chris helps organizations transition to agile methodologies and improve team dynamics.",
    talkTitle: "Scaling Agile Beyond the Development Team",
  },
  {
    id: "spk_9",
    name: "Olivia Martinez",
    title: "UX Research Lead",
    affiliation: "Design Co.",
    bio: "Olivia focuses on user-centric design and accessibility in digital products.",
    talkTitle: "Designing for Everyone: Accessibility First",
  },
  {
    id: "spk_10",
    name: "Kevin Lee",
    title: "CTO",
    affiliation: "NextGen Startups",
    bio: "Kevin guides early-stage startups in building scalable technical foundations.",
    talkTitle: "The Startup CTO's Survival Guide",
  },
  {
    id: "spk_11",
    name: "Priya Sharma",
    title: "Senior Blockchain Developer",
    affiliation: "CryptoWeb",
    bio: "Priya builds decentralized applications and smart contracts for the Web3 ecosystem.",
    talkTitle: "Smart Contract Security Best Practices",
  },
  {
    id: "spk_12",
    name: "Robert King",
    title: "Director of Engineering",
    affiliation: "Global Logistics",
    bio: "Robert manages global engineering teams and focuses on operational excellence.",
    talkTitle: "Managing Distributed Engineering Teams",
  },
  {
    id: "spk_13",
    name: "Dr. Emily Davis",
    title: "Quantum Computing Researcher",
    affiliation: "Advanced Research Labs",
    bio: "Dr. Davis explores the practical applications of quantum algorithms.",
    talkTitle: "Quantum Computing: Beyond the Hype",
  },
  {
    id: "spk_14",
    name: "Michael Chang",
    title: "Developer Advocate",
    affiliation: "OpenSource Inc.",
    bio: "Michael is passionate about open-source communities and developer experience.",
    talkTitle: "Building Thriving Open Source Communities",
  },
  {
    id: "spk_15",
    name: "Anita Gupta",
    title: "Chief Marketing Officer",
    affiliation: "GrowthHackers",
    bio: "Anita specializes in data-driven marketing strategies for tech companies.",
    talkTitle: "Marketing for Engineers: Telling Your Product's Story",
  }
];
