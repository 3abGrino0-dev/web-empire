import type { UiMessages } from "@/localization/types";

const englishFallback: UiMessages = {
  "nav.home": "Home",
  "nav.tools": "Tools",
  "nav.pricing": "Credits & Plans",
  "nav.dashboard": "My Space",
  "nav.login": "Sign in",
  "home.eyebrow": "WEB EMPIRE",
  "home.title": "Web Empire",
  "home.description":
    "One platform for fast tools and AI, customizable and extensible from the admin dashboard.",
  "home.explore": "Explore tools",
  "home.plans": "Credits & plans",
  "tools.title": "All tools",
  "tools.description":
    "Choose the right tool. Execution comes from the tool engine, not a fixed page.",
  "tool.result": "Result",
  "tool.empty": "Fill the fields and run the tool. The result will appear here.",
  "pricing.title": "Plans built on credits",
  "dashboard.title": "My space",
  "common.free": "Free",
  "common.points": "points",
  "language.label": "Language",
};

export function withEnglishFallback(messages: UiMessages): UiMessages {
  return { ...englishFallback, ...messages };
}

export function translate(messages: UiMessages, key: string): string {
  return messages[key] ?? englishFallback[key] ?? key;
}
