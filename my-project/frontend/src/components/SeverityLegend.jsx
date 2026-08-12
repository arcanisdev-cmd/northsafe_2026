const severities = [
  { label: "Critical", color: "#FF3B30" },
  { label: "High", color: "#FF9500" },
  { label: "Medium", color: "#FFCC00" },
  { label: "Low", color: "#0BA6DF" },
];

function SeverityLegend() {
  return (
    <div className="absolute bottom-20 right-6 bg-white rounded-xl shadow-lg p-4" style={{ width: "160px" }}>
      <p className="font-inter font-semibold text-sm text-black">Severity</p>
      <div className="flex flex-col gap-2 mt-3">
        {severities.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="font-inter text-sm text-gray-700">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeverityLegend;