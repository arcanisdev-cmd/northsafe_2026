import { ChevronDown } from "lucide-react";

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div
      className="rounded-xl px-6 py-5 cursor-pointer bg-white"
      style={{ border: "1px solid #E0E0E0" }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-inter font-semibold text-base" style={{ color: "#042545" }}>
          {question}
        </p>
        <ChevronDown
          size={22}
          className="shrink-0 transition-transform duration-300"
          style={{ color: "#46B5FF", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "200px" : "0px" }}
      >
        <p className="font-inter text-base mt-3" style={{ color: "#4E4E4E" }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export default FAQItem;