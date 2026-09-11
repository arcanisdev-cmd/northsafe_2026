import { Link } from "react-router-dom";

function CommunityCTA() {
  return (
    <section className="px-5 pb-12 pt-0 sm:px-8 sm:pb-16 md:px-12 lg:px-[100px] lg:pb-[60px]">
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[#A8DBFF] px-6 py-8 sm:px-8 sm:py-9 md:px-10 md:py-10 lg:flex-row lg:items-center lg:gap-8 lg:px-[60px] lg:py-10">
        {/* Text */}
        <div className="w-full">
          <h3 className="max-w-[825px] font-inter text-[26px] font-bold leading-tight text-[#2F3A72] sm:text-[30px] md:text-[33.16px] md:leading-[40px]">
            Ready to Make Your Community Safer?
          </h3>

          <p className="mt-3 max-w-[834px] font-krub text-sm font-medium leading-6 text-[#383838] sm:text-[15px] md:text-[16.58px] md:leading-[24.9px]">
            Join hundreds of residents already using NORTHSAFE to report and
            resolve hazards. Together, we can build a safer North Caloocan.
            Takes less than 2 minutes. Your information is kept private.
          </p>
        </div>

        {/* CTA */}
        <Link
          to="/signup"
          className="flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-[#042545] px-8 font-inter text-sm font-bold text-white transition-colors duration-200 hover:bg-[#07365F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#042545] focus-visible:ring-offset-2 sm:w-auto lg:h-[48px]"
        >
          Create an Account
        </Link>
      </div>
    </section>
  );
}

export default CommunityCTA;