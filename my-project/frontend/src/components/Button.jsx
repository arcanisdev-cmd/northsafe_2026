function Button({ children, variant = "navy", className = "" }) {
  const baseStyles = "font-grotesk font-bold text-sm px-8 py-3 rounded-[10px] transition-colors";

  const variants = {
    navy: "bg-navy text-white hover:bg-navy/90",
    yellow: "bg-yellow text-navy hover:bg-yellow/90",
    outline: "border border-white text-white hover:bg-white/10",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export default Button;