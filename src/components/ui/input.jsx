import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-target w-full min-w-0 max-w-full rounded-control border border-control-border bg-control px-component text-ui text-text-primary shadow-none transition-colors duration-motion-fast ease-motion-standard outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-label file:font-medium file:text-text-primary placeholder:text-text-placeholder hover:bg-control-hover focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-control-selected disabled:text-text-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25",
        className
      )}
      {...props} />
  );
}

export { Input }
