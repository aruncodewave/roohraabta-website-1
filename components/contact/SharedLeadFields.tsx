"use client";

import { useState } from "react";
import type { FieldErrors } from "react-hook-form";
import {
  AgreementCheckbox,
  FieldError,
  messageOf,
  otherOptionValue,
  UnderlineInput,
  UnderlineSelect,
} from "@/components/contact/fields";
import MobileOtpVerifier from "@/components/contact/MobileOtpVerifier";
import TermsPopup from "@/components/contact/TermsPopup";
import type { CountryCodeOption, DropdownOption } from "@/lib/vfe/types";

export const yesNo = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
];

type FieldBindings = {
  register: any;
  setValue: any;
  errors: FieldErrors;
};

type NameFieldsProps = FieldBindings;

export function NameFields({ register, setValue, errors }: NameFieldsProps) {
  return (
    <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
      <UnderlineInput
        label="First Name*"
        name="firstName"
        register={register}
        setValue={setValue}
        lettersOnly
        error={messageOf(errors, "firstName")}
      />
      <UnderlineInput
        label="Last Name*"
        name="lastName"
        register={register}
        setValue={setValue}
        lettersOnly
        error={messageOf(errors, "lastName")}
      />
    </div>
  );
}

type PhoneFieldsProps = FieldBindings & {
  countryCodes: CountryCodeOption[];
  countryCode: string;
  onCountryCode: (value: string) => void;
  phone: string;
  phoneVerified: boolean;
  otpType: string;
};

export function PhoneFields({
  register,
  setValue,
  errors,
  countryCodes,
  countryCode,
  onCountryCode,
  phone,
  phoneVerified,
  otpType,
}: PhoneFieldsProps) {
  const countryOptions: DropdownOption[] = countryCodes.map((item) => ({
    id: item.value,
    value: item.value,
    label: `${item.label} (${item.value})`,
  }));

  const countryCodeError = messageOf(errors, "countryCode");
  const phoneError = messageOf(errors, "phone");

  return (
    <>
      <div className="grid grid-cols-2 items-end gap-x-4 sm:gap-x-8 md:gap-x-12">
        <UnderlineSelect
          label="Country Code*"
          value={countryCode}
          placeholder="Select a country code"
          options={countryOptions}
          error={countryCodeError}
          hideMessage
          onChange={(value) => {
            onCountryCode(value);
            setValue("countryCode", value, { shouldValidate: true });
          }}
        />
        <UnderlineInput
          label="Contact Number*"
          name="phone"
          type="tel"
          inputMode="tel"
          maxLength={15}
          digitsOnly
          setValue={setValue}
          register={register}
          error={phoneError}
          hideMessage
        />
        <div>
          <FieldError message={countryCodeError} />
        </div>
        <div>
          <FieldError message={phoneError} />
        </div>
      </div>
      <MobileOtpVerifier
        countryCode={countryCode}
        phoneNumber={phone}
        type={otpType}
        isVerified={phoneVerified}
        error={messageOf(errors, "phoneOtpVerified")}
        onVerificationChange={(verified) => {
          setValue("phoneOtpVerified", verified, { shouldValidate: true });
        }}
      />
      <UnderlineInput
        label="Email ID*"
        name="email"
        type="email"
        inputMode="email"
        register={register}
        error={messageOf(errors, "email")}
      />
    </>
  );
}

type ClosingFieldsProps = FieldBindings & {
  hearAboutOptions: DropdownOption[];
  hearAboutUs: string;
  onHearAboutUs: (value: string) => void;
  onCaptcha: (token: string) => void;
};

export function ClosingFields({
  register,
  setValue,
  errors,
  hearAboutOptions,
  hearAboutUs,
  onHearAboutUs,
  onCaptcha: _onCaptcha,
}: ClosingFieldsProps) {
  const [termsOpen, setTermsOpen] = useState(false);
  const showOther = hearAboutUs !== "" && hearAboutUs === otherOptionValue(hearAboutOptions);

  return (
    <>
      <UnderlineSelect
        label="How did you hear about us?*"
        value={hearAboutUs}
        placeholder="Select"
        options={hearAboutOptions}
        error={messageOf(errors, "hearAboutUs")}
        onChange={(value) => {
          onHearAboutUs(value);
          const isOther = value !== "" && value === otherOptionValue(hearAboutOptions);
          setValue("hearAboutUs", value, { shouldValidate: true });
          setValue("hearAboutUsIsOther", isOther, { shouldValidate: true });
          if (!isOther) setValue("hearAboutUsOther", "", { shouldValidate: true });
        }}
      />
      {showOther ? (
        <UnderlineInput
          label="Please specify how you heard about us*"
          name="hearAboutUsOther"
          register={register}
          error={messageOf(errors, "hearAboutUsOther")}
        />
      ) : null}
      {/* Captcha is paused. Restore CaptchaField when verification is turned back on.
      <CaptchaField onChange={_onCaptcha} error={messageOf(errors, "recaptcha")} />
      */}
      <div className="space-y-4">
        <AgreementCheckbox id="infoProvidedAccurate" name="infoProvidedAccurate" register={register} error={messageOf(errors, "infoProvidedAccurate")}>
          I agree that information I have provided here is true and accurate*
        </AgreementCheckbox>
        <AgreementCheckbox
          id="termsPrivacy"
          name="termsPrivacy"
          register={register}
          error={messageOf(errors, "termsPrivacy")}
          beforeCheck={() => {
            setValue("termsPrivacy", false, { shouldValidate: false });
            setTermsOpen(true);
            return false;
          }}
        >
          I am in full agreement with the{" "}
          <a href="/terms-conditions" target="_blank" rel="noopener noreferrer" className="underline" onClick={(event) => event.stopPropagation()}>
            terms & conditions
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline" onClick={(event) => event.stopPropagation()}>
            privacy policy
          </a>
          *
        </AgreementCheckbox>
      </div>
      <TermsPopup
        open={termsOpen}
        onClose={() => {
          setValue("termsPrivacy", false, { shouldValidate: true });
          setTermsOpen(false);
        }}
        onAgree={() => {
          setValue("termsPrivacy", true, { shouldValidate: true });
          setTermsOpen(false);
        }}
      />
    </>
  );
}
