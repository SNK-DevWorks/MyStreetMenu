import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title = "Manage Your Food Business",
  subtitle = "Manage your menu and track today's performance.",
  className = "",
}) => {
  return (
    <div className={`relative w-full max-w-[1200px] mt-4 sm:mt-6 md:mt-8 ${className}`}>
      {/* Main Card Container without overflow-hidden so illustration head pops out of the top */}
      <div className="relative w-full bg-[#f77512] rounded-[24px] py-8 sm:py-10 md:py-12 px-6 sm:px-8 md:px-10 text-white shadow-[0_-12px_30px_rgba(0,0,0,0.22),0_12px_25px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-center justify-between min-h-[240px] sm:min-h-[260px] md:min-h-[280px]">

        {/* Left Content */}
        <div className="z-10 flex flex-col items-start max-w-xl space-y-2 sm:space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {title}
          </h2>

          <p className="text-white/95 text-base sm:text-lg md:text-xl font-bold leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Right Illustration: Wrapper extends above card top (-55px) so head pops out, but clips at bottom rounded-b-[24px] so it never overflows card bottom */}
        <div className="absolute top-[-55px] bottom-0 left-0 right-0 rounded-b-[24px] overflow-hidden pointer-events-none select-none">
          <div className="absolute right-2 sm:right-6 md:right-10 bottom-0 flex items-end justify-center md:justify-end">
            <img
              src="https://res.cloudinary.com/dfledgwk1/image/upload/v1784795987/Adobe_Express_Photo_project_-_23_July_2026_at_14.03.16_tiot75.png"
              alt="Welcome Illustration"
              className="h-[220px] sm:h-[250px] md:h-[280px] lg:h-[300px] w-auto object-contain object-bottom"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Card;
