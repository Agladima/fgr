"use client";

import React, { useState } from "react";
import styles from "./partnership-enquiry.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import FeedbackState from "@/components/ui/Feedback";
import MotionSection from "@/components/animations/MotionSection";
import { isValidEmail, isValidPhone, isNonEmpty } from "@/lib/validation";
import { ArrowUpRight, AlertCircle, Handshake } from "lucide-react";

interface PartnershipFormState {
  organisationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  organisationType: string;
  otherOrgType: string;
  message: string;
  otherInterestDetails: string;
}

const initialFormState: PartnershipFormState = {
  organisationName: "",
  contactPerson: "",
  email: "",
  phone: "",
  organisationType: "Private Sector",
  otherOrgType: "",
  message: "",
  otherInterestDetails: "",
};

export default function PartnershipEnquiryPage() {
  const [formData, setFormData] = useState<PartnershipFormState>(initialFormState);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const organisationTypes = [
    "Government",
    "NGO / CSO",
    "International Organisation",
    "Foundation",
    "Private Sector",
    "University / Academia",
    "Professional Body",
    "Other",
  ];

  const partnershipInterests = [
    "Programme Funding",
    "Institutional Strengthening",
    "Technical Partnership",
    "Training & Certification",
    "Equipment / Technology",
    "Scholarships",
    "Mentorship",
    "Research",
    "Internship / Employment",
    "Programme Implementation",
    "Other",
  ];

  const handleChange = (
    field: keyof PartnershipFormState,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submissionError) setSubmissionError(null);
  };

  const handleInterestToggle = (interest: string) => {
    if (errors.interests) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.interests;
        return next;
      });
    }

    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isNonEmpty(formData.organisationName)) {
      newErrors.organisationName = "Please enter your organisation's name.";
    }

    if (!isNonEmpty(formData.contactPerson)) {
      newErrors.contactPerson = "Please provide the contact person's name and designation.";
    }

    if (!isNonEmpty(formData.email)) {
      newErrors.email = "Please provide an official contact email.";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!isNonEmpty(formData.phone)) {
      newErrors.phone = "Please provide an official telephone number.";
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (at least 7–15 digits).";
    }

    if (formData.organisationType === "Other" && !isNonEmpty(formData.otherOrgType)) {
      newErrors.otherOrgType = "Please specify your organisation type.";
    }

    if (selectedInterests.length === 0) {
      newErrors.interests = "Please select at least one area of partnership interest.";
    }

    if (selectedInterests.includes("Other") && !isNonEmpty(formData.otherInterestDetails)) {
      newErrors.otherInterestDetails = "Please specify your other partnership interest.";
    }

    if (!isNonEmpty(formData.message)) {
      newErrors.message = "Please provide details regarding your proposed collaboration.";
    } else if (formData.message.trim().length < 15) {
      newErrors.message = "Please provide a slightly more descriptive overview (at least 15 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission
    if (isSubmitting) return;

    if (!validate()) {
      setSubmissionError("Please correct the highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    // Simulated network submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData(initialFormState);
    setSelectedInterests([]);
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
              eyebrow="STRATEGIC ALLIANCES"
              title="Partner With Us"
              theme="dark"
              align="left"
            />
            <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "860px", lineHeight: "1.7" }}>
              FGR Career Development Center welcomes partnerships with government
              institutions, development agencies, private sector employers,
              foundations, and educational institutions. Let&apos;s build sustainable
              economic pathways together.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          PARTNERSHIP ENQUIRY FORM
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <MotionSection direction="up">
            <div className={styles.formCard}>
              {submitted ? (
                <FeedbackState
                  type="success"
                  title="Partnership Proposal Received"
                  description={`Thank you, ${formData.contactPerson || "Partner"}. Your proposal on behalf of "${formData.organisationName || "your organisation"}" has been delivered to our Strategic Partnerships Directorate. A representative will contact you at ${formData.email} or ${formData.phone} to initiate exploratory discussions.`}
                  actionLabel="Submit Another Enquiry"
                  onAction={handleReset}
                />
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {submissionError && (
                    <div className={styles.alertBanner} role="alert">
                      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{submissionError}</span>
                    </div>
                  )}

                  <div className={styles.formGrid}>
                    {/* Organisation Name & Contact Person */}
                    <div className={styles.rowTwo}>
                      <div>
                        <label className={styles.label} htmlFor="organisationName">
                          Organisation Name *
                        </label>
                        <input
                          id="organisationName"
                          type="text"
                          className={`${styles.input} ${errors.organisationName ? styles.inputError : ""}`}
                          placeholder="e.g. Acme Corporation, Foundation, or Agency"
                          value={formData.organisationName}
                          onChange={(e) => handleChange("organisationName", e.target.value)}
                          aria-invalid={!!errors.organisationName}
                          aria-describedby={errors.organisationName ? "organisationName-error" : undefined}
                          disabled={isSubmitting}
                        />
                        {errors.organisationName && (
                          <div id="organisationName-error" className={styles.fieldError} role="alert">
                            <AlertCircle size={13} />
                            <span>{errors.organisationName}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className={styles.label} htmlFor="contactPerson">
                          Contact Person (Name &amp; Role) *
                        </label>
                        <input
                          id="contactPerson"
                          type="text"
                          className={`${styles.input} ${errors.contactPerson ? styles.inputError : ""}`}
                          placeholder="e.g. Dr. Jane Doe, Director of CSR"
                          value={formData.contactPerson}
                          onChange={(e) => handleChange("contactPerson", e.target.value)}
                          aria-invalid={!!errors.contactPerson}
                          aria-describedby={errors.contactPerson ? "contactPerson-error" : undefined}
                          disabled={isSubmitting}
                        />
                        {errors.contactPerson && (
                          <div id="contactPerson-error" className={styles.fieldError} role="alert">
                            <AlertCircle size={13} />
                            <span>{errors.contactPerson}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className={styles.rowTwo}>
                      <div>
                        <label className={styles.label} htmlFor="email">
                          Official Email Address *
                        </label>
                        <input
                          id="email"
                          type="email"
                          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                          placeholder="contact@organisation.org"
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

                    {/* Organisation Type (with conditional field) */}
                    <div>
                      <label className={styles.label} htmlFor="organisationType">
                        Organisation Type *
                      </label>
                      <select
                        id="organisationType"
                        className={styles.select}
                        value={formData.organisationType}
                        onChange={(e) => handleChange("organisationType", e.target.value)}
                        disabled={isSubmitting}
                      >
                        {organisationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>

                      {/* Conditional field for Organisation Type: Other */}
                      {formData.organisationType === "Other" && (
                        <div className={styles.conditionalBox}>
                          <label className={styles.label} htmlFor="otherOrgType">
                            Please specify your organisation type *
                          </label>
                          <input
                            id="otherOrgType"
                            type="text"
                            className={`${styles.input} ${errors.otherOrgType ? styles.inputError : ""}`}
                            placeholder="e.g. Bilateral Agency / Community Cooperative"
                            value={formData.otherOrgType}
                            onChange={(e) => handleChange("otherOrgType", e.target.value)}
                            aria-invalid={!!errors.otherOrgType}
                            aria-describedby={errors.otherOrgType ? "otherOrgType-error" : undefined}
                            disabled={isSubmitting}
                          />
                          {errors.otherOrgType && (
                            <div id="otherOrgType-error" className={styles.fieldError} role="alert">
                              <AlertCircle size={13} />
                              <span>{errors.otherOrgType}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Partnership Interest Checkboxes */}
                    <div>
                      <label className={styles.label}>
                        Areas of Partnership Interest (Select all that apply) *
                      </label>
                      <div className={styles.checkboxGrid}>
                        {partnershipInterests.map((interest) => (
                          <label key={interest} className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              className={styles.checkboxInput}
                              checked={selectedInterests.includes(interest)}
                              onChange={() => handleInterestToggle(interest)}
                              disabled={isSubmitting}
                            />
                            <span>{interest}</span>
                          </label>
                        ))}
                      </div>
                      {errors.interests && (
                        <div className={styles.fieldError} role="alert" style={{ marginTop: "0.5rem" }}>
                          <AlertCircle size={13} />
                          <span>{errors.interests}</span>
                        </div>
                      )}

                      {/* Conditional field if Other interest checked */}
                      {selectedInterests.includes("Other") && (
                        <div className={styles.conditionalBox}>
                          <label className={styles.label} htmlFor="otherInterestDetails">
                            Please specify other partnership interest *
                          </label>
                          <input
                            id="otherInterestDetails"
                            type="text"
                            className={`${styles.input} ${errors.otherInterestDetails ? styles.inputError : ""}`}
                            placeholder="e.g. Co-designing bespoke curriculum / Regional facility donation"
                            value={formData.otherInterestDetails}
                            onChange={(e) => handleChange("otherInterestDetails", e.target.value)}
                            aria-invalid={!!errors.otherInterestDetails}
                            aria-describedby={errors.otherInterestDetails ? "otherInterestDetails-error" : undefined}
                            disabled={isSubmitting}
                          />
                          {errors.otherInterestDetails && (
                            <div id="otherInterestDetails-error" className={styles.fieldError} role="alert">
                              <AlertCircle size={13} />
                              <span>{errors.otherInterestDetails}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className={styles.label} htmlFor="message">
                        Tell Us About Your Partnership Interest *
                      </label>
                      <textarea
                        id="message"
                        className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                        placeholder="Describe your organization's objectives, proposed collaboration areas, target cohort or scope..."
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "message-error" : undefined}
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <div id="message-error" className={styles.fieldError} role="alert">
                          <AlertCircle size={13} />
                          <span>{errors.message}</span>
                        </div>
                      )}
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
                      {isSubmitting ? "Submitting Partnership Enquiry..." : "Submit Partnership Enquiry"}
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
