import { Flame, Waves, Construction, TreePine, Zap, Building2, Trash2, HelpCircle } from "lucide-react";

const categories = [
  { id: "fire", label: "Fire", icon: Flame, color: "#FF3B30" },
  { id: "flood", label: "Flood", icon: Waves, color: "#0BA6DF" },
  { id: "road_damage", label: "Road Damage", icon: Construction, color: "#F29D38" },
  { id: "fallen_tree", label: "Fallen Tree", icon: TreePine, color: "#22A559" },
  { id: "power_line", label: "Power Line", icon: Zap, color: "#FFB800" },
  { id: "building_damage", label: "Building Damage", icon: Building2, color: "#8C5AE8" },
  { id: "illegal_dumping", label: "Illegal Dumping", icon: Trash2, color: "#767676" },
  { id: "others", label: "Others", icon: HelpCircle, color: "#46B5FF" },
];

function HazardCategoryPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((cat) => {
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-[10px] transition-all duration-150 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              width: "86px",
              height: "57px",
              backgroundColor: isSelected ? "#EAF6FF" : "#FFFFFF",
              border: `1px solid ${isSelected ? "#0BA6DF" : "#D8D8D8"}`,
            }}
          >
            <cat.icon size={16} style={{ color: cat.color }} />
            <span
              className="font-inter text-[10px] font-medium"
              style={{ color: isSelected ? "#0BA6DF" : "#4A4A4A" }}
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default HazardCategoryPicker;