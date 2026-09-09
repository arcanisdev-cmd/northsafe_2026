function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="flex items-center gap-4 bg-white rounded-2xl px-6 py-5 flex-1"
      style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.06)" }}
    >
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: color }}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-[13px] text-gray-500 font-medium">{label}</p>
        <p className="text-[22px] font-bold leading-tight" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default StatCard;