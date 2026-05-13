/* eslint-disable react-refresh/only-export-components */
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex min-h-control-mini w-fit shrink-0 items-center justify-center gap-tag overflow-hidden rounded-full border border-transparent px-control py-0 text-label leading-none whitespace-nowrap align-middle transition-colors duration-motion-fast ease-motion-standard focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 has-data-[icon=inline-end]:pr-item has-data-[icon=inline-start]:pl-item aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-control text-text-secondary [a]:hover:bg-control-hover",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-control-border bg-control text-text-secondary [a]:hover:bg-control-hover [a]:hover:text-text-primary",
        ghost:
          "text-text-secondary hover:bg-control-hover hover:text-text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
