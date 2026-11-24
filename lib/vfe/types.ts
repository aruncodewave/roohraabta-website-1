export type DropdownOption = {
  id: string;
  label: string;
  value: string;
};

export type CountryCodeOption = {
  label: string;
  value: string;
};

export type RawDropdownOption = {
  id: string;
  label: string;
};

export type LeadDropdowns = {
  heardAboutUs: DropdownOption[];
  relationshipStatus: DropdownOption[];
  gender: DropdownOption[];
  hasChildren: DropdownOption[];
  lookingForSelf: DropdownOption[];
  valueCuratedServices: DropdownOption[];
  previousMatchmaking: DropdownOption[];
};

export type PackageKeyValue = {
  key: string;
  value: string;
};

export type MembershipFee = {
  currency: string;
  membershipFee: number;
  tax: number;
};

export type PackageWebsiteContent = {
  id: string;
  packageId: string;
  packageName: string;
  category: string;
  subheading: string;
  contentLines: string[];
  experienceLines: string[];
  additionalKeyValues: PackageKeyValue[];
  membershipFees: MembershipFee[];
  duration: string;
  sortOrder: number;
  isActive: boolean;
};

export type PackageCategory = "VFE_PRIVE" | "VFE_SELECT";

export type ApiErrorBody = {
  message?: string;
  details?: string[];
  data?: {
    requiresOTPVerification?: boolean;
    mobile?: string;
  };
};
