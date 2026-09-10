import { useRef, useState } from "react";
import { Camera } from "lucide-react";

export default function ProfilePictureUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value ?? null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file, url);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-28 w-28 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
        {preview ? (
          <img src={preview} alt="Profile preview" className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full p-6 text-gray-300">
            <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12Zm0 2.2c-3.3 0-9.8 1.6-9.8 4.9v2.7h19.6v-2.7c0-3.3-6.5-4.9-9.8-4.9Z" />
          </svg>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 text-sm font-medium text-[#1B2A56] hover:underline"
      >
        <Camera size={16} />
        Choose Profile Picture
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}