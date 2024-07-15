"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2, MoonIcon, SunIcon } from "lucide-react";

type ThemeType = "dark" | "light";

export function ThemeToggle() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("light");
  const { setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);

    // need to do this to avoid dark mode flicker on load and still have color transitions
    document.body.setAttribute("data-theme-initialized", "true");

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setCurrentTheme(savedTheme as ThemeType);
      return;
    }

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setCurrentTheme("dark");
    }
  }, []);

  const handleThemeChange = () => {
    if (currentTheme === "dark") {
      setCurrentTheme("light");
      setTheme("light");
    } else {
      setCurrentTheme("dark");
      setTheme("dark");
    }
  };

  if (!isMounted)
    return (
      <Button variant="ghost" className="ml-2">
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );

  return (
    <Button
      variant="ghost"
      className="ml-2 overflow-hidden"
      onClick={handleThemeChange}
    >
      {currentTheme === "light" ? (
        <MoonIcon className="h-5 w-5 animate-in slide-in-from-bottom" />
      ) : (
        <SunIcon className="h-5 w-5 animate-in slide-in-from-bottom" />
      )}
    </Button>
  );
}
