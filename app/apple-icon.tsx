// Apple touch icon (iPhone home screen, Safari bookmarks and favourites). iOS rounds the corners
// itself, so the square is drawn without them.
import { iconMark } from "@/lib/icon-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return iconMark(180, false);
}
