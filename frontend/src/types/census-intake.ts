import { OTHER_VALUE } from "@/constants/census-form-options";

export interface OptionWithOther {
  value: string;
  otherValue: string;
}

export interface CensusMemberInput {
  id: string;
  isHead: boolean;
  name: string;
  phone: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  relation: OptionWithOther;
  education: OptionWithOther;
  job: OptionWithOther;
  churchGroup: string[];
  specialRemark: string;
}

export interface CensusFamilyInput {
  id: string;
  village: OptionWithOther;
  members: CensusMemberInput[];
}

export function createEmptyOption(): OptionWithOther {
  return { value: "", otherValue: "" };
}

export function resolveOptionLabel(option: OptionWithOther): string {
  if (option.value === OTHER_VALUE) return option.otherValue.trim();
  return option.value;
}

export function createEmptyMember(isHead: boolean): CensusMemberInput {
  return {
    id: crypto.randomUUID(),
    isHead,
    name: "",
    phone: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    relation: createEmptyOption(),
    education: createEmptyOption(),
    job: createEmptyOption(),
    churchGroup: [],
    specialRemark: "",
  };
}
