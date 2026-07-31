import * as React from "react";
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
  // Tracks whether "Other" is the active selection in the UI, independent of
  // `value.value`. We can't rely on value.value === OTHER_VALUE alone: once the
  // user picks "Other" but hasn't typed anything yet, resolveOptionLabel()
  // turns that into "", which round-trips back through toOption() as
  // { value: "", otherValue: "" } — indistinguishable from "nothing selected".
  // That collapse would otherwise make the input disappear the instant it appears.
  const [otherActive, setOtherActive] = React.useState(value.value === OTHER_VALUE);

  React.useEffect(() => {
    if (value.value === OTHER_VALUE) {
      setOtherActive(true);
    } else if (value.value !== "") {
      // A concrete option came in from outside (e.g. form reset) — leave Other mode.
      setOtherActive(false);
    }
    // If value.value === "", don't touch otherActive: it may just be the
    // transient "Other selected, not typed yet" state described above.
  }, [value.value]);

  const selectValue = otherActive
    ? OTHER_VALUE
    : value.value || (allowClear ? CLEAR_VALUE : "");

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>

      <Select
        value={selectValue}
        onValueChange={(next) => {
          if (next === OTHER_VALUE) {
            setOtherActive(true);
            onChange({ value: OTHER_VALUE, otherValue: value.otherValue });
          } else if (next === CLEAR_VALUE) {
            setOtherActive(false);
            onChange({ value: "", otherValue: "" });
          } else {
            setOtherActive(false);
            onChange({ value: next, otherValue: "" });
          }
        }}
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

      {otherActive ? (
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