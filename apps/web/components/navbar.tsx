"use client";

import { authClient } from "@/utils/auth-client";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";
import { Loader } from "lucide-react";
import Link from "next/link";
import { UserDropdown } from "./user-dropdown";

export function Navbar() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();

  const handleLogin = async () => {
    setIsLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <header className="container mx-auto flex items-center justify-between p-6">
      <p className="text-2xl font-semibold">Interview</p>
      {session?.user ? (
        <div className="flex items-center gap-5">
          <Link href="/dashboard">
            <Button
              variant={"link"}
              className="text-foreground/60 hover:text-foreground"
            >
              Dashboard
            </Button>
          </Link>
          <UserDropdown
            user={{
              name: session.user.name,
              email: session.user.email,
              avatar: session.user.image || "",
            }}
          />
        </div>
      ) : (
        <Button
          disabled={isLoading}
          onClick={handleLogin}
        >
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          Login
        </Button>
      )}
    </header>
  );
}
