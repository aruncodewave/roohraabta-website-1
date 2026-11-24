"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "react-toastify";
import { ChoiceField, SubmitButton } from "@/components/contact/fields";
import { EXPLORATORY_STORAGE_KEY, EXPLORATORY_TRACKING_KEY, firstQueryValue, restoreExpiredMobile, showLeadErrorToast } from "@/components/contact/leadForm";
import { exploratorySchema, type ExploratoryFormValues } from "@/components/contact/schema";
import { ClosingFields, NameFields, PhoneFields, yesNo } from "@/components/contact/SharedLeadFields";
import { captureLead, findIdFromRadioValue, resolveSelectWithOther } from "@/lib/vfe/api";
import { PLATFORM_NAME } from "@/lib/vfe/config";
import type { CountryCodeOption, LeadDropdowns } from "@/lib/vfe/types";

type ExploratoryFormProps = {
  countryCodes: CountryCodeOption[];
  dropdowns: LeadDropdowns;
};

export default function ExploratoryForm({ countryCodes, dropdowns }: ExploratoryFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countryCode, setCountryCode] = useState("");
  const [hearAboutUs, setHearAboutUs] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ExploratoryFormValues>({
    resolver: yupResolver(exploratorySchema) as Resolver<ExploratoryFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "",
      phone: "",
      phoneOtpVerified: false,
      hearAboutUsIsOther: false,
      hearAboutUsOther: "",
      infoProvidedAccurate: false,
      termsPrivacy: false,
      recaptcha: "",
      lookingForSelf: "",
      highTouchServicesFit: "",
      usedOtherPaidService: "",
    },
  });

  const phone = useWatch({ control, name: "phone" }) ?? "";
  const phoneVerified = useWatch({ control, name: "phoneOtpVerified" }) === true;

  const tracking = () => {
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem(EXPLORATORY_TRACKING_KEY) || "{}") as Record<string, string>;
      } catch {
        return {};
      }
    })();

    const nextTracking = {
      utmSource: firstQueryValue(searchParams.get("gad_source"), searchParams.get("utm_source"), stored.utmSource),
      utmMedium: firstQueryValue(searchParams.get("gbraid"), searchParams.get("utm_medium"), stored.utmMedium),
      utmCampaign: firstQueryValue(searchParams.get("gad_campaignid"), searchParams.get("utm_campaign"), stored.utmCampaign),
      utmTerm: firstQueryValue(searchParams.get("gclid"), searchParams.get("utm_term"), stored.utmTerm),
      utmContent: firstQueryValue(searchParams.get("utm_content"), stored.utmContent),
    };

    localStorage.setItem(EXPLORATORY_TRACKING_KEY, JSON.stringify(nextTracking));
    return nextTracking;
  };

  const onSubmit = async (data: ExploratoryFormValues) => {
    try {
      // Captcha is paused. Restore this check when verification is turned back on.
      // await verifyCaptcha(data.recaptcha);
      const visit = tracking();
      const country = countryCodes.find((option) => option.value === data.countryCode)?.label ?? "";
      const response = await captureLead({
        first_name: data.firstName,
        last_name: data.lastName,
        email_id: data.email,
        country_code: data.countryCode,
        phone_number: data.phone,
        country,
        looking_for_self:
          findIdFromRadioValue(dropdowns.lookingForSelf, data.lookingForSelf) ||
          (data.lookingForSelf === "YES" ? "Yes" : "No"),
        value_curated_services:
          findIdFromRadioValue(dropdowns.valueCuratedServices, data.highTouchServicesFit) ||
          (data.highTouchServicesFit === "YES" ? "Yes" : "No"),
        previous_matchmaking_experience:
          findIdFromRadioValue(dropdowns.previousMatchmaking, data.usedOtherPaidService) ||
          (data.usedOtherPaidService === "YES" ? "Yes" : "No"),
        heard_about_us: resolveSelectWithOther(dropdowns.heardAboutUs, data.hearAboutUs, data.hearAboutUsOther ?? ""),
        lead_source: "EXPLORATORY_CALL_FORM",
        utm_source: visit.utmSource || "EXPLORATORY_CALL_FORM",
        utm_medium: visit.utmMedium || "NA",
        utm_campaign: visit.utmCampaign || "NA",
        utm_term: visit.utmTerm || "NA",
        utm_content: visit.utmContent || "NA",
        platform_name: PLATFORM_NAME,
      });

      if (response.success === false) {
        toast.error(response.message || "We could not save your details. Please try again.");
        return;
      }

      const leadId = response.data?.leadId;
      localStorage.setItem(
        EXPLORATORY_STORAGE_KEY,
        JSON.stringify({
          ...(leadId ? { leadId } : {}),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          country,
          membershipType: searchParams.get("membershipType") || "",
        }),
      );
      if (response.message) toast.success(response.message);
      router.push("/contact/thank-you");
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
      <h2 className="text-center font-serif text-[34px] font-normal text-[#762323] md:text-[48px]">
        <span className="inline-block border-b border-[#762323] pb-2">Schedule an Exploratory Call</span>
      </h2>
      <ChoiceField
        compact
        index={1}
        question="Are you looking for a match for yourself?*"
        name="lookingForSelf"
        register={register}
        options={yesNo}
        error={errors.lookingForSelf?.message}
      />
      <ChoiceField
        compact
        index={2}
        question="Do you feel confidential, curated, high-touch services add value and are a good fit for you?*"
        name="highTouchServicesFit"
        register={register}
        options={yesNo}
        error={errors.highTouchServicesFit?.message}
      />
      <ChoiceField
        compact
        index={3}
        question="Have you worked with any other paid Matchmaking service before?*"
        name="usedOtherPaidService"
        register={register}
        options={yesNo}
        error={errors.usedOtherPaidService?.message}
      />
      <NameFields register={register} setValue={setValue} errors={errors} />
      <PhoneFields
        register={register}
        setValue={setValue}
        errors={errors}
        countryCodes={countryCodes}
        countryCode={countryCode}
        onCountryCode={setCountryCode}
        phone={phone}
        phoneVerified={phoneVerified}
        otpType="exploratory_call"
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
