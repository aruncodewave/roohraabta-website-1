import React from 'react';
import MobileOtpVerifier from '@/components/contact/MobileOtpVerifier';

const ChatbotLeadForm = ({
  title,
  description,
  leadForm,
  validationErrors,
  countryOptions,
  isSubmitting,
  phoneVerified,
  otpType,
  verificationId,
  submitLabel,
  onChange,
  onSubmit,
  onNameKeyDown,
  onEmailKeyDown,
  onPhoneVerificationChange,
  onVerificationIdChange,
}) => {
  return (
    <div className="chatbot-lead-form">
      <div className="form-header">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="First Name"
            value={leadForm.firstName}
            onChange={(event) => onChange('firstName', event.target.value)}
            onKeyDown={onNameKeyDown}
            className={validationErrors.firstName ? 'error' : ''}
          />
          {validationErrors.firstName && (
            <span className="validation-error">{validationErrors.firstName}</span>
          )}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Last Name"
            value={leadForm.lastName}
            onChange={(event) => onChange('lastName', event.target.value)}
            onKeyDown={onNameKeyDown}
            className={validationErrors.lastName ? 'error' : ''}
          />
          {validationErrors.lastName && (
            <span className="validation-error">{validationErrors.lastName}</span>
          )}
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            value={leadForm.email}
            onChange={(event) => onChange('email', event.target.value)}
            onKeyDown={onEmailKeyDown}
            className={validationErrors.email ? 'error' : ''}
          />
          {validationErrors.email && (
            <span className="validation-error">{validationErrors.email}</span>
          )}
        </div>
        <div className="form-group">
          <div className="phone-group">
            <select
              value={leadForm.countryCode}
              onChange={(event) => onChange('countryCode', event.target.value)}
              className="country-code"
            >
              <option value="">Country</option>
              {countryOptions.map((country) => (
                <option key={country.label} value={country.value}>
                  {country.label} ({country.value})
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone Number"
              value={leadForm.phoneNumber}
              onChange={(event) => {
                const numericValue = event.target.value.replace(/[^0-9]/g, '');
                if (numericValue.length <= 15) {
                  onChange('phoneNumber', numericValue);
                }
              }}
              maxLength={15}
              className={`phone-input ${validationErrors.phoneNumber ? 'error' : ''
                }`}
            />
          </div>
          {validationErrors.phoneNumber && (
            <span className="validation-error">{validationErrors.phoneNumber}</span>
          )}
        </div>
        {leadForm.phoneNumber && (
          <MobileOtpVerifier
            countryCode={leadForm.countryCode}
            phoneNumber={leadForm.phoneNumber}
            isVerified={phoneVerified}
            onVerificationChange={onPhoneVerificationChange}
            type={otpType}
            error={validationErrors.phoneOtp}
            disabled={isSubmitting}
            onVerificationIdChange={onVerificationIdChange}
          />
        )}
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
};

export default ChatbotLeadForm;

