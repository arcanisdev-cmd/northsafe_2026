import { useState } from "react";
import FAQItem from "../components/FAQItem";

const faqs = [
  { question: "What is NORTHSAFE?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { question: "Is my information safe?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { question: "How is false reporting prevented?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { question: "Who can report hazards?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { question: "How does the AI-Classification work?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { question: "Is NORTHSAFE free to use?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="relative flex items-start overflow-hidden px-[100px] pt-[100px] pb-[60px] gap-[240px]">
      <svg
  className="absolute pointer-events-none"
  style={{ left: "-140px", top: "0px", zIndex: 0 }}
  width="760"
  height="650"
  viewBox="0 0 760 650"
  fill="none"
>
  <ellipse cx="40" cy="330" rx="720" ry="335" fill="#042545" fillOpacity="0.06" />
</svg>

      <div className="relative shrink-0" style={{ width: "454px", zIndex: 1 }}>
        <h2
          className="font-inter font-black"
          style={{
            width: "352px",
            fontSize: "48px",
            lineHeight: "80px",
            letterSpacing: "5%",
            color: "#042545",
            textShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          FREQUENTLY ASKED QUESTIONS
        </h2>

        <p
          className="font-krub font-medium mt-[29px]"
          style={{ fontSize: "20px", lineHeight: "30px", color: "#38ABFF", textShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        >
          Everything you need to know about NORTHSAFE
        </p>

        <div className="flex items-center gap-4 mt-[29px]">
          <p className="font-krub font-medium" style={{ fontSize: "20px", lineHeight: "30px", color: "#3E3E3E" }}>
            Still have questions?
          </p>

          <a href="mailto:support@northsafe.ph" className="flex items-center justify-center font-inter font-bold text-white transition-opacity hover:opacity-90" style={{ padding: "12px 28px", borderRadius: "8px", backgroundColor: "#0C1D3A", fontSize: "14px", letterSpacing: "0.02em", boxShadow: "0 2px 4px rgba(0,0,0,0.18)" }}>CONTACT US</a>

        </div>
      </div>

      <div className="relative shrink-0 flex flex-col gap-3 self-start" style={{ width: "595px", zIndex: 1 }}>
        {faqs.map((faq, index) => (
          <FAQItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onClick={() => {
              setOpenIndex(openIndex === index ? null : index);
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default FAQ;