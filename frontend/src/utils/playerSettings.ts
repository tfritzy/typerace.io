export interface PlayerSettingsValue {
  useAuthenticationAvatar: boolean;
}

export const defaultPlayerSettings: PlayerSettingsValue = {
  useAuthenticationAvatar: true,
};

export function parsePlayerSettings(value: string | null): PlayerSettingsValue {
  if (!value) return defaultPlayerSettings;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return defaultPlayerSettings;
    }

    const useAuthenticationAvatar =
      "useAuthenticationAvatar" in parsed
      && typeof parsed.useAuthenticationAvatar === "boolean"
        ? parsed.useAuthenticationAvatar
        : defaultPlayerSettings.useAuthenticationAvatar;

    return { useAuthenticationAvatar };
  } catch {
    return defaultPlayerSettings;
  }
}
