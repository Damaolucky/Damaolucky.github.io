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
  image?: { src: string; alt: string };
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
export const papers: readonly Paper[] = [{
  id: "histmappairs",
  title: "Historical Map",
  authors: ["Hua Zhou", "Junho Kim", "Junhyeong Cho", "Hadar Averbuch-Elor"],
  venue: "Cornell Tech · advised by Prof. Hadar Averbuch-Elor",
  venueShort: "Research · 2026",
  year: 2026,
  topics: ["worlds"],
  summary: "Matching historical maps with modern maps using visual representation learning to recover geographic locations and point correspondences.",
  kind: "Research",
  art: "field",
  image: { src: "/media/map-options/layered-map.svg", alt: "Layered lavender maps illustrating spatial correspondence across time" },
  links: [],
}];
