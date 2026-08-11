import { useState } from "react";

function TermsModal({ isOpen, onClose, onAgree }) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToEnd(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[80vh] flex flex-col">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="font-inter font-bold text-xl text-[#042545]">
            Terms and Conditions
          </h2>
        </div>

        <div
          onScroll={handleScroll}
          className="px-8 py-6 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-4"
        >
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
          </p>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae
            vitae dicta sunt explicabo.
          </p>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
            aut fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt.
          </p>
          <p>
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
            consectetur, adipisci velit, sed quia non numquam eius modi
            tempora incidunt ut labore et dolore magnam aliquam quaerat
            voluptatem.
          </p>
        </div>

        <div className="px-8 py-6 border-t border-gray-200 flex items-center justify-between gap-4">
          {!hasScrolledToEnd && (
            <p className="text-xs text-gray-400">Scroll to the bottom to continue</p>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-10 rounded-lg border border-gray-300 text-sm font-medium text-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAgree}
              disabled={!hasScrolledToEnd}
              className="px-5 h-10 rounded-lg bg-navy text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;