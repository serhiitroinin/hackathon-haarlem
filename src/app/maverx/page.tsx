import { type Metadata } from "next";

import { MaverxWorkspace } from "~/components/maverx/maverx-workspace";

export const metadata: Metadata = {
  title: "Maverx Training Builder",
  description: "One sentence → a complete, editable PowerPoint deck in Maverx house style.",
};

export default function MaverxPage() {
  return <MaverxWorkspace />;
}
