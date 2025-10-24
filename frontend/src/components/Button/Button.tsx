import React from "react";
import Button from "@mui/material/Button";
import type { ButtonProps as MUIButtonProps } from "@mui/material/Button";
import "./Button.css";

interface ButtonConfigProps extends Omit<MUIButtonProps, "variant"> {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  variant?: MUIButtonProps["variant"];
  className?: string;
}

const ButtonConfig: React.FC<ButtonConfigProps> = ({
  label,
  icon,
  iconPosition = "start",
  variant = "contained",
  disabled = false,
  size = "medium",
  color = "primary",
  type = "button",
  onClick,
  className,
  children,
  ...rest
}) => {
  const defaultClassname = `button-primary ${className} ${disabled ? "button-disabled" : ""}`.trim();

  return (
    <Button
      variant={variant}
      disabled={disabled}
      size={size}
      color={color}
      type={type}
      onClick={onClick}
      className={defaultClassname}
      startIcon={iconPosition === "start" ? icon : undefined}
      endIcon={iconPosition === "end" ? icon : undefined}
      {...rest}
    >
      {label || children}
    </Button>
  );
};

export default ButtonConfig;
