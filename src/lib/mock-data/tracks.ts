export type Track = {
  id: string;
  name: string;
  description: string;
  format: string;
  audience: string;
};

export const tracks: Track[] = [
  {
    id: "technical",
    name: "Technical",
    description:
      "Deep dives into cutting-edge technologies, coding practices, and engineering principles.",
    format: "Hands-on Workshops & Deep-dive Seminars",
    audience: "Software Engineers, Data Scientists, Tech Enthusiasts",
  },
  {
    id: "managerial",
    name: "Managerial",
    description:
      "Explore leadership strategies, project management, and organizational dynamics in tech.",
    format: "Panel Discussions & Leadership Seminars",
    audience: "Product Managers, Team Leads, Agile Coaches",
  },
  {
    id: "entrepreneurial",
    name: "Entrepreneurial",
    description:
      "Learn the ropes of starting up, fundraising, and scaling a tech business.",
    format: "Pitch Sessions, Founder Stories & Networking",
    audience: "Founders, Investors, Innovators",
  },
];
