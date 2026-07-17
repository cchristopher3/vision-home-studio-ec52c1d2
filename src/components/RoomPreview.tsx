import kitchenClassic from "@/assets/kitchen-classic.jpg";
import kitchenMoody from "@/assets/kitchen-moody.jpg";
import bathClassic from "@/assets/bath-classic.jpg";
import bathMoody from "@/assets/bath-moody.jpg";
import { dominantTone, productById, type Room } from "@/lib/catalog";

export function roomImage(room: Room, selections: Record<string, string>) {
  const tone = dominantTone(room, selections);
  if (room === "kitchen") return tone === "dark" ? kitchenMoody : kitchenClassic;
  return tone === "dark" ? bathMoody : bathClassic;
}

export function RoomPreview({
  room,
  selections,
  className = "",
}: {
  room: Room;
  selections: Record<string, string>;
  className?: string;
}) {
  const img = roomImage(room, selections);
  const paintKey = "wallPaint";
  const paint = productById(selections[paintKey]);
  const accent =
    room === "kitchen"
      ? productById(selections["faucet"])
      : productById(selections["faucets"]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-muted ${className}`}>
      <img
        src={img}
        alt={`${room} preview`}
        className="h-full w-full object-cover transition-all duration-700"
        width={1600}
        height={1000}
      />
      {/* subtle paint wash overlay */}
      {paint?.swatch && (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-15 transition-opacity duration-500"
          style={{ background: paint.swatch }}
        />
      )}
      {/* accent metal wash */}
      {accent?.swatch && (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-10"
          style={{ background: accent.swatch }}
        />
      )}
      <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
        Illustrative preview
      </div>
    </div>
  );
}
