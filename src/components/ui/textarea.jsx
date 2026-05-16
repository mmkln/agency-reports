import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full min-w-0 max-w-full resize-y rounded-control border border-control-border bg-control px-component py-control text-ui text-text-primary shadow-none transition-colors duration-motion-fast ease-motion-standard outline-none placeholder:text-text-placeholder hover:bg-control-hover focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-control-selected disabled:text-text-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25",
        className
      )}
      {...props} />
  );
}

export { Textarea }
