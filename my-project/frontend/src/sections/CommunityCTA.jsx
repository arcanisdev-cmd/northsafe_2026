
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function CommunityCTA() {
  return (
    <section className="bg-[#F3F6FA] px-5 pb-12 pt-0 sm:px-8 sm:pb-16 md:px-12 lg:px-[100px] lg:pb-[60px]">
      <div className="relative isolate flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl bg-[#A8DBFF] px-6 py-8 shadow-[0_20px_40px_-20px_rgba(8,69,126,0.45)] sm:px-8 sm:py-9 md:px-10 md:py-10 lg:flex-row lg:items-center lg:gap-8 lg:px-[60px] lg:py-10">
        {/* Decorative circles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-white/35"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-1/4 -z-10 h-56 w-56 rounded-full bg-teal/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -left-10 -z-10 h-36 w-36 rounded-full bg-yellow/40"
        />

        {/* Text */}
        <div className="w-full">
          <h3 className="max-w-[825px] text-balance font-inter text-[26px] font-bold leading-tight text-[#2F3A72] sm:text-[30px] md:text-[33.16px] md:leading-[40px]">
            Ready to Make Your Community Safer?
          </h3>

          <p className="mt-3 max-w-[834px] font-krub text-[15px] font-medium leading-6 text-[#383838] md:text-[16.58px] md:leading-[24.9px]">
            Join hundreds of residents already using NORTHSAFE to report and
            resolve hazards. Together, we can build a safer North Caloocan.
            Takes less than 2 minutes. Your information is kept private.
          </p>
        </div>

        {/* CTA */}
        <Link
          to="/signup"
          className="group flex h-12 w-full shrink-0 items-center justify-center gap-2.5 rounded-full bg-navy px-8 font-inter text-sm font-bold text-white transition-colors duration-200 hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 sm:w-auto lg:h-[48px]"
        >
          <span>Create an Account</span>
          <ArrowRight
            size={18}
            strokeWidth={2.5}
            className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </Link>
      </div>
    </section>
  );
}

export default CommunityCTA;
