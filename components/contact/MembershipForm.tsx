"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "react-toastify";
import { ChoiceField, DateField, SubmitButton, UnderlineInput, UnderlineSelect, messageOf } from "@/components/contact/fields";
import { LEAD_STORAGE_KEY, MEMBERSHIP_STORAGE_KEY, firstQueryValue, restoreExpiredMobile, showLeadErrorToast } from "@/components/contact/leadForm";
import { membershipSchema, type MembershipFormValues } from "@/components/contact/schema";
import { ClosingFields, NameFields, PhoneFields } from "@/components/contact/SharedLeadFields";
import { captureLead, findIdFromRadioValue, resolveSelectWithOther } from "@/lib/vfe/api";
import { PLATFORM_ID } from "@/lib/vfe/config";
import type { CountryCodeOption, LeadDropdowns } from "@/lib/vfe/types";

type MembershipFormProps = {
  countryCodes: CountryCodeOption[];
  dropdowns: LeadDropdowns;
};

export default function MembershipForm({ countryCodes, dropdowns }: MembershipFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countryCode, setCountryCode] = useState("");
  const [hearAboutUs, setHearAboutUs] = useState("");
  const [relationShipStatus, setRelationShipStatus] = useState("");
  const [haveChildren, setHaveChildren] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MembershipFormValues>({
    resolver: yupResolver(membershipSchema) as Resolver<MembershipFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "",
      phone: "",
      gender: "MALE",
      phoneOtpVerified: false,
      hearAboutUsIsOther: false,
      hearAboutUsOther: "",
      infoProvidedAccurate: false,
      termsPrivacy: false,
      recaptcha: "",
      relationShipStatus: "",
      haveChildren: "",
      DOB: "",
    },
  });

  const phone = useWatch({ control, name: "phone" }) ?? "";
  const phoneVerified = useWatch({ control, name: "phoneOtpVerified" }) === true;

  const onSubmit = async (data: MembershipFormValues) => {
    try {
      // Captcha is paused. Restore this check when verification is turned back on.
      // await verifyCaptcha(data.recaptcha);
      const country = countryCodes.find((option) => option.value === data.countryCode)?.label ?? "";
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        date_of_birth: data.DOB,
        gender: findIdFromRadioValue(dropdowns.gender, data.gender),
        email_id: data.email,
        country_code: data.countryCode,
        phone_number: data.phone,
        country,
        relationship_status: data.relationShipStatus,
        has_children: data.haveChildren,
        heard_about_us: resolveSelectWithOther(dropdowns.heardAboutUs, data.hearAboutUs, data.hearAboutUsOther ?? ""),
        utm_source: firstQueryValue(searchParams.get("utm_source")) || "APPLY_FOR_MEMBERSHIP_FORM",
        utm_medium: firstQueryValue(searchParams.get("utm_medium")) || "NA",
        utm_campaign: firstQueryValue(searchParams.get("utm_campaign")) || "NA",
        utm_term: firstQueryValue(searchParams.get("utm_term")) || "NA",
        utm_content: firstQueryValue(searchParams.get("utm_content")) || "NA",
        lead_source: "APPLY_FOR_MEMBERSHIP_FORM",
        platform_id: PLATFORM_ID,
      };

      const response = await captureLead(payload);
      localStorage.setItem(
        MEMBERSHIP_STORAGE_KEY,
        JSON.stringify({ ...payload, phoneOtpVerified: data.phoneOtpVerified }),
      );
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(response.data ?? {}));
      router.push("/packages");
    } catch (error) {
      const expired = restoreExpiredMobile(error, countryCodes, setValue);
      if (expired) {
        setCountryCode(expired.countryCode);
        toast.info(expired.message);
        return;
      }
      showLeadErrorToast(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-4xl flex-col gap-12"
      noValidate
    >
      <h2 className="form-section text-center text-[#762323]">
        <span className="inline-block border-b border-[#762323] pb-2">Membership Application</span>
      </h2>
      <NameFields register={register} setValue={setValue} errors={errors} />
      <div className="relative z-20 grid items-start gap-x-12 gap-y-10 md:grid-cols-2">
        <ChoiceField
          compact
          align="start"
          question="Gender*"
          name="gender"
          register={register}
          divided={false}
          options={[
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
          ]}
          error={errors.gender?.message}
        />
        <DateField label="Date of Birth*" name="DOB" control={control} error={messageOf(errors, "DOB")} />
      </div>
      <PhoneFields
        register={register}
        setValue={setValue}
        errors={errors}
        countryCodes={countryCodes}
        countryCode={countryCode}
        onCountryCode={setCountryCode}
        phone={phone}
        phoneVerified={phoneVerified}
        otpType="apply_for_membership"
      />
      <UnderlineSelect
        variant="question"
        label="What best describes your current relationship status?*"
        value={relationShipStatus}
        placeholder="Select"
        options={dropdowns.relationshipStatus.map((option) => ({
          ...option,
          label: option.label.split(" (")[0],
        }))}
        error={messageOf(errors, "relationShipStatus")}
        onChange={(value) => {
          setRelationShipStatus(value);
          setValue("relationShipStatus", value, { shouldValidate: true });
        }}
      />
      <UnderlineSelect
        variant="question"
        label="Do you have children?*"
        value={haveChildren}
        placeholder="Select"
        options={dropdowns.hasChildren}
        error={messageOf(errors, "haveChildren")}
        onChange={(value) => {
          setHaveChildren(value);
          setValue("haveChildren", value, { shouldValidate: true });
        }}
      />
      <ClosingFields
        register={register}
        setValue={setValue}
        errors={errors}
        hearAboutOptions={dropdowns.heardAboutUs}
        hearAboutUs={hearAboutUs}
        onHearAboutUs={setHearAboutUs}
        onCaptcha={(token) => setValue("recaptcha", token, { shouldValidate: true })}
      />
      <SubmitButton pending={isSubmitting} />
    </form>
  );
}
