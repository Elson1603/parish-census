import { z } from "zod";

const mobileRegex = /^[6-9]\d{9}$/;

export const familyFormSchema = z.object({
  villageId: z.string().min(1, "Village is required"),
  houseNumber: z.string().min(1, "House number is required"),
  headOfFamily: z.string().min(2, "Head of family is required"),
  primaryMobile: z.string().regex(mobileRegex, "Enter a valid 10-digit mobile number"),
  alternateMobile: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || mobileRegex.test(value), "Alternate mobile is invalid"),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Invalid email"),
  address: z.string().min(5, "Address is required"),
  remarks: z.string().optional().or(z.literal("")),
});

export type FamilyFormValues = z.infer<typeof familyFormSchema>;

export const memberFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),
  age: z.number().min(0),
  photoUrl: z.string().optional(),
  bloodGroup: z.string().min(1, "Blood group is required"),
  mobile: z.string().regex(mobileRegex, "Enter a valid 10-digit mobile number"),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Invalid email"),
  occupation: z.string().min(1, "Occupation is required"),
  education: z.string().min(1, "Education is required"),
  baptized: z.boolean(),
  firstCommunion: z.boolean(),
  confirmation: z.boolean(),
  churchMarriage: z.boolean(),
  churchGroup: z.string().min(1, "Church group is required"),
  villageId: z.string().min(1, "Village is required"),
  familyId: z.string().min(1, "Family is required"),
  houseNumber: z.string().min(1, "House number is required"),
  relationshipWithHead: z.string().min(1, "Relationship is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  specialNeeds: z.string().optional().or(z.literal("")),
  remarks: z.string().optional().or(z.literal("")),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;
