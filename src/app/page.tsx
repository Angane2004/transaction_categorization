"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Check if user is already logged in or has seen onboarding
    // Check for existing session
    const session = localStorage.getItem("auth_session");

    if (session) {
      // If session exists, go to unlock screen
      router.replace("/unlock");
    } else {
      // Otherwise go to onboarding
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse">Loading TransactAI...</div>
    </div>
  );
}
