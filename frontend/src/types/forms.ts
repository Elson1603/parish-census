import { z } from "zod";

const mobileRegex = /^[6-9]\d{9}$/;

export const familyFormSchema = z.object({
  villageId: z.string().min(1, "Village is required"),
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

// Shared by both Add Member and Edit Member - both now mirror the census intake
// wizard's fields/requirements exactly (Name/Gender/DOB required; Phone, Marital
// Status, Education, Job, and Church Group all optional).
export const memberFormSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),
  age: z.number().min(0),
  photoUrl: z.string().optional(),
  mobile: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Invalid email"),
  baptized: z.boolean(),
  firstCommunion: z.boolean(),
  confirmation: z.boolean(),
  churchMarriage: z.boolean(),
  villageId: z.string().min(1, "Village is required"),
  familyId: z.string().min(1, "Family is required"),
  relationshipWithHead: z.string().min(1, "Relationship is required"),
  maritalStatus: z.string().optional().or(z.literal("")),
  education: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
  churchGroup: z.string().optional().or(z.literal("")),
  remarks: z.string().optional().or(z.literal("")),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;
