import { useState } from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function MultiSelectWithOther({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Select options",
  error,
}: {
  id: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
}) {
  const [otherText, setOtherText] = useState("");

  const toggle = (option: string) => {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  };

  const remove = (option: string) => {
    onChange(value.filter((item) => item !== option));
  };

  const addOther = () => {
    const trimmed = otherText.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setOtherText("");
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal"
          >
            <span
              className={cn("truncate text-left", value.length === 0 && "text-muted-foreground")}
            >
              {value.length > 0 ? `${value.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="max-h-56 overflow-y-auto p-1">
            {options.map((option) => {
              const checked = value.includes(option);
              return (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggle(option)} />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
          <div className="border-t border-border p-2">
            <div className="flex gap-1.5">
              <Input
                value={otherText}
                onChange={(event) => setOtherText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addOther();
                  }
                }}
                placeholder="Add other..."
                className="h-8 text-sm"
              />
              <Button type="button" size="sm" className="h-8" onClick={addOther}>
                Add
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 pr-1">
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                className="rounded-full p-0.5 hover:bg-black/10"
                aria-label={`Remove ${item}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
