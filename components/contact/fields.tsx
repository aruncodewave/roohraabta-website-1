"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import DatePicker from "react-datepicker";
import { Controller, type FieldErrors } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";

type FormRegister = any;
type FormSetValue = any;
type FormControl = any;
import { getRecaptchaSiteKey } from "@/lib/vfe/config";
import type { DropdownOption } from "@/lib/vfe/types";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false });

const labelClass = "form-question text-[#8B7E2A]";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="type-detail mt-2 text-[#9b2c2c]">{message}</p>;
}

export function UnderlineInput({
  label,
  name,
  register,
  error,
  type = "text",
  inputMode,
  maxLength,
  lettersOnly = false,
  digitsOnly = false,
  setValue,
  hideMessage = false,
}: {
  label: string;
  name: string;
  register: FormRegister;
  error?: string;
  type?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
  lettersOnly?: boolean;
  digitsOnly?: boolean;
  setValue?: FormSetValue;
  hideMessage?: boolean;
}) {
  const registration = register(name);
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(false);
  const floated = focused || filled;

  return (
    <div className="relative min-w-0 pt-10 text-left">
      <input
        id={inputId}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={type === "date" ? undefined : " "}
        className={`form-field block w-full border-0 border-b bg-transparent pb-2 text-[#762323] outline-none ${
          error ? "border-[#9b2c2c]" : "border-[#762323]"
        } ${type === "date" && !floated ? "text-transparent focus:text-[#762323]" : ""}`}
        {...registration}
        onFocus={(event) => {
          setFocused(true);
          registration.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          setFilled(Boolean(event.target.value));
          registration.onBlur(event);
        }}
        onChange={(event) => {
          if (lettersOnly) {
            event.target.value = event.target.value.replace(/[^a-zA-Z\s]/g, "").replace(/\s{2,}/g, " ");
            setValue?.(name, event.target.value, { shouldValidate: true });
          }
          if (digitsOnly) {
            event.target.value = event.target.value.replace(/\D/g, "");
            setValue?.(name, event.target.value, { shouldValidate: true });
          }
          setFilled(Boolean(event.target.value));
          registration.onChange(event);
        }}
      />
      <label
        htmlFor={inputId}
        className={`pointer-events-none absolute left-0 text-[#8B7E2A] transition-all duration-200 ${
          floated ? "form-field-float top-0" : "form-field top-10"
        }`}
      >
        {label}
      </label>
      {hideMessage ? null : <FieldError message={error} />}
    </div>
  );
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function DateField({
  label,
  name,
  control,
  error,
}: {
  label: string;
  name: string;
  control: FormControl;
  error?: string;
}) {
  const maxDate = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <BirthDateControl
          label={label}
          error={error}
          maxDate={maxDate}
          value={typeof field.value === "string" ? field.value : ""}
          onChange={field.onChange}
        />
      )}
    />
  );
}

