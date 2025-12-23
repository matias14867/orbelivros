import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  currentMin: number;
  currentMax: number;
  onPriceChange: (min: number, max: number) => void;
}

export const PriceFilter = ({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  onPriceChange,
}: PriceFilterProps) => {
  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);

  useEffect(() => {
    setLocalMin(currentMin);
    setLocalMax(currentMax);
  }, [currentMin, currentMax]);

  const handleSliderChange = (values: number[]) => {
    setLocalMin(values[0]);
    setLocalMax(values[1]);
  };

  const handleSliderCommit = (values: number[]) => {
    onPriceChange(values[0], values[1]);
  };

  const handleMinChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setLocalMin(Math.max(minPrice, Math.min(num, localMax)));
  };

  const handleMaxChange = (value: string) => {
    const num = parseFloat(value) || maxPrice;
    setLocalMax(Math.max(localMin, Math.min(num, maxPrice)));
  };

  const handleApply = () => {
    onPriceChange(localMin, localMax);
  };

  const handleReset = () => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
    onPriceChange(minPrice, maxPrice);
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <Label className="text-sm font-medium">Faixa de Preço</Label>
      
      <Slider
        value={[localMin, localMax]}
        min={minPrice}
        max={maxPrice}
        step={1}
        onValueChange={handleSliderChange}
        onValueCommit={handleSliderCommit}
        className="my-4"
      />

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
            Mínimo
          </Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              R$
            </span>
            <Input
              id="minPrice"
              type="number"
              value={localMin.toFixed(0)}
              onChange={(e) => handleMinChange(e.target.value)}
              onBlur={handleApply}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        <span className="text-muted-foreground mt-5">—</span>
        <div className="flex-1">
          <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
            Máximo
          </Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              R$
            </span>
            <Input
              id="maxPrice"
              type="number"
              value={localMax.toFixed(0)}
              onChange={(e) => handleMaxChange(e.target.value)}
              onBlur={handleApply}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
          Limpar
        </Button>
        <Button size="sm" onClick={handleApply} className="flex-1">
          Aplicar
        </Button>
      </div>
    </div>
  );
};
