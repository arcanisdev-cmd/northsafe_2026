import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// North Caloocan's numbered barangay range for this district.
const BARANGAYS = Array.from({ length: 188 - 165 + 1 }, (_, i) => `Barangay ${165 + i}`);

function BarangaySelect({ value, onChange, onBlur, error, touched }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const filtered = BARANGAYS.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        onBlur();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor="barangay" className="font-inter text-[13px] font-medium text-[#1C1C1C]">
        Barangay <span className="text-[#D30004]">*</span>
      </label>

      <button
        type="button"
        id="barangay"
        onClick={() => setIsOpen(!isOpen)}
        aria-invalid={touched && !!error}
        aria-describedby={error ? "barangay-error" : undefined}
        className={`w-full h-11 mt-1 px-4 border rounded-[5px] text-[15px] text-left flex items-center justify-between ${
          touched && error ? "border-[#D30004]" : "border-gray-300"
        }`}
      >
        <span className={value ? "text-[#1C1C1C]" : "text-gray-400"}>
          {value || "Select Your Barangay"}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search barangay..."
            className="w-full px-4 py-2 text-[15px] border-b border-gray-100 focus:outline-none"
          />
          {filtered.length === 0 && (
            <p className="px-4 py-2 text-[15px] text-gray-400">No matches found</p>
          )}
          {filtered.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => {
                onChange(b);
                setIsOpen(false);
                setSearch("");
                onBlur();
              }}
              className="w-full text-left px-4 py-2 text-[15px] hover:bg-gray-50"
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {touched && error && (
        <p id="barangay-error" className="font-inter text-[11px] text-[#D30004] mt-1 min-h-[16px]">
          {error}
        </p>
      )}
    </div>
  );
}

export default BarangaySelect;