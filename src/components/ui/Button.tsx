import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  "font-head transition-all outline-hidden cursor-pointer duration-150 font-medium flex items-center justify-center uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "shadow-md hover:shadow-lg active:shadow-sm bg-primary text-primary-foreground border-3 border-black transition hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-1 active:translate-x-1 hover:bg-primary-hover",
        secondary:
          "shadow-md hover:shadow-lg active:shadow-sm bg-secondary text-secondary-foreground border-3 border-black transition hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-1 active:translate-x-1",
        outline:
          "shadow-md hover:shadow-lg active:shadow-sm bg-transparent border-3 border-black transition hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-1 active:translate-x-1 hover:bg-muted",
        link: "bg-transparent hover:underline",
        destructive:
          "shadow-md hover:shadow-lg active:shadow-sm bg-destructive text-destructive-foreground border-3 border-black transition hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-1 active:translate-x-1",
        cyan:
          "shadow-md hover:shadow-lg active:shadow-sm bg-cyan text-cyan-foreground border-3 border-black transition hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-1 active:translate-x-1",
        magenta:
          "shadow-md hover:shadow-lg active:shadow-sm bg-magenta text-magenta-foreground border-3 border-black transition hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-1 active:translate-x-1",
        lime:
          "shadow-md hover:shadow-lg active:shadow-sm bg-lime text-lime-foreground border-3 border-black transition hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-1 active:translate-x-1",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2 text-sm",
        lg: "px-7 py-3 text-base",
        icon: "p-2",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      children,
      size = "md",
      className = "",
      variant = "default",
      asChild = false,
      disabled,
      ...props
    }: IButtonProps,
    forwardedRef,
  ) => {
    const Comp = asChild ? Slot : "button";
    // If the button is disabled, force the visual variant to 'secondary'
    // so it appears visually disabled regardless of the provided variant.
    const appliedVariant = disabled ? "secondary" : variant;

    return (
      <Comp
        ref={forwardedRef}
        className={cn(
          buttonVariants({ variant: appliedVariant, size }),
          className,
          disabled && "pointer-events-none opacity-60",
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

Button.displayName = "Button";