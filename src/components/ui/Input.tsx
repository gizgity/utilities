import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder = "Enter text",
  className = "",
  ...props
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`px-4 py-2 w-full border-3 shadow-md transition focus:outline-hidden focus:shadow-lg focus:translate-y-[-2px] focus:translate-x-[-2px] field-sizing-content font-sans ${props["aria-invalid"]
          ? "border-destructive text-destructive shadow-destructive"
          : "border-black"
        } ${className}`}
      {...props}
    />
  );
};
