import { SAFETY_META, type Safety } from "@/lib/foods";

/**
 * 신호등 뱃지.
 *
 * **색만으로 구분하지 않는다.** 색약인 사람에게 초록과 빨강은 잘 갈라지지
 * 않으므로 이모지와 글자를 항상 함께 붙인다.
 */
export default function SafetyBadge({
  safety,
  long = false,
}: {
  safety: Safety;
  long?: boolean;
}) {
  const meta = SAFETY_META[safety];
  return (
    <span className={`safety safety--${safety}`}>
      <span aria-hidden>{meta.emoji}</span>
      {long ? meta.label : meta.short}
    </span>
  );
}
