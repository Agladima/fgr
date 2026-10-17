"use client";

import React, { useState, useRef } from "react";
import styles from "./register.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import FeedbackState from "@/components/ui/Feedback";
import MotionSection from "@/components/animations/MotionSection";
import { isValidEmail, isValidPhone, isNonEmpty } from "@/lib/validation";
import { ArrowUpRight, AlertCircle } from "lucide-react";

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  age: string;
  location: string;
  programme: string;
  currentStatus: string;
  otherOccupation: string;
  previousTraining: string;
  referralSource: string;
  otherReferral: string;
  additionalInfo: string;
  hp_field?: string;
}

const initialFormState: FormState = {
  fullName: "",
  phone: "",
  email: "",
  age: "",
  location: "",
  programme: "",
  currentStatus: "",
  otherOccupation: "",
  previousTraining: "",
  referralSource: "",
  otherReferral: "",
  additionalInfo: "",
  hp_field: "",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const fullNameRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error immediately on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submissionError) setSubmissionError(null);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!isNonEmpty(formData.fullName)) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!isNonEmpty(formData.phone)) {
      newErrors.phone = "Please provide your contact phone number.";
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (at least 7–15 digits).";
    }

    if (!isNonEmpty(formData.email)) {
      newErrors.email = "Please provide your email address.";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address (e.g., name@domain.com).";
    }

    if (!isNonEmpty(formData.age)) {
      newErrors.age = "Please select your age range.";
    }

    if (!isNonEmpty(formData.location)) {
      newErrors.location = "Please enter your current city or location.";
    }

    if (!isNonEmpty(formData.programme)) {
      newErrors.programme = "Please select a programme of interest.";
    }

    if (!isNonEmpty(formData.currentStatus)) {
      newErrors.currentStatus = "Please select your current status.";
    } else if (formData.currentStatus === "Other" && !isNonEmpty(formData.otherOccupation)) {
      newErrors.otherOccupation = "Please specify your current occupation.";
    }



    if (formData.referralSource === "Other" && !isNonEmpty(formData.otherReferral)) {
      newErrors.otherReferral = "Please describe how you heard about us.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent accidental duplicate submissions
    if (isSubmitting) return;

    if (!validate()) {
      setSubmissionError("Please review the highlighted fields below and correct the errors.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.error?.details && typeof result.error.details === "object") {
          const fieldErrors: Partial<Record<keyof FormState, string>> = {};
          for (const [key, msgs] of Object.entries(result.error.details)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              fieldErrors[key as keyof FormState] = msgs[0] as string;
            }
          }
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
        setSubmissionError(
          result.error?.message || "Failed to submit registration. Please try again."
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmissionError("A network error occurred. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData(initialFormState);
    setErrors({});
    setSubmissionError(null);
  };

  return (
    <>
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <section className={styles.headerSection}>
        <div className={styles.headerGlow} aria-hidden="true" />
        <Container size="wide">
          <MotionSection direction="up" duration={0.6} delay={0.05}>
            <SectionHeading
              eyebrow="ADMISSIONS & ENROLLMENT"
              title="Register for Training"
              theme="dark"
              align="left"
            />
            <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "860px", lineHeight: "1.7" }}>
              Equip yourself with practical, market-relevant skills. Complete the
              application form below to enroll in upcoming training cohorts at FGR
              Career Development Center.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          REGISTRATION FORM
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <MotionSection direction="up">
            <div className={styles.formCard}>
              {submitted ? (
                <FeedbackState
                  type="success"
                  title="Registration Submitted Successfully"
                  description={`Thank you, ${formData.fullName || "Applicant"}. Your application for "${formData.programme}" has been received. Our admissions team will review your details and contact you via email (${formData.email}) and phone (${formData.phone}) with cohort dates and venue details.`}
                  actionLabel="Submit Another Registration"
                  onAction={handleReset}
                />
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Honeypot field for bot spam prevention */}
                  <input
                    type="text"
                    name="hp_field"
                    value={formData.hp_field || ""}
                    onChange={(e) => handleChange("hp_field", e.target.value)}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {submissionError && (
                    <div className={styles.alertBanner} role="alert">
                      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{submissionError}</span>
                    </div>
                  )}

                  <div className={styles.formGrid}>
                    {/* Full Name & Phone */}
                    <div className={styles.rowTwo}>
                      <div>
                        <label className={styles.label} htmlFor="fullName">
                          Full Name *
                        </label>
                        <input
                          ref={fullNameRef}
                          id="fullName"
                          type="text"
                          className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
                          placeholder="e.g. Samuel Okon"
                          value={formData.fullName}
                          onChange={(e) => handleChange("fullName", e.target.value)}
                          aria-invalid={!!errors.fullName}
                          aria-describedby={errors.fullName ? "fullName-error" : undefined}
                          disabled={isSubmitting}
                        />
                        {errors.fullName && (
                          <div id="fullName-error" className={styles.fieldError} role="alert">
                            <AlertCircle size={13} />
                            <span>{errors.fullName}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className={styles.label} htmlFor="phone">
                          Phone Number *
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                          placeholder="+234..."
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? "phone-error" : undefined}
                          disabled={isSubmitting}
                        />
                        {errors.phone && (
                          <div id="phone-error" className={styles.fieldError} role="alert">
                            <AlertCircle size={13} />
                            <span>{errors.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email & Age Range */}
                    <div className={styles.rowTwo}>
                      <div>
                        <label className={styles.label} htmlFor="email">
                          Email Address *
                        </label>
                        <input
                          id="email"
                          type="email"
                          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                          placeholder="yourname@domain.com"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "email-error" : undefined}
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <div id="email-error" className={styles.fieldError} role="alert">
                            <AlertCircle size={13} />
                            <span>{errors.email}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className={styles.label} htmlFor="age">
                          Age Range *
                        </label>
                        <select
                          id="age"
                          className={`${styles.select} ${errors.age ? styles.inputError : ""}`}
                          value={formData.age}
                          onChange={(e) => handleChange("age", e.target.value)}
                          aria-invalid={!!errors.age}
                          aria-describedby={errors.age ? "age-error" : undefined}
                          disabled={isSubmitting}
                        >
                          <option value="">Select Age Group</option>
                          <option value="18-24">18 – 24 years</option>
                          <option value="25-34">25 – 34 years</option>
                          <option value="35-44">35 – 44 years</option>
                          <option value="45+">45 years and above</option>
                        </select>
                        {errors.age && (
                          <div id="age-error" className={styles.fieldError} role="alert">
                            <AlertCircle size={13} />
                            <span>{errors.age}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location & Programme of Interest */}
                    <div className={styles.rowTwo}>
                      <div>
                        <label className={styles.label} htmlFor="location">
                          Location / City *
                        </label>
                        <input
                          id="location"
                          type="text"
                          className={`${styles.input} ${errors.location ? styles.inputError : ""}`}
                          placeholder="e.g. Calabar, Cross River State"
                          value={formData.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          aria-invalid={!!errors.location}
                          aria-describedby={errors.location ? "location-error" : undefined}
                          disabled={isSubmitting}
                        />
                        {errors.location && (
                          <div id="location-error" className={styles.fieldError} role="alert">
                            <AlertCircle size={13} />
                            <span>{errors.location}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className={styles.label} htmlFor="programme">
                          Programme of Interest *
                        </label>
                        <select
                          id="programme"
                          className={`${styles.select} ${errors.programme ? styles.inputError : ""}`}
                          value={formData.programme}
                          onChange={(e) => handleChange("programme", e.target.value)}
                          aria-invalid={!!errors.programme}
                          aria-describedby={errors.programme ? "programme-error" : undefined}
                          disabled={isSubmitting}
                        >
                          <option value="">Select a Programme</option>
                          <option value="Employability & Career Development">
                            01 — Employability &amp; Career Development
                          </option>
                          <option value="Technical & Vocational Skills">
                            02 — Technical &amp; Vocational Skills
                          </option>
                          <option value="Digital Skills & Innovation">
                            03 — Digital Skills &amp; Innovation
                          </option>
                          <option value="Entrepreneurship & Business Development">
                            04 — Entrepreneurship &amp; Business Development
                          </option>
                          <option value="Leadership & Professional Development">
                            05 — Leadership &amp; Professional Development
                          </option>
                        </select>
                        {errors.programme && (
                          <div id="programme-error" className={styles.fieldError} role="alert">
                            <AlertCircle size={13} />
                            <span>{errors.programme}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Current Occupation / Status (with conditional field) */}
                    {/* Current Occupation / Status (with conditional field) */}
                    <div>
                      <label className={styles.label} htmlFor="currentStatus">
                        Current Occupation / Status *
                      </label>
                      <select
                        id="currentStatus"
                        className={`${styles.select} ${errors.currentStatus ? styles.inputError : ""}`}
                        value={formData.currentStatus}
                        onChange={(e) => handleChange("currentStatus", e.target.value)}
                        aria-invalid={!!errors.currentStatus}
                        aria-describedby={errors.currentStatus ? "currentStatus-error" : undefined}
                        disabled={isSubmitting}
                      >
                        <option value="">Select Current Occupation / Status</option>
                        <option value="Student / Recent Graduate">Student / Recent Graduate</option>
                        <option value="Unemployed / Job Seeker">Unemployed / Job Seeker</option>
                        <option value="Self-Employed / Entrepreneur">Self-Employed / Entrepreneur</option>
                        <option value="Employed Professional">Employed Professional</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.currentStatus && (
                        <div id="currentStatus-error" className={styles.fieldError} role="alert">
                          <AlertCircle size={13} />
                          <span>{errors.currentStatus}</span>
                        </div>
                      )}

                      {/* Conditional field for Occupation: Other */}
                      {formData.currentStatus === "Other" && (
                        <div className={styles.conditionalBox}>
                          <label className={styles.label} htmlFor="otherOccupation">
                            Please specify your occupation/status *
                          </label>
                          <input
                            id="otherOccupation"
                            type="text"
                            className={`${styles.input} ${errors.otherOccupation ? styles.inputError : ""}`}
                            placeholder="e.g. Freelance Artisan / Career Break"
                            value={formData.otherOccupation}
                            onChange={(e) => handleChange("otherOccupation", e.target.value)}
                            aria-invalid={!!errors.otherOccupation}
                            aria-describedby={errors.otherOccupation ? "otherOccupation-error" : undefined}
                            disabled={isSubmitting}
                          />
                          {errors.otherOccupation && (
                            <div id="otherOccupation-error" className={styles.fieldError} role="alert">
                              <AlertCircle size={13} />
                              <span>{errors.otherOccupation}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Previous Training */}
                    <div>
                      <label className={styles.label} htmlFor="previousTraining">
                        Previous Training or Qualifications (Optional)
                      </label>
                      <input
                        id="previousTraining"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. SSCE, OND/HND, Bachelor's degree, previous vocational certificate"
                        value={formData.previousTraining}
                        onChange={(e) => handleChange("previousTraining", e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* How did you hear about us? (with conditional field) */}
                    <div>
                      <label className={styles.label} htmlFor="referralSource">
                        How did you hear about us?
                      </label>
                      <select
                        id="referralSource"
                        className={styles.select}
                        value={formData.referralSource}
                        onChange={(e) => handleChange("referralSource", e.target.value)}
                        disabled={isSubmitting}
                      >
                        <option value="">Select Referral Source (Optional)</option>
                        <option value="Social Media">Social Media (LinkedIn, Facebook, X, Instagram)</option>
                        <option value="Word of Mouth">Friend, Colleague or Word of Mouth</option>
                        <option value="Partner Organisation">Partner Organisation or University</option>
                        <option value="Community Outreach">Community Outreach / Flyer</option>
                        <option value="Online Search">Online Search</option>
                        <option value="Other">Other</option>
                      </select>

                      {/* Conditional field for Referral: Other */}
                      {formData.referralSource === "Other" && (
                        <div className={styles.conditionalBox}>
                          <label className={styles.label} htmlFor="otherReferral">
                            Please specify how you heard about us *
                          </label>
                          <input
                            id="otherReferral"
                            type="text"
                            className={`${styles.input} ${errors.otherReferral ? styles.inputError : ""}`}
                            placeholder="e.g. Radio broadcast, career workshop, community leader"
                            value={formData.otherReferral}
                            onChange={(e) => handleChange("otherReferral", e.target.value)}
                            aria-invalid={!!errors.otherReferral}
                            aria-describedby={errors.otherReferral ? "otherReferral-error" : undefined}
                            disabled={isSubmitting}
                          />
                          {errors.otherReferral && (
                            <div id="otherReferral-error" className={styles.fieldError} role="alert">
                              <AlertCircle size={13} />
                              <span>{errors.otherReferral}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Additional Information */}
                    <div>
                      <label className={styles.label} htmlFor="additionalInfo">
                        Additional Information or Career Goals (Optional)
                      </label>
                      <textarea
                        id="additionalInfo"
                        className={styles.textarea}
                        placeholder="Tell us briefly about your background and what you hope to achieve through this programme..."
                        value={formData.additionalInfo}
                        onChange={(e) => handleChange("additionalInfo", e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className={styles.submitWrapper}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      rightIcon={<ArrowUpRight size={18} />}
                    >
                      {isSubmitting ? "Submitting Registration..." : "Submit Registration"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </MotionSection>
        </Container>
      </section>
    </>
  );
}
