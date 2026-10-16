// Browser tab icon (favicon), generated at build time from the Pello mark.
import { iconMark } from "@/lib/icon-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return iconMark(32, true);
}
