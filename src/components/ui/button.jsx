/* eslint-disable react-refresh/only-export-components */
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-ui whitespace-nowrap shadow-none transition-colors duration-motion-fast ease-motion-standard outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:scale-[0.99] disabled:pointer-events-none disabled:bg-surface-muted disabled:text-text-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover [a]:hover:bg-primary-hover",
        outline:
          "border-control-border bg-control text-text-primary hover:bg-control-hover aria-expanded:bg-control-selected aria-expanded:text-text-primary",
        secondary:
          "bg-control text-text-secondary hover:bg-control-hover hover:text-text-primary aria-expanded:bg-control-selected aria-expanded:text-text-primary",
        ghost:
          "text-text-secondary hover:bg-control-hover hover:text-text-primary aria-expanded:bg-control-selected aria-expanded:text-text-primary",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/25",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-target gap-item px-card has-data-[icon=inline-end]:pr-component has-data-[icon=inline-start]:pl-component",
        xs: "h-control-mini gap-tag px-control text-label in-data-[slot=button-group]:rounded-control has-data-[icon=inline-end]:pr-item has-data-[icon=inline-start]:pl-item [&_svg:not([class*='size-'])]:size-3",
        sm: "h-control-small gap-tag px-control text-label in-data-[slot=button-group]:rounded-control has-data-[icon=inline-end]:pr-item has-data-[icon=inline-start]:pl-item [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-control-large gap-item px-card text-ui has-data-[icon=inline-end]:pr-component has-data-[icon=inline-start]:pl-component",
        icon: "size-target",
        "icon-xs":
          "size-control-mini in-data-[slot=button-group]:rounded-control [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-control-small in-data-[slot=button-group]:rounded-control",
        "icon-lg": "size-target",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
