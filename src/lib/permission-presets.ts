import type { ModulePerms } from "@/lib/user-permission-update";

export const PERMISSION_PRESETS = {
  content: {
    permPeople: false,
    permMeetups: true,
    permInsights: true,
    permContact: false,
    permSettings: false,
  },
  fullOps: {
    permPeople: true,
    permMeetups: true,
    permInsights: true,
    permContact: true,
    permSettings: true,
  },
  contactSettings: {
    permPeople: false,
    permMeetups: false,
    permInsights: false,
    permContact: true,
    permSettings: true,
  },
} as const satisfies Record<string, ModulePerms>;

export type PermissionPresetId = keyof typeof PERMISSION_PRESETS;

export function applyPermissionPreset(id: PermissionPresetId): ModulePerms {
  return { ...PERMISSION_PRESETS[id] };
}
