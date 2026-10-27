import { redirect } from "next/navigation";
import { normalizeNextPath } from "@/lib/auth/identity/next-path";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeNextPath(params.next, "/dashboard/chat");
  redirect(`/api/auth/anclora-identity/login?next=${encodeURIComponent(nextPath)}`);
}

