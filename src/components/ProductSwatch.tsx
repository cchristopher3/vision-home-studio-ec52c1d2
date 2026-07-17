import { Check, Info } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatMoney } from "@/lib/catalog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ProductSwatch({
  product,
  selected,
  onSelect,
}: {
  product: Product;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`group relative rounded-xl border transition ${
        selected ? "border-foreground shadow-sm" : "border-border hover:border-foreground/40"
      } bg-card overflow-hidden`}
    >
      <button onClick={onSelect} className="block w-full text-left">
        <div
          className="relative aspect-[5/4] w-full"
          style={{ background: product.swatch }}
        >
          {selected && (
            <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-background/95 text-foreground">
              <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
          )}
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
              product.included
                ? "bg-background/90 text-muted-foreground"
                : "bg-foreground text-background"
            }`}
          >
            {product.included ? "Included" : "Upgrade"}
          </span>
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{product.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">{product.manufacturer} · {product.finish}</div>
            </div>
            <div className="text-right text-sm shrink-0">
              {product.included ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                <span className="text-foreground">+{formatMoney(product.price)}</span>
              )}
            </div>
          </div>
        </div>
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-foreground"
            aria-label="Product details"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-64 text-xs">
          <div className="font-medium text-sm">{product.name}</div>
          <div className="text-muted-foreground mt-1">{product.manufacturer}</div>
          <div className="mt-2 grid grid-cols-2 gap-y-1 text-[11px]">
            <div className="text-muted-foreground">Finish</div><div>{product.finish}</div>
            <div className="text-muted-foreground">Price</div><div>{product.included ? "Included" : `+${formatMoney(product.price)}`}</div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Illustrative representation. Actual color and material may vary slightly from installed product.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
