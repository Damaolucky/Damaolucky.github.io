import type { ResearchTheme } from "./profile";

type PaperLink = {
  label: "Paper" | "Project" | "Code" | "Video";
  href: string;
};

type Paper = {
  id: string;
  title: string;
  authors: readonly string[];
  venue: string;
  venueShort: string;
  year: number;
  topics: readonly ResearchTheme["id"][];
  summary: string;
  award?: string;
  kind: "Research" | "Project" | "Paper";
  art: "ribbons" | "frames" | "field" | "echo" | "blocks";
  links: readonly PaperLink[];
};

/**
 * PAPER LIST — this is the homepage's only publication data source.
 *
 * To add a paper, duplicate one object and edit its fields. The list order is
 * the display order. Choose one or more topic ids: worlds, motion, interaction.
 */
export const papers: readonly Paper[] = [
  {
    id: "ergonomic-vision",
    title: "Multi-view 3D Reconstruction for Ergonomic Analysis",
    authors: ["Hua Zhou"],
    venue: "UW–Madison Department of Computer Sciences · advised by Prof. Yin Li",
    venueShort: "Research · 2026",
    year: 2026,
    topics: ["worlds", "motion"],
    summary: "Annotating multi-view lifting videos and exploring SAM 3D reconstruction to model body mechanics and support physical-injury risk analysis.",
    kind: "Research",
    art: "ribbons",
    links: [],
  },
  {
    id: "vr-learning",
    title: "Evaluating VR Tutorials for Immersive Learning",
    authors: ["Hua Zhou"],
    venue: "UW–Madison Department of Educational Psychology · advised by Prof. Icy Zhang",
    venueShort: "Research · 2026",
    year: 2026,
    topics: ["interaction"],
    summary: "Conducting VR-based human-subject experiments and pre/post surveys to evaluate knowledge acquisition in immersive educational environments.",
    kind: "Research",
    art: "frames",
    links: [],
  },
  {
    id: "pokemon-style-transfer",
    title: "Style Transfer Models on Pokémon Images",
    authors: ["Hua Zhou"],
    venue: "Computer vision and generative modeling project",
    venueShort: "Project · Fall 2025",
    year: 2025,
    topics: ["motion", "worlds"],
    summary: "Built a VGG19 neural style-transfer pipeline and trained a CycleGAN with a ResNet generator and PatchGAN discriminator for unpaired image translation.",
    kind: "Project",
    art: "field",
    links: [],
  },
] as const;
