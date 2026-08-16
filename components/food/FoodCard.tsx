import { foodPath, SAFETY_META, type Food } from "@/lib/foods";

export default function FoodCard({ food }: { food: Food }) {
  const meta = SAFETY_META[food.safety];
  return (
    <a target="_self" href={foodPath(food)} className="food-card">
      <span className="food-card__emoji" aria-hidden>
        {food.emoji ?? "🍽️"}
      </span>
      <span className="food-card__body">
        <span className="food-card__name">{food.name}</span>
        <span className={`food-card__note food-card__note--${food.safety}`}>
          {meta.emoji} {meta.label}
        </span>
      </span>
    </a>
  );
}
