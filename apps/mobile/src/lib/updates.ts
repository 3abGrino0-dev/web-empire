import * as Updates from "expo-updates";

export interface ReleaseNote {
  version: string;
  channel: "preview" | "production";
  title: string;
  body: string;
  required: boolean;
}

export async function checkForUpdates(): Promise<{ available: boolean; isUpdate: boolean; error?: string }> {
  if (!Updates?.isEnabled) {
    return { available: false, isUpdate: false, error: "Expo updates are disabled in this environment." };
  }

  try {
    const update = await Updates.checkForUpdateAsync();
    return { available: update.isAvailable, isUpdate: update.isAvailable };
  } catch (error) {
    return {
      available: false,
      isUpdate: false,
      error: error instanceof Error ? error.message : "Unable to check for updates.",
    };
  }
}

export async function downloadAndApplyUpdate(): Promise<{ success: boolean; error?: string }> {
  if (!Updates?.isEnabled) {
    return { success: false, error: "Expo updates are disabled in this environment." };
  }

  try {
    const update = await Updates.checkForUpdateAsync();
    if (!update.isAvailable) {
      return { success: false, error: "No update available." };
    }

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to install update.",
    };
  }
}
