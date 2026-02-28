// const IUBPCLogo = ({ size = "md", className = "" }) => {
//   const scale = size === "lg" ? "scale-150 mb-12" : size === "sm" ? "scale-75" : "scale-100 mb-6";
//   return (
//     <div className={`flex items-center justify-center gap-1 ${scale} ${className}`}>
//       {/* <div className="text-emerald-500 font-black text-5xl drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">{"<"}</div>
//       <div className="w-2 h-14 bg-indigo-500 -rotate-[20deg] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
//       <div className="text-emerald-500 font-black text-5xl drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">{">"}</div> */}
//       <img src="/logo.webp" alt="IUBPC Logo" />
//     </div>
//   );
// };

// export default IUBPCLogo;


import React from 'react';

const IUBPCLogo = ({ size = "md", className = "" }) => {
  // Mapping sizes to specific dimensions for better control than "scale"
  const sizeMap = {
    sm: "h-8 w-auto",
    md: "h-16 w-auto mb-6",
    lg: "h-24 w-auto mb-10",
    xl: "h-32 w-auto mb-12"
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center justify-center transition-all duration-300 ${className}`}>
      <div className="relative group">
        {/* Subtle Brand Glow - Emerald for IUBPC */}
        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <img 
          src="/logo.webp" 
          alt="IUB Programming Club Logo" 
          className={`${selectedSize} relative z-10 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]`}
          // Standard error handling if the image fails to load
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<span class="text-emerald-500 font-mono font-black text-xl">< IUBPC ></span>';
          }}
        />
      </div>
    </div>
  );
};

export default IUBPCLogo;