import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, fullWidth, className, ...props }, ref) => {
    const baseStyles =
      "px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

    const errorStyles = error
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-blue-500";

    return (
      <input
        ref={ref}
        className={clsx(baseStyles, errorStyles, fullWidth && "w-full", className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
