import * as yup from "yup";

const personName = (label: string) =>
  yup
    .string()
    .trim()
    .required(`${label} is required`)
    .matches(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/, {
      message: `${label} can only contain letters`,
      excludeEmptyString: true,
    });

const sharedContact = {
  firstName: personName("First name"),
  lastName: personName("Last name"),
  email: yup.string().email("Invalid email").required("Email is required"),
  countryCode: yup.string().required("Country code is required"),
  phone: yup
    .string()
    .required("Contact number is required")
    .matches(/^[0-9]{7,15}$/, {
      message: "Invalid phone number (7-15 digits)",
      excludeEmptyString: true,
    }),
  phoneOtpVerified: yup.boolean().oneOf([true], "Please verify your phone number with OTP").required(),
  hearAboutUs: yup.string().required("This field is required"),
  hearAboutUsIsOther: yup.boolean().default(false),
  hearAboutUsOther: yup
    .string()
    .trim()
    .when("hearAboutUsIsOther", {
      is: true,
      then: (schema) => schema.min(1, "Please enter a valid value").required("Please specify how you heard about us"),
      otherwise: (schema) => schema.notRequired(),
    }),
  infoProvidedAccurate: yup
    .boolean()
    .oneOf([true], "You must agree that the information provided is accurate.")
    .required(),
  termsPrivacy: yup.boolean().oneOf([true], "You must agree to the terms & conditions").required(),
  // Captcha is paused. Restore the required rule when verification is turned back on.
  // recaptcha: yup.string().required("Please complete the reCAPTCHA verification"),
  recaptcha: yup.string().default(""),
};

export const exploratorySchema = yup.object({
  ...sharedContact,
  lookingForSelf: yup.string().required("Please select if you are looking for yourself"),
  highTouchServicesFit: yup.string().required("Please select if curated services add value"),
  usedOtherPaidService: yup.string().required("Please select if you have used other paid services"),
});

export const membershipSchema = yup.object({
  ...sharedContact,
  gender: yup.string().required("Gender is required"),
  DOB: yup.string().required("Date of birth is required"),
  relationShipStatus: yup.string().required("Relationship status is required"),
  haveChildren: yup.string().required("Please select if you have children"),
});

export type ExploratoryFormValues = yup.InferType<typeof exploratorySchema>;
export type MembershipFormValues = yup.InferType<typeof membershipSchema>;
