import { OTHER_VALUE } from "@/constants/census-form-options";
import type { OptionWithOther } from "@/types/census-intake";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectWithOther({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
  error,
}: {
  id: string;
  label: string;
  options: string[];
  value: OptionWithOther;
  onChange: (value: OptionWithOther) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  const isOther = value.value === OTHER_VALUE;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>

      <Select
        value={value.value}
        onValueChange={(next) =>
          onChange({ value: next, otherValue: next === OTHER_VALUE ? value.otherValue : "" })
        }
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          <SelectItem value={OTHER_VALUE}>Other</SelectItem>
        </SelectContent>
      </Select>

      {isOther ? (
        <Input
          placeholder="Please specify"
          value={value.otherValue}
          onChange={(event) => onChange({ value: OTHER_VALUE, otherValue: event.target.value })}
        />
      ) : null}

      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