function BirthDateControl({
  label,
  value,
  onChange,
  error,
  maxDate,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxDate: Date;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseIsoDate(value) : null;
  const floated = open || Boolean(selected);

  return (
    <div className={`relative pt-10 text-left ${open ? "z-30" : ""}`}>
      <DatePicker
        selected={selected}
        onChange={(date: Date | null) => onChange(date ? toIsoDate(date) : "")}
        onCalendarOpen={() => setOpen(true)}
        onCalendarClose={() => setOpen(false)}
        maxDate={maxDate}
        dateFormat="dd/MM/yyyy"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        yearDropdownItemNumber={80}
        scrollableYearDropdown
        placeholderText=" "
        autoComplete="off"
        calendarClassName="lead-calendar"
        wrapperClassName="w-full"
        className={`form-field block w-full cursor-pointer border-0 border-b bg-transparent pb-2 text-[#762323] outline-none ${
          error ? "border-[#9b2c2c]" : "border-[#762323]"
        }`}
      />
      <label
        className={`pointer-events-none absolute left-0 text-[#8B7E2A] transition-all duration-200 ${
          floated ? "form-field-float top-0" : "form-field top-10"
        }`}
      >
        {label}
      </label>
      <FieldError message={error} />
    </div>
  );
}

export function UnderlineSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  hideMessage = false,
  variant = "field",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  error?: string;
  hideMessage?: boolean;
  variant?: "field" | "question";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0 text-left">
      <p className={`${variant === "question" ? "form-question" : "form-field"} text-[#8B7E2A]`}>{label}</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={`mt-1 flex w-full cursor-pointer items-center justify-between border-0 border-b bg-transparent pb-2 text-left outline-none ${
          error ? "border-[#9b2c2c]" : "border-[#762323]"
        }`}
      >
        <span className={`min-w-0 truncate ${selected ? "form-field text-[#762323]" : "form-hint text-[#8B7E2A]/70"}`}>{selected?.label || placeholder}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-5 w-5 shrink-0 text-[#762323] transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      {open ? (
        <div id={listId} role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-auto bg-cream shadow-lg">
          {options.length === 0 ? (
            <p className="form-hint px-4 py-3 text-[#8B7E2A]">No matches</p>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={`${option.label}-${option.value}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`form-field block w-full cursor-pointer px-4 py-3 text-left ${
                    isSelected ? "bg-[#8B7E2A] text-[#FFFDF7]" : "text-[#762323] hover:bg-[#8B7E2A]/15"
                  }`}
                >
                  {option.label}
                </button>
              );
            })
          )}
        </div>
      ) : null}
      {hideMessage ? null : <FieldError message={error} />}
    </div>
  );
}

export function ChoiceField({
  index,
  question,
  name,
  register,
  error,
  options,
  divided = true,
  compact = false,
  align = "center",
}: {
  index?: number;
  question: string;
  name: string;
  register: FormRegister;
  error?: string;
  options: { value: string; label: string }[];
  divided?: boolean;
  compact?: boolean;
  align?: "center" | "start";
}) {
  const start = align === "start";
  const questionClass = labelClass;
  const optionClass = start
    ? "form-field flex cursor-pointer items-center gap-3 text-[#8B7E2A]"
    : "form-field flex cursor-pointer items-center gap-4 text-[#8B7E2A]";

  return (
    <fieldset
      aria-label={start ? question : undefined}
      className={`min-w-0 border-0 p-0 ${start ? "flex w-full items-center pt-8 text-left" : "text-center"} ${divided ? "border-b border-[#762323] pb-10" : ""}`}
    >
      {start ? null : (
        <p className={`${questionClass} mx-auto max-w-4xl`}>
          {index ? `${index}. ` : ""}
          {question}
        </p>
      )}
      <div
        className={`flex items-center ${
          start
            ? "justify-start gap-8"
            : `justify-center ${compact ? "mt-6 gap-12 md:gap-16" : "mt-8 gap-16 md:gap-24"}`
        }`}
      >
        {options.map((option) => (
          <label key={option.value} className={optionClass}>
            <input type="radio" value={option.value} className="peer sr-only" {...register(name)} />
            <GoldBox size={compact ? "compact" : "md"} />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

export function AgreementCheckbox({
  id,
  name,
  register,
  error,
  children,
  beforeCheck,
}: {
  id: string;
  name: string;
  register: FormRegister;
  error?: string;
  children: ReactNode;
  beforeCheck?: () => boolean;
}) {
  const registration = register(name);
  const intent = useRef<"check" | "uncheck">("check");
  const noteIntent = (checked: boolean) => {
    intent.current = checked ? "uncheck" : "check";
  };

  return (
    <div className="text-left">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3"
        onPointerDown={(event) => {
          const input = event.currentTarget.querySelector("input");
          if (input instanceof HTMLInputElement) noteIntent(input.checked);
        }}
      >
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          {...registration}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") noteIntent(event.currentTarget.checked);
          }}
          onClick={(event) => {
            if (intent.current === "check" && beforeCheck && !beforeCheck()) {
              event.preventDefault();
              event.currentTarget.checked = false;
            }
          }}
          onChange={(event) => {
            if (intent.current === "check" && beforeCheck) {
              event.currentTarget.checked = false;
              return;
            }
            registration.onChange(event);
          }}
        />
        <GoldBox size="sm" className="mt-1" />
        <span className="form-note text-[#8B7E2A]">{children}</span>
      </label>
      <FieldError message={error} />
    </div>
  );
}

function GoldBox({ className = "", size = "md" }: { className?: string; size?: "sm" | "compact" | "md" }) {
  const box =
    size === "sm"
      ? "h-[22px] w-[22px] rounded-[4px]"
      : size === "compact"
        ? "h-[26px] w-[26px] rounded-[5px]"
        : "h-9 w-9 rounded-[8px] md:h-11 md:w-11";
  const icon =
    size === "sm"
      ? "h-[17px] w-[18px]"
      : size === "compact"
        ? "h-[20px] w-[21px]"
        : "h-7 w-[30px] md:h-8 md:w-9";

  return (
    <span
      className={`flex shrink-0 items-center justify-center border-[1.5px] border-[#8B7E2A] bg-transparent peer-checked:bg-[#8B7E2A] peer-checked:[&>span]:opacity-100 ${box} ${className}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none bg-[url('/icons/tick.svg')] bg-contain bg-center bg-no-repeat opacity-0 ${icon}`}
      />
    </span>
  );
}

export function CaptchaField({
  onChange,
  error,
}: {
  onChange: (token: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <ReCAPTCHA
        sitekey={getRecaptchaSiteKey()}
        onChange={(token) => onChange(token ?? "")}
        onExpired={() => onChange("")}
      />
      <FieldError message={error} />
    </div>
  );
}

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <div className="flex justify-center pt-4">
      <button
        type="submit"
        disabled={pending}
        className="form-field inline-flex aspect-[619/265] w-[min(86vw,380px)] cursor-pointer items-center justify-center border-0 bg-transparent bg-[url('/images/buttonFrame2.svg')] bg-contain bg-center bg-no-repeat leading-none text-[#FFFDF7] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "..." : "Submit"}
      </button>
    </div>
  );
}

export function otherOptionValue(options: DropdownOption[]) {
  return options.find((option) => option.label.trim().toLowerCase() === "other")?.value ?? "";
}

export function messageOf(errors: FieldErrors, name: string) {
  const error = errors[name];
  return typeof error?.message === "string" ? error.message : undefined;
}
