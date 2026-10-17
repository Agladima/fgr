"use client";

import React, { useState } from "react";
import styles from "./contact.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import FeedbackState from "@/components/ui/Feedback";
import MotionSection from "@/components/animations/MotionSection";
import { isValidEmail, isValidPhone, isNonEmpty } from "@/lib/validation";
import { PRIMARY_CTAS } from "@/lib/constants/navigation";
import { MapPin, Phone, Mail, Globe, ArrowUpRight, Send, AlertCircle } from "lucide-react";

interface ContactFormState {
  name: string;
  organisation: string;
  email: string;
  phone: string;
  message: string;
  otherInterest: string;
  hp_field?: string;
}

const initialFormState: ContactFormState = {
  name: "",
  organisation: "",
  email: "",
  phone: "",
  message: "",
  otherInterest: "",
  hp_field: "",
};

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormState>(initialFormState);
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const interestOptions = [
    "Training",
    "Skills Development",
    "Entrepreneurship & SME Support",
    "Professional Services",
    "Project Management",
    "Partnership",
    "Sponsorship/Funding",
    "Internship/Employment",
    "Other",
  ];

  const handleChange = (
    field: keyof ContactFormState,
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

  const handleCheckbox = (option: string) => {
    if (interests.includes(option)) {
      setInterests(interests.filter((i) => i !== option));
    } else {
      setInterests([...interests, option]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isNonEmpty(formData.name)) {
      newErrors.name = "Please enter your full name.";
    }

    if (!isNonEmpty(formData.email)) {
      newErrors.email = "Please provide your email address.";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address (e.g., name@domain.com).";
    }

    if (!isNonEmpty(formData.phone)) {
      newErrors.phone = "Please provide your telephone number.";
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (at least 7–15 digits).";
    }

    if (interests.includes("Other") && !isNonEmpty(formData.otherInterest)) {
      newErrors.otherInterest = "Please describe what other area you are interested in.";
    }

    if (!isNonEmpty(formData.message)) {
      newErrors.message = "Please type your message or enquiry.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Please provide at least 10 characters in your message.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission
    if (isSubmitting) return;

    if (!validate()) {
      setSubmissionError("Please review the highlighted fields below.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          interests,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.error?.details && typeof result.error.details === "object") {
          const fieldErrors: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(result.error.details)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              fieldErrors[key] = msgs[0] as string;
            }
          }
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
        setSubmissionError(
          result.error?.message || "Failed to submit enquiry. Please try again."
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
    setInterests([]);
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
              eyebrow="CONTACT FGR CAREER DEVELOPMENT CENTER"
              title="Let's Connect"
              theme="dark"
              align="left"
            />
            <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "860px", lineHeight: "1.7" }}>
              Whether you want to participate in a programme, explore professional
              services, discuss a partnership or learn more about the Centre, we
              would like to hear from you.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          CONTACT GRID (INFO + FORM)
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <MotionSection direction="up">
            <div className={styles.contactGrid}>
              {/* Left: General Enquiries & Partnership Callout */}
              <div className={styles.infoColumn}>
                <div className={styles.infoCard}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-primary)", marginBottom: "1rem" }}>
                    General Enquiries
                  </h3>

                  <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                      <MapPin size={20} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Address:</div>
                        <div className={styles.infoValue}>
                          FGR Career Development Center <br />
                          Calabar, Cross River State, Nigeria
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <Phone size={20} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Phone:</div>
                        <div className={styles.infoValue}>+234 (0) 800 000 0000</div>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <Mail size={20} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Official Email:</div>
                        <div className={styles.infoValue}>contact@fgrcareer.org</div>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <Globe size={20} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Website:</div>
                        <div className={styles.infoValue}>https://fgrcareer.org</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dedicated Partnership Inquiries */}
                <div className={styles.partnerCallout}>
                  <h4 className={styles.partnerCalloutTitle}>Partnership Enquiries</h4>
                  <p className={styles.partnerCalloutText}>
                    For partnership, funding, institutional-support or programme-implementation enquiries:
                    <br />
                    <strong>Email:</strong> contact@fgrcareer.org
                    <br />
                    <em>Subject: Partnership Enquiry – FGR Career Development Center</em>
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    href={PRIMARY_CTAS.partner.href}
                    rightIcon={<ArrowUpRight size={14} />}
                  >
                    Go to Partnership Form
                  </Button>
                </div>
              </div>

              {/* Right: Send Us a Message Form */}
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Send Us a Message</h2>
                <p className={styles.formSubtitle}>
                  Fill out the form below and our team will get back to you shortly.
                </p>

                {submitted ? (
                  <FeedbackState
                    type="success"
                    title="Enquiry Received"
                    description={`Thank you, ${formData.name || "Friend"}. Your message has been received by FGR Career Development Center. Our team will review your enquiry and respond to ${formData.email} or ${formData.phone} shortly.`}
                    actionLabel="Send Another Message"
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

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="name">
                          Your Name *
                        </label>
                        <input
                          id="name"
                          type="text"
                          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "name-error" : undefined}
                          disabled={isSubmitting}
                        />
                        {errors.name && (
                          <div id="name-error" className={styles.fieldError} role="alert">
                            <AlertCircle size={13} />
                            <span>{errors.name}</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="organisation">
                          Organisation (Optional)
                        </label>
                        <input
                          id="organisation"
                          type="text"
                          className={styles.input}
                          placeholder="Enter organisation, if applicable"
                          value={formData.organisation}
                          onChange={(e) => handleChange("organisation", e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="email">
                          Email Address *
                        </label>
                        <input
                          id="email"
                          type="email"
                          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                          placeholder="Enter your email"
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

                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="phone">
                          Phone Number *
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                          placeholder="Enter phone number"
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

                    {/* What are you interested in? (Checkboxes + conditional field) */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>What are you interested in?</label>
                      <div className={styles.checkboxGrid}>
                        {interestOptions.map((opt) => (
                          <label key={opt} className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              className={styles.checkboxInput}
                              checked={interests.includes(opt)}
                              onChange={() => handleCheckbox(opt)}
                              disabled={isSubmitting}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {/* Conditional field if Other is checked */}
                      {interests.includes("Other") && (
                        <div className={styles.conditionalBox}>
                          <label className={styles.label} htmlFor="otherInterest">
                            Please specify your area of interest *
                          </label>
                          <input
                            id="otherInterest"
                            type="text"
                            className={`${styles.input} ${errors.otherInterest ? styles.inputError : ""}`}
                            placeholder="e.g. Media coverage, research data access"
                            value={formData.otherInterest}
                            onChange={(e) => handleChange("otherInterest", e.target.value)}
                            aria-invalid={!!errors.otherInterest}
                            aria-describedby={errors.otherInterest ? "otherInterest-error" : undefined}
                            disabled={isSubmitting}
                          />
                          {errors.otherInterest && (
                            <div id="otherInterest-error" className={styles.fieldError} role="alert">
                              <AlertCircle size={13} />
                              <span>{errors.otherInterest}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="message">
                        Your Message *
                      </label>
                      <textarea
                        id="message"
                        className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                        placeholder="Type your message here..."
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

                    <div className={styles.submitBox}>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        rightIcon={<Send size={16} />}
                      >
                        {isSubmitting ? "Sending Message..." : "Submit Enquiry"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </MotionSection>
        </Container>
      </section>
    </>
  );
}
