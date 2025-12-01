"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProtectedPage({ children }) {
  const { status } = useSession();

  if (status === "loading") return <p>Carregando...</p>;
  if (status === "unauthenticated") redirect("/login");

  return children;
}
