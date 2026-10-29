import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import {
  Add01Icon,
  Alert02Icon,
  ArrowTurnBackwardIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  Download04Icon,
  Folder01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";

type IconProps = Omit<HugeiconsIconProps, "icon">;
function createIcon(icon: HugeiconsIconProps["icon"]) {
  return function Icon(props: IconProps) {
    return (
      <HugeiconsIcon
        icon={icon}
        size={20}
        strokeWidth={1.5}
        aria-hidden="true"
        {...props}
      />
    );
  };
}

export const Plus = createIcon(Add01Icon);
export const Warning = createIcon(Alert02Icon);
export const Undo = createIcon(ArrowTurnBackwardIcon);
export const X = createIcon(Cancel01Icon);
export const CheckCircle = createIcon(CheckmarkCircle02Icon);
export const Copy = createIcon(Copy01Icon);
export const Trash = createIcon(Delete02Icon);
export const Download = createIcon(Download04Icon);
export const Folder = createIcon(Folder01Icon);
export const Pencil = createIcon(PencilEdit02Icon);
