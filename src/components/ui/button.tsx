import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:opacity-90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:opacity-90 active:scale-[0.98]",
        outline:
          "border-2 border-border bg-background hover:bg-secondary hover:border-primary/30 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "gradient-primary text-primary-foreground shadow-md hover:shadow-glow hover:opacity-95 active:scale-[0.98]",
        "gradient-outline":
          "border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 text-foreground hover:border-primary/50 hover:from-primary/10 hover:to-accent/10 active:scale-[0.98]",
        glass:
          "glass border border-border/50 text-foreground hover:bg-card/90 active:scale-[0.98]",
        success:
          "bg-status-success text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.98]",
        warning:
          "bg-status-warning text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
