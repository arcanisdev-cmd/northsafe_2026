import { useEffect, useRef, useState } from "react";

// Placeholder copy — swap in the real Terms of Service / Privacy Policy text
// when it's ready. Structure (headed sections) is kept so the scroll-gating
// behavior below has something realistic to scroll through.
const SECTIONS = [
  {
    heading: "1. Acceptance of Terms",
    body: "By creating a NorthSafe account, you agree to be bound by these Terms and Condition and by our Privacy Policy. If you do not agree with any part of these terms, please do not proceed with registration. [Placeholder — replace with final legal copy.]",
  },
  {
    heading: "2. Use of the Service",
    body: "NorthSafe is provided to help residents of Caloocan City access emergency hotlines, disaster preparedness information, and related community safety tools. You agree to use the service only for its intended purpose and not to misuse, disrupt, or attempt unauthorized access to any part of it. [Placeholder — replace with final legal copy.]",
  },
  {
    heading: "3. Account Responsibilities",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately if you suspect unauthorized use of your account. [Placeholder — replace with final legal copy.]",
  },
  {
    heading: "4. Information We Collect",
    body: "We collect the information you provide during signup — including your name, contact details, and barangay — to verify your identity and to route emergency-related features correctly. [Placeholder — replace with final legal copy.]",
  },
  {
    heading: "5. How We Use Your Information",
    body: "Your information is used to operate and improve NorthSafe, to contact you regarding your account or safety alerts relevant to your area, and to comply with applicable law. We do not sell your personal information. [Placeholder — replace with final legal copy.]",
  },
  {
    heading: "6. Data Retention & Security",
    body: "We retain your data only as long as necessary to provide the service and take reasonable technical and organizational measures to protect it against unauthorized access, alteration, or loss. [Placeholder — replace with final legal copy.]",
  },
  {
    heading: "7. Changes to These Terms",
    body: "We may update these Terms and Condition or Privacy Policy from time to time. Continued use of NorthSafe after changes take effect constitutes acceptance of the revised terms. [Placeholder — replace with final legal copy.]",
  },
  {
    heading: "8. Contact",
    body: "If you have questions about these terms or how your data is handled, contact the NorthSafe team through the channels listed on our homepage. [Placeholder — replace with final legal copy.]",
  },
];

const SCROLL_END_THRESHOLD_PX = 8;

function TermsModal({ isOpen, onClose, onAgree }) {
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [checked, setChecked] = useState(false);
  const scrollRef = useRef(null);

  // Reset gating state every time the modal is (re)opened, so a previous
  // agreement session doesn't carry over.
  useEffect(() => {
    if (isOpen) {
      setHasReachedBottom(false);
      setChecked(false);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const reachedBottom = scrollHeight - scrollTop - clientHeight <= SCROLL_END_THRESHOLD_PX;
    if (reachedBottom && !hasReachedBottom) setHasReachedBottom(true);
  }

  function handleCheckboxChange(e) {
    if (!hasReachedBottom) return;
    setChecked(e.target.checked);
  }

  function handleAgree() {
    if (!hasReachedBottom || !checked) return;
    onAgree();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      // Intentionally no onClick handler here — clicking the backdrop
      // must NOT close the modal, per product requirement.
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-heading"
        className="w-full max-w-lg bg-white rounded-xl shadow-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 id="terms-modal-heading" className="font-inter font-bold text-lg text-[#081435]">
            Terms and Condition &amp; Privacy Policy
          </h2>
          <p className="font-inter text-xs text-gray-500 mt-1">
            Please read the full terms below. You can check the box once you've reached the end.
          </p>
        </div>

        {/* Scrollable body — this is what gates the checkbox */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="px-6 py-4 overflow-y-auto flex-1 space-y-4"
        >
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h3 className="font-inter font-semibold text-sm text-[#1C1C1C] mb-1">
                {section.heading}
              </h3>
              <p className="font-inter text-sm text-gray-600 leading-relaxed">{section.body}</p>
            </div>
          ))}
          <p className="font-inter text-xs text-gray-400 text-center pt-2 pb-1">
            — End of document —
          </p>
        </div>

        {/* Footer: gated checkbox + actions */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <label
            className={
              "flex items-start gap-2 text-xs font-inter select-none " +
              (hasReachedBottom ? "text-[#1C1C1C] cursor-pointer" : "text-gray-400 cursor-not-allowed")
            }
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={!hasReachedBottom}
              onChange={handleCheckboxChange}
              className="w-4 h-4 mt-0.5 disabled:cursor-not-allowed"
            />
            <span>
              {hasReachedBottom
                ? "I have read and agree to the Terms and Condition and Privacy Policy."
                : "Scroll to the end of the document to enable this checkbox."}
            </span>
          </label>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg flex items-center justify-center font-inter font-bold text-sm"
              style={{ backgroundColor: "#E5E7EB", color: "#4B5563" }}
            >
              BACK
            </button>
            <button
              type="button"
              onClick={handleAgree}
              disabled={!hasReachedBottom || !checked}
              className="flex-1 h-11 rounded-lg text-white font-inter font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#081435" }}
            >
              I AGREE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;