import React from "react";
import type { Metadata } from "next";
import styles from "./programmes.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/animations/MotionSection";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerGroup";
import { PRIMARY_CTAS } from "@/lib/constants/navigation";
import {
  CheckCircle2,
  ArrowUpRight,
  Wrench,
  Cpu,
  TrendingUp,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Explore training, technical, vocational, digital, and entrepreneurship programmes across our 5 strategic pillars.",
};

export default function ProgrammesPage() {
  const deliveryModalities = [
    "Classroom training",
    "Practical sessions",
    "Workshops",
    "Bootcamps",
    "Simulations",
    "Mentorship",
    "Industry engagement",
    "Field assignments",
    "Online learning",
    "Assessments",
    "Certification",
  ];

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
              eyebrow="OUR PROGRAMMES"
              title="Developing Skills. Expanding Opportunities."
              theme="dark"
              align="left"
            />
            <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "840px", lineHeight: "1.7" }}>
              FGR Career Development Center&apos;s programmes are organised around five
              strategic pillars. We equip participants with practical capabilities
              and verified credentials for employment, enterprise, and leadership.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          THE 5 STRATEGIC PROGRAMMES
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          {/* 01 — EMPLOYABILITY & CAREER DEVELOPMENT */}
          <MotionSection direction="up" delay={0}>
            <div id="employability" className={styles.programmeBlock}>
              <div className={styles.programmeHeader}>
                <span className={styles.programmePill}>PILLAR 01</span>
                <h2 className={styles.programmeTitle}>
                  Employability &amp; Career Development
                </h2>
                <p className={styles.programmeLead}>
                  We help individuals prepare for employment, navigate career
                  transitions and develop the competencies required to succeed in the
                  workplace.
                </p>
              </div>

              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Programme Areas
              </h3>
              <StaggerGroup className={styles.areaGrid} staggerDelay={0.04}>
                {[
                  "Career guidance",
                  "Career planning",
                  "CV and application support",
                  "Interview preparation",
                  "Workplace readiness",
                  "Professional communication",
                  "Career coaching",
                  "Job-readiness programmes",
                  "Internship and employment linkages",
                  "Professional development",
                ].map((area) => (
                  <StaggerItem key={area} className={styles.areaItem}>
                    <CheckCircle2 size={16} className={styles.areaIcon} />
                    <span>{area}</span>
                  </StaggerItem>
                ))}
              </StaggerGroup>

              <div className={styles.goalBox}>
                <div className={styles.goalLabel}>Our Goal</div>
                <p className={styles.goalText}>
                  To help participants understand their career options, develop
                  relevant competencies and become better prepared for employment and
                  professional advancement.
                </p>
              </div>

              <Button variant="primary" size="md" href={PRIMARY_CTAS.register.href} rightIcon={<ArrowUpRight size={16} />}>
                {PRIMARY_CTAS.register.label}
              </Button>
            </div>
          </MotionSection>

          {/* 02 — TECHNICAL & VOCATIONAL SKILLS */}
          <MotionSection direction="up">
            <div id="vocational" className={styles.programmeBlock}>
              <div className={styles.programmeHeader}>
                <span className={styles.programmePill}>PILLAR 02</span>
                <h2 className={styles.programmeTitle}>
                  Technical &amp; Vocational Skills
                </h2>
                <p className={styles.programmeLead}>
                  We support practical skills acquisition aligned with market needs,
                  employment opportunities and enterprise development.
                </p>
              </div>

              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Potential Training Areas
              </h3>
              <StaggerGroup className={styles.areaGrid} staggerDelay={0.04}>
                {[
                  "Hospitality",
                  "Catering",
                  "Fashion and tailoring",
                  "Electrical and technical trades",
                  "Renewable energy and solar skills",
                  "Practical trade skills",
                  "Other market-driven vocational skills",
                ].map((area) => (
                  <StaggerItem key={area} className={styles.areaItem}>
                    <Wrench size={16} className={styles.areaIcon} />
                    <span>{area}</span>
                  </StaggerItem>
                ))}
              </StaggerGroup>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", marginTop: "0.5rem" }}>
                * Programmes may evolve based on labour-market demand, participant needs and partnership opportunities.
              </p>

              <div className={styles.goalBox}>
                <div className={styles.goalLabel}>Our Goal</div>
                <p className={styles.goalText}>
                  To provide practical skills that can contribute to employment,
                  livelihoods, self-employment and enterprise.
                </p>
              </div>

              <Button variant="secondary" size="md" href={PRIMARY_CTAS.register.href}>
                View Training Opportunities
              </Button>
            </div>
          </MotionSection>

          {/* 03 — DIGITAL SKILLS & INNOVATION */}
          <MotionSection direction="up">
            <div id="digital" className={styles.programmeBlock}>
              <div className={styles.programmeHeader}>
                <span className={styles.programmePill}>PILLAR 03</span>
                <h2 className={styles.programmeTitle}>
                  Digital Skills &amp; Innovation
                </h2>
                <p className={styles.programmeLead}>
                  Digital capability is increasingly important across almost every
                  sector of the economy. Our digital-skills programmes help
                  participants develop practical capabilities for education,
                  employment, entrepreneurship and professional work.
                </p>
              </div>

              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Programme Areas
              </h3>
              <StaggerGroup className={styles.areaGrid} staggerDelay={0.04}>
                {[
                  "Digital literacy",
                  "Computer applications",
                  "Microsoft Office",
                  "Graphic design",
                  "Digital marketing",
                  "Social media management",
                  "AI literacy",
                  "Digital entrepreneurship",
                  "Freelancing",
                  "Remote-work skills",
                  "Digital productivity",
                ].map((area) => (
                  <StaggerItem key={area} className={styles.areaItem}>
                    <Cpu size={16} className={styles.areaIcon} />
                    <span>{area}</span>
                  </StaggerItem>
                ))}
              </StaggerGroup>

              <div className={styles.goalBox}>
                <div className={styles.goalLabel}>Our Goal</div>
                <p className={styles.goalText}>
                  To help participants develop the digital capabilities required to
                  participate effectively in the modern economy.
                </p>
              </div>

              <Button variant="primary" size="md" href={PRIMARY_CTAS.register.href} rightIcon={<ArrowUpRight size={16} />}>
                {PRIMARY_CTAS.register.label}
              </Button>
            </div>
          </MotionSection>

          {/* 04 — ENTREPRENEURSHIP & BUSINESS DEVELOPMENT */}
          <MotionSection direction="up">
            <div id="entrepreneurship" className={styles.programmeBlock}>
              <div className={styles.programmeHeader}>
                <span className={styles.programmePill}>PILLAR 04</span>
                <h2 className={styles.programmeTitle}>
                  Entrepreneurship &amp; Business Development
                </h2>
                <p className={styles.programmeLead}>
                  We support aspiring entrepreneurs, existing businesses and SMEs
                  with practical knowledge and capacity to develop sustainable
                  enterprises.
                </p>
              </div>

              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Programme Areas
              </h3>
              <StaggerGroup className={styles.areaGrid} staggerDelay={0.04}>
                {[
                  "Entrepreneurship training",
                  "Business planning",
                  "Business development",
                  "Financial literacy",
                  "Bookkeeping",
                  "Marketing",
                  "Customer development",
                  "Business registration guidance",
                  "SME development",
                  "Business mentorship",
                  "Access-to-opportunity linkages",
                ].map((area) => (
                  <StaggerItem key={area} className={styles.areaItem}>
                    <TrendingUp size={16} className={styles.areaIcon} />
                    <span>{area}</span>
                  </StaggerItem>
                ))}
              </StaggerGroup>

              <div className={styles.goalBox}>
                <div className={styles.goalLabel}>Our Goal</div>
                <p className={styles.goalText}>
                  To strengthen entrepreneurial capability and help individuals and
                  businesses identify, develop and pursue viable opportunities.
                </p>
              </div>

              <Button variant="secondary" size="md" href="/partnership-enquiry">
                Explore Business Support
              </Button>
            </div>
          </MotionSection>

          {/* 05 — LEADERSHIP & PROFESSIONAL DEVELOPMENT */}
          <MotionSection direction="up">
            <div id="leadership" className={styles.programmeBlock}>
              <div className={styles.programmeHeader}>
                <span className={styles.programmePill}>PILLAR 05</span>
                <h2 className={styles.programmeTitle}>
                  Leadership &amp; Professional Development
                </h2>
                <p className={styles.programmeLead}>
                  Professional success requires more than technical competence. Our
                  leadership and professional-development programmes focus on the
                  personal and interpersonal capabilities required for effective
                  performance and advancement.
                </p>
              </div>

              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Programme Areas
              </h3>
              <StaggerGroup className={styles.areaGrid} staggerDelay={0.04}>
                {[
                  "Leadership development",
                  "Communication",
                  "Teamwork",
                  "Professional ethics",
                  "Personal development",
                  "Management skills",
                  "Workplace behaviour",
                  "Mentorship",
                  "Youth leadership",
                  "Women leadership",
                  "Professional effectiveness",
                ].map((area) => (
                  <StaggerItem key={area} className={styles.areaItem}>
                    <Award size={16} className={styles.areaIcon} />
                    <span>{area}</span>
                  </StaggerItem>
                ))}
              </StaggerGroup>

              <div className={styles.goalBox}>
                <div className={styles.goalLabel}>Our Goal</div>
                <p className={styles.goalText}>
                  To develop confident, responsible and capable professionals and
                  emerging leaders.
                </p>
              </div>

              <Button variant="primary" size="md" href={PRIMARY_CTAS.register.href} rightIcon={<ArrowUpRight size={16} />}>
                View Professional Programmes
              </Button>
            </div>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          PROGRAMME DELIVERY MODALITIES
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="LEARNING METHODOLOGY"
              title="Programme Delivery"
              description="Depending on the programme, learning may include practical, digital, and experiential formats:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.deliveryGrid} staggerDelay={0.05}>
            {deliveryModalities.map((mode) => (
              <StaggerItem key={mode} className={styles.deliveryCard}>
                <span className={styles.deliveryDot} />
                <span>{mode}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>
    </>
  );
}
