function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="flex items-center gap-3 bg-white rounded-2xl px-5"
      style={{ width: "314px", height: "78px", border: "0.25px solid #979797" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: color }}
      >
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="font-inter text-sm" style={{ color: "#434343" }}>{label}</p>
        <p className="font-inter font-bold text-2xl" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

export default StatCard;