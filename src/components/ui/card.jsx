import { cn } from "@/lib/utils"

function Card({
  as: Comp = "div",
  className,
  size = "default",
  ...props
}) {
  return (
    <Comp
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex min-w-0 flex-col gap-component overflow-hidden rounded-block bg-block py-card text-ui text-text-primary shadow-none has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-item data-[size=sm]:rounded-control data-[size=sm]:py-component data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-block *:[img:last-child]:rounded-b-block",
        className
      )}
      {...props} />
  );
}

function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-tag px-card group-data-[size=sm]/card:px-component has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-component group-data-[size=sm]/card:[.border-b]:pb-control",
        className
      )}
      {...props} />
  );
}

function CardTitle({
  as: Comp = "div",
  className,
  ...props
}) {
  return (
    <Comp
      data-slot="card-title"
      className={cn(
        "font-heading text-heading text-text-primary group-data-[size=sm]/card:text-ui",
        className
      )}
      {...props} />
  );
}

function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-ui text-text-secondary", className)}
      {...props} />
  );
}

function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

function CardContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-content"
      className={cn("min-w-0 px-card group-data-[size=sm]/card:px-component", className)}
      {...props} />
  );
}

function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center border-t border-separator bg-surface-subtle p-card group-data-[size=sm]/card:p-component",
        className
      )}
      {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
