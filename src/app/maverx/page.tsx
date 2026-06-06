import { redirect } from "next/navigation";

// The training builder is now the project-scoped build flow
// (/projects/[id]/slides). Keep this path working by sending people to pick or
// create a project, where the real, grounded flow lives.
export default function MaverxPage() {
  redirect("/");
}
