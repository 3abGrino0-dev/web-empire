import { redirect } from "next/navigation";

import { resolveRequestLocale } from "@/localization/resolve";

export default async function EntryPage() {
  const locale = await resolveRequestLocale();
  redirect(`/${locale}`);
}
