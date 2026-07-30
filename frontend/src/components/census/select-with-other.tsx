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

const CLEAR_VALUE = "__clear__";

export function SelectWithOther({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
  allowClear = false,
  clearLabel = "None",
  error,
}: {
  id: string;
  label: string;
  options: string[];
  value: OptionWithOther;
  onChange: (value: OptionWithOther) => void;
  placeholder?: string;
  required?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
  error?: string;
}) {
  const isOther = value.value === OTHER_VALUE;
  const selectValue = value.value || (allowClear ? CLEAR_VALUE : "");

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>

      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange({
            value: next === CLEAR_VALUE ? "" : next,
            otherValue: next === OTHER_VALUE ? value.otherValue : "",
          })
        }
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowClear ? <SelectItem value={CLEAR_VALUE}>{clearLabel}</SelectItem> : null}
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
