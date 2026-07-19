function StepCircle({ icon: Icon }) {
  return (
    <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center bg-white shrink-0">
      <Icon size={28} className="text-navy" />
    </div>
  );
}

export default StepCircle;