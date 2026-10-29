"use client";

// Adapted from shadcn/ui's Base UI Button, as in the Rose Barbosa site.
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonPrimitive } from "@/design-system/base";
import { cn } from "@/shared/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-wine text-white hover:bg-wine-light",
        outline: "border border-line bg-background hover:bg-muted",
        ghost: "bg-transparent hover:bg-muted",
        danger: "bg-transparent text-destructive hover:bg-destructive/10",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-8 px-3 text-xs",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
