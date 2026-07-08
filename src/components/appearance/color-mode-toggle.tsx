"use client";

import { useEffect } from "react";

import type { ColorMode } from "@/appearance/types";

const modes: Array<{ mode: ColorMode; icon: string; label: string }> = [
  { mode: "light", icon: "☀", label: "Light" },
  { mode: "dark", icon: "☾", label: "Dark" },
  { mode: "system", icon: "◐", label: "System" },
];

function applyMode(mode: ColorMode) {
  document
    .querySelector<HTMLElement>(".public-shell")
    ?.setAttribute("data-color-mode", mode);
}

export function ColorModeToggle({ defaultMode }: { defaultMode: ColorMode }) {
  useEffect(() => {
    const saved = window.localStorage.getItem("web-empire-color-mode") as ColorMode | null;
    const initial = modes.some((item) => item.mode === saved) && saved ? saved : defaultMode;
    applyMode(initial);
  }, [defaultMode]);

  function chooseNextMode() {
    const order: ColorMode[] = ["light", "dark", "system"];
    const saved = window.localStorage.getItem("web-empire-color-mode") as ColorMode | null;
    const currentMode = modes.some((item) => item.mode === saved) && saved ? saved : defaultMode;
    const currentIndex = order.indexOf(currentMode);
    const nextMode = order[(currentIndex + 1) % order.length] ?? "system";

    window.localStorage.setItem("web-empire-color-mode", nextMode);
    applyMode(nextMode);
  }

  return (
    <div className="mode-toggle-group" aria-label="Color mode">
      <button
        type="button"
        className="mode-toggle"
        onClick={chooseNextMode}
        aria-label="Color mode"
        title="Color mode"
      >
        ◐
      </button>
    </div>
  );
}
