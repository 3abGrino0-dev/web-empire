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

  function chooseMode(mode: ColorMode) {
    window.localStorage.setItem("web-empire-color-mode", mode);
    applyMode(mode);
  }

  return (
    <div className="mode-toggle-group" aria-label="Color mode">
      {modes.map((item) => (
        <button
          key={item.mode}
          type="button"
          className="mode-toggle"
          onClick={() => chooseMode(item.mode)}
          aria-label={item.label}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
