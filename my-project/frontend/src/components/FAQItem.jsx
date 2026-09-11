import { ChevronDown } from "lucide-react";

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E0E0E0] bg-white">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        className="flex min-h-[64px] w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38ABFF] focus-visible:ring-inset sm:px-6 sm:py-5"
      >
        <span className="font-inter text-sm font-semibold leading-6 text-[#042545] sm:text-base">
          {question}
        </span>

        <ChevronDown
          size={22}
          className={`shrink-0 text-[#46B5FF] transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 font-inter text-sm leading-6 text-[#4E4E4E] sm:px-6 sm:text-base">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FAQItem;