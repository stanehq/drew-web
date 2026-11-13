import type { Metadata } from "next";
import { CommandsBoard } from "@/components/commands/commands-board";

export const metadata: Metadata = {
  title: "Commands",
  description: "Every Drew slash command with its options, permissions and what it does.",
};

export default function CommandsPage() {
  return <CommandsBoard />;
}
