import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary text-background hover:bg-primary-hover shadow-[0_0_15px_rgba(0,240,255,0.3)]",
    secondary: "bg-background-input border border-white/10 hover:border-white/20 text-text-main",
    danger: "bg-danger text-white hover:bg-red-600 shadow-[0_0_15px_rgba(255,61,0,0.3)]",
    success: "bg-success text-background hover:bg-green-500 shadow-[0_0_15px_rgba(0,230,118,0.3)]",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
