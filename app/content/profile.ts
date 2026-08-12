export type ResearchTheme = {
  id: "worlds" | "motion" | "interaction";
  short: string;
};

export type SchoolMarkId = "sdu" | "uwmadison" | "cornell";

export type RichTextSegment = {
  text: string;
  href?: string;
  strong?: boolean;
  schoolMark?: SchoolMarkId;
};

export const profile = {
  name: "Hua Zhou",
  email: "damaoluckyy@gmail.com",
  role: "Computer Science Undergraduate",
  affiliation: "University of Wisconsin–Madison",
  location: "Madison, Wisconsin",
  statement: "Hua Zhou studies computer vision, generative AI, and photo/video generation at UW–Madison.",
  bioParagraphs: [
    [
      { text: "I am a Computer Science undergraduate at " },
      { text: "University of Wisconsin–Madison", strong: true, schoolMark: "uwmadison" },
      { text: ", where I have worked with " },
      { text: "Prof. Yin Li", href: "https://yinli-vision.github.io/", strong: true },
      { text: " and " },
      { text: "Prof. Icy Zhang", href: "https://edpsych.education.wisc.edu/fac-staff/zhang-icy/", strong: true },
      { text: ". In Summer 2026, I worked with " },
      { text: "Prof. Hadar Averbuch-Elor", href: "https://www.hadarelor.com/", strong: true },
      { text: " at " },
      { text: "Cornell Tech", strong: true, schoolMark: "cornell" },
      { text: ". Previously, I studied Automation at " },
      { text: "Shandong University", strong: true, schoolMark: "sdu" },
      { text: "." },
    ],
    [
      { text: "My research interests lie in " },
      { text: "computer vision", strong: true },
      { text: " and " },
      { text: "generative AI", strong: true },
      { text: ", with a focus on image and video understanding and generation. I enjoy building visual systems that learn useful structure from the way the world looks, moves, and responds." },
    ],
  ] satisfies readonly (readonly RichTextSegment[])[],
  links: [
    { id: "github", label: "GitHub", href: "https://github.com/Damaolucky" },
    { id: "scholar", label: "Google Scholar", href: null },
  ],
} as const;

export const researchThemes: readonly ResearchTheme[] = [
  {
    id: "worlds",
    short: "Vision",
  },
  {
    id: "motion",
    short: "GenAI",
  },
  {
    id: "interaction",
    short: "XR",
  },
];

export const news = [
  { date: "2026.01", text: "Joined UW–Madison research projects in ergonomic computer vision and immersive learning." },
] as const;

export const lastUpdated = {
  dateTime: "2026-08-12",
  label: "August 12, 2026",
} as const;

export const miscText = "Outside research, I enjoy animation, illustration, and small creative coding projects. I work with Python, PyTorch, Java, C, and Git, and speak Mandarin and English.";
