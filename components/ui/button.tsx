import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-lg px-5 py-3 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b9ef70] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#b9ef70] text-[#091217] hover:bg-[#cbf69b]",
        secondary: "border border-[#526b72] bg-[#183239] text-[#f3f6f5] hover:bg-[#23444b]",
        outline: "border border-[#52646a] bg-transparent text-[#091217] hover:bg-[#e7eeee] focus-visible:outline-[#08756f]",
      },
      size: {
        default: "min-h-12",
        sm: "min-h-11 px-4 py-2",
        lg: "min-h-14 px-6 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      type={asChild ? type : (type ?? "button")}
      {...props}
    />
  );
}

export { Button, buttonVariants };
