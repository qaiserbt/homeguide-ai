import type { AvatarState } from "../types/avatar";

/**
 * Where a real avatar image/video for each state should live. Drop a
 * transparent PNG or WebP at any of these paths and AvatarRenderer will use
 * it automatically instead of the built-in SVG placeholder — no code
 * changes required. See section 31 of the brief: this is the seam where a
 * lip-synced video/streaming avatar can later replace static images.
 */
export const avatarImagePaths: Record<AvatarState, string> = {
  welcome: "/avatar/avatar-welcome.png",
  explaining: "/avatar/avatar-explain.png",
  listening: "/avatar/avatar-listening.png",
  thinking: "/avatar/avatar-thinking.png",
  speaking: "/avatar/avatar-speaking.png",
  pointing: "/avatar/avatar-pointing.png",
};

export const avatarSmallImagePath = "/avatar/avatar-small.png";
