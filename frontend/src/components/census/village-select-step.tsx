import { useState } from "react";
import { Church } from "lucide-react";
import { OTHER_VALUE, VILLAGE_OPTIONS } from "@/constants/census-form-options";
import type { OptionWithOther } from "@/types/census-intake";
import { SelectWithOther } from "@/components/census/select-with-other";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VillageSelectStep({
  onContinue,
}: {
  onContinue: (village: OptionWithOther) => void;
}) {
  const [village, setVillage] = useState<OptionWithOther>({ value: "", otherValue: "" });
  const [error, setError] = useState<string>();

  const handleContinue = () => {
    const isValid =
      village.value === OTHER_VALUE
        ? village.otherValue.trim().length > 0
        : village.value.length > 0;

    if (!isValid) {
      setError("Please select a village to continue");
      return;
    }

    onContinue(village);
  };

  return (
    <Card className="panel-surface mx-auto max-w-lg rounded-xl">
      <CardHeader className="items-center text-center">
        <span className="parish-gradient mb-2 grid size-12 place-items-center rounded-full text-primary-foreground shadow-md shadow-black/20">
          <Church className="size-6" />
        </span>
        <CardTitle className="text-xl">Parish Census — Village Selection</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select the village you are visiting to begin recording families and members.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <SelectWithOther
          id="village-select"
          label="Village"
          options={VILLAGE_OPTIONS}
          value={village}
          onChange={(next) => {
            setVillage(next);
            setError(undefined);
          }}
          placeholder="Select village"
          required
          error={error}
        />

        <Button type="button" className="w-full" onClick={handleContinue}>
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
