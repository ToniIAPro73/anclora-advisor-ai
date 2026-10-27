import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { isAncloraIdentityEnabled } from "@/lib/auth/identity/env";
import { normalizeNextPath } from "@/lib/auth/identity/next-path";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeNextPath(params.next, "/dashboard/chat");
  if (isAncloraIdentityEnabled()) {
    redirect(`/api/auth/anclora-identity/login?next=${encodeURIComponent(nextPath)}`);
  }
  return <LoginForm nextPath={nextPath} />;
}

