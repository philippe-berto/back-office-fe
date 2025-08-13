"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TunityLogo from "@/components/TunityLogo";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("google_token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen tunity-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <TunityLogo className="h-20 w-20 mx-auto animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">tunity</h1>
        <p className="text-white/80">Loading...</p>
        <div className="mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
