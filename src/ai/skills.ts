import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getToolSkillInstructions(toolId: string): Promise<string> {
  const supabase = createSupabaseAdminClient();

  const { data: bindings, error } = await supabase
    .from("tool_skills")
    .select("skill_id, sort_order")
    .eq("tool_id", toolId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  if (!bindings?.length) return "";

  const skillIds = bindings.map((row) => row.skill_id);
  const { data: skills, error: skillsError } = await supabase
    .from("skills")
    .select("id, name, current_version_id")
    .in("id", skillIds)
    .eq("status", "active");

  if (skillsError) throw new Error(skillsError.message);

  const versionIds = (skills ?? [])
    .map((skill) => skill.current_version_id)
    .filter((value): value is string => Boolean(value));

  if (!versionIds.length) return "";

  const { data: versions, error: versionsError } = await supabase
    .from("skill_versions")
    .select("id, instructions")
    .in("id", versionIds);

  if (versionsError) throw new Error(versionsError.message);

  const versionById = new Map(
    (versions ?? []).map((version) => [version.id, version.instructions])
  );
  const skillById = new Map((skills ?? []).map((skill) => [skill.id, skill]));

  return bindings
    .map((binding) => {
      const skill = skillById.get(binding.skill_id);
      if (!skill?.current_version_id) return "";
      const instructions = versionById.get(skill.current_version_id);
      return instructions ? `## ${skill.name}\n${instructions}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}
