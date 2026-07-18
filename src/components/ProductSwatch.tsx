import { Check, Eye, Info, Lock } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatMoney } from "@/lib/catalog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ProductSwatch({
  product,
  selected,
  disabled,
  disabledReason,
  onSelect,
}: {
  product: Product;
  selected: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onSelect: () => void;
}) {
  const priceLabel = product.included
    ? "Included"
    : product.status === "optional"
    ? "Optional"
    : "Upgrade";
  return (
    <div
      className={`group relative rounded-xl border transition ${
        selected
          ? "border-foreground shadow-sm"
          : disabled
          ? "border-border opacity-60"
          : "border-border hover:border-foreground/40"
      } bg-card overflow-hidden`}
    >
      <button
        onClick={onSelect}
        disabled={disabled}
        className="block w-full text-left disabled:cursor-not-allowed"
      >
        <div
          className="relative aspect-[5/4] w-full"
          style={{ background: product.swatch }}
        >
          {selected && (
            <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-background/95 text-foreground">
              <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
          )}
          {disabled && (
            <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-background/95 text-muted-foreground">
              <Lock className="h-3 w-3" />
            </span>
          )}
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
              product.included
                ? "bg-background/90 text-muted-foreground"
                : product.status === "optional"
                ? "bg-secondary text-foreground"
                : "bg-foreground text-background"
            }`}
          >
            {priceLabel}
          </span>
          {(product.textureImageUrl || product.overlayImageUrl) && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur">
              <Eye className="h-3 w-3" /> Preview ready
            </span>
          )}
        </div>
        <div className="p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-foreground">{product.name}</div>
            </div>
            <div className="text-right text-[12px] shrink-0">
              {product.included ? (
                <span className="text-muted-foreground">Included</span>
              ) : (
                <span className="text-foreground">+{formatMoney(product.price)}</span>
              )}
            </div>
          </div>
          {(product.restrictions || disabledReason) && (
            <div className="mt-1.5 rounded-md bg-secondary/60 px-2 py-1 text-[10px] text-muted-foreground line-clamp-2">
              {disabledReason ?? product.restrictions}
            </div>
          )}
        </div>
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-background/95 text-muted-foreground shadow-sm transition hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Product details"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-72 text-xs">
          <div className="font-medium text-sm">{product.name}</div>
          <div className="text-muted-foreground mt-1">{product.manufacturer}</div>
          <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
            {product.code && (<><div className="text-muted-foreground">Code</div><div>{product.code}</div></>)}
            {product.configuration && (<><div className="text-muted-foreground">Config</div><div>{product.configuration}</div></>)}
            <div className="text-muted-foreground">Finish</div><div>{product.finish}</div>
            <div className="text-muted-foreground">Status</div><div className="capitalize">{product.status}</div>
            <div className="text-muted-foreground">Price</div>
            <div>{product.included ? "Included" : `+${formatMoney(product.price)}`}</div>
            {product.effectiveDate && (<><div className="text-muted-foreground">Effective</div><div>{product.effectiveDate}</div></>)}
          </div>
          {product.builderNotes && (
            <div className="mt-3 rounded-md border border-border bg-secondary/50 p-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Builder notes</div>
              <div className="text-[11px] leading-relaxed">{product.builderNotes}</div>
            </div>
          )}
          <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
            Illustrative representation. Availability must be confirmed by builder. Actual color and material may vary.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
