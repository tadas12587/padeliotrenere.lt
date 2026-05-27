// Root-level page — the real homepage lives in src/app/(public)/page.tsx
// which is served via the (public) layout group (Navbar + Footer).
// This file is kept as a safety fallback.
import { redirect } from "next/navigation";
export default function RootPage() {
  redirect("/");
}
