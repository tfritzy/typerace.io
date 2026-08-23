import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../lib/utils";

const boxVariants = cva("box", {
  variants: {
    tone: {
      default: "text-foreground",
      accent: "text-accent-primary",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

type BoxStyle = CSSProperties & {
  "--color-box-bg"?: string;
  "--color-box-border"?: string;
};

const accentStyle: BoxStyle = {
  "--color-box-bg":
    "color-mix(in srgb, var(--accent-primary) 10%, transparent)",
  "--color-box-border":
    "color-mix(in srgb, var(--accent-primary) 40%, transparent)",
};

interface BoxProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof boxVariants> {
  asChild?: boolean;
}

export function Box({
  asChild = false,
  tone,
  className,
  style,
  ...props
}: BoxProps) {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(boxVariants({ tone }), className)}
      style={tone === "accent" ? { ...accentStyle, ...style } : style}
      {...props}
    />
  );
}
