import { useState, useRef } from "react";
import { UploadCloud, X } from "lucide-react";

function PhotoDropzone({ file, onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) onFileSelect(droppedFile);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center text-center cursor-pointer rounded-[10px] transition-colors duration-200"
      style={{
        width: "382px",
        height: "381px",
        border: `1px dashed ${isDragging ? "#0BA6DF" : "#545454"}`,
        backgroundColor: isDragging ? "#F0F9FF" : "#FFFFFF",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />

      {previewUrl ? (
        <div className="relative w-full h-full p-2">
          <img src={previewUrl} alt="Hazard preview" className="w-full h-full object-cover rounded-lg" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      ) : (
        <>
          <UploadCloud size={40} className="text-gray-400" />
          <p className="font-inter font-semibold text-sm text-gray-700 mt-3">
            Drag an image here or upload a file
          </p>
          <p className="font-inter text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
          <p className="font-inter text-xs text-gray-400">On mobile? Tap to use camera</p>
        </>
      )}
    </div>
  );
}

export default PhotoDropzone;