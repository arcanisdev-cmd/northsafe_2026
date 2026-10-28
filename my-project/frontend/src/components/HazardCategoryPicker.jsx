
import {
  Flame,
  Waves,
  Construction,
  TreePine,
  Zap,
  Building2,
  Trash2,
  HelpCircle,
} from "lucide-react";

const categories = [
  { id: "fire", label: "Fire", icon: Flame, color: "#FF3B30" },
  { id: "flood", label: "Flood", icon: Waves, color: "#0BA6DF" },
  {
    id: "road_damage",
    label: "Road Damage",
    icon: Construction,
    color: "#F29D38",
  },
  {
    id: "fallen_tree",
    label: "Fallen Tree",
    icon: TreePine,
    color: "#22A559",
  },
  { id: "power_line", label: "Power Line", icon: Zap, color: "#FFB800" },
  {
    id: "building_damage",
    label: "Building Damage",
    icon: Building2,
    color: "#8C5AE8",
  },
  {
    id: "illegal_dumping",
    label: "Illegal Dumping",
    icon: Trash2,
    color: "#767676",
  },
  { id: "others", label: "Others", icon: HelpCircle, color: "#46B5FF" },
];

function HazardCategoryPicker({ selected, onSelect }) {
  return (
    <div className="grid w-full min-w-0 grid-cols-4 gap-2">
      {categories.map((cat) => {
        const isSelected = selected === cat.id;
        const Icon = cat.icon;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            aria-pressed={isSelected}
            className="
              flex h-[58px] min-w-0 w-full flex-col
              items-center justify-center gap-1
              rounded-[10px] border
              transition-colors duration-150
              hover:bg-sky-50
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-sky-500
              focus-visible:ring-offset-1
              active:scale-[0.98]
            "
            style={{
              backgroundColor: isSelected ? "#EAF6FF" : "#FFFFFF",
              borderColor: isSelected ? "#0BA6DF" : "#D8DDE5",
            }}
          >
            <Icon
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
              style={{ color: cat.color }}
            />

            <span
              className="w-full truncate px-0.5 font-inter text-[10px] font-medium leading-tight text-center"
              style={{
                color: isSelected ? "#087EAA" : "#4A4A4A",
              }}
              title={cat.label}
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
