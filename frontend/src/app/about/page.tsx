import React from "react";
import type { Metadata } from "next";
import styles from "./about.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/animations/MotionSection";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerGroup";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about FGR Career Development Center, our vision for Cross River State, our mission, values, and workforce-development approach.",
};

export default function AboutPage() {
  const values = [
    {
      title: "Integrity",
      description: "We conduct our work with honesty, transparency and accountability.",
    },
    {
      title: "Excellence",
      description: "We pursue quality in our programmes, services and partnerships.",
    },
    {
      title: "Professionalism",
      description: "We value competence, responsibility, respect and continuous improvement.",
    },
    {
      title: "Innovation",
      description: "We embrace new ideas, technologies and approaches to workforce development.",
    },
    {
      title: "Inclusion",
      description: "We seek to expand access to learning and opportunity.",
    },
    {
      title: "Partnership",
      description: "We believe meaningful development is strengthened through collaboration.",
    },
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
              eyebrow="ABOUT FGR CAREER DEVELOPMENT CENTER"
              title="Who We Are"
              theme="dark"
              align="left"
            />
            <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "800px", lineHeight: "1.7" }}>
              FGR Career Development Center is a workforce-development institution
              with established competencies in training, skills development,
              entrepreneurship, professional development and programme implementation.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          CORE OVERVIEW & PURPOSE
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <MotionSection direction="up">
            <div className={styles.purposeGrid}>
              <div>
                <SectionHeading
                  eyebrow="OUR PURPOSE"
                  title="Why We Exist"
                  align="left"
                />
                <p style={{ fontSize: "1.0625rem", color: "var(--color-text-body)", lineHeight: "1.7", marginBottom: "1.25rem" }}>
                  The world of work is changing rapidly. Technological advancement,
                  changing labour-market demands, entrepreneurship, digital
                  transformation and evolving workplace expectations require
                  individuals to continuously develop new capabilities.
                </p>
                <p style={{ fontSize: "1.0625rem", color: "var(--color-text-body)", lineHeight: "1.7", marginBottom: "1.25rem" }}>
                  At the same time, many young people and adults face barriers to
                  employment, enterprise and professional advancement.
                </p>
                <p style={{ fontSize: "1.125rem", fontWeight: "600", color: "var(--color-primary)", lineHeight: "1.7" }}>
                  FGR Career Development Center exists to help bridge these gaps by
                  creating practical pathways from learning to opportunity.
                </p>
              </div>

              <div style={{ background: "var(--color-primary-surface)", padding: "2.5rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-primary-subtle)" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-primary)", marginBottom: "1rem" }}>
                  Beyond Traditional Training
                </h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--color-text-body)", lineHeight: "1.7", marginBottom: "1rem" }}>
                  The Centre also provides project management, organisational support
                  and technical assistance to partners implementing development and
                  capacity-building initiatives.
                </p>
                <p style={{ fontSize: "0.9375rem", color: "var(--color-text-body)", lineHeight: "1.7" }}>
                  We believe that effective workforce development goes beyond training.
                  It requires relevant skills, practical experience, professional
                  competencies, access to networks and meaningful connections to opportunity.
                </p>
              </div>
            </div>
          </MotionSection>

          {/* ============================================================
              VISION & MISSION
              ============================================================ */}
          <StaggerGroup className={styles.visionMissionGrid} staggerDelay={0.12}>
            <StaggerItem className={styles.visionCard}>
              <h3 className={styles.vmTitle}>OUR VISION</h3>
              <p className={styles.vmText}>
                To become a leading regional workforce-development hub connecting
                young Nigerians in Cross River with local, national and international
                opportunities for employment, enterprise and professional advancement.
              </p>
            </StaggerItem>

            <StaggerItem className={styles.missionCard}>
              <h3 className={styles.vmTitle}>OUR MISSION</h3>
              <p className={styles.vmText}>
                To equip young people and adults with practical skills, professional
                competencies and entrepreneurial capacity for employment, enterprise
                and meaningful economic participation.
              </p>
            </StaggerItem>
          </StaggerGroup>
        </Container>
      </section>

      {/* ============================================================
          OUR APPROACH
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="OUR APPROACH"
              title="LEARN • CONNECT • EARN"
              description="Our approach recognises that skills become more valuable when they are connected to real opportunities."
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.approachGrid} staggerDelay={0.1}>
            <StaggerItem className={styles.approachCard}>
              <div className={styles.approachTag}>LEARN</div>
              <p style={{ fontSize: "1rem", color: "var(--color-text-body)", lineHeight: "1.65" }}>
                We provide access to practical, technical, digital, entrepreneurial
                and professional learning.
              </p>
            </StaggerItem>

            <StaggerItem className={styles.approachCard}>
              <div className={styles.approachTag}>CONNECT</div>
              <p style={{ fontSize: "1rem", color: "var(--color-text-body)", lineHeight: "1.65" }}>
                We build connections between participants and employers, businesses,
                mentors, institutions, professional networks and other opportunities.
              </p>
            </StaggerItem>

            <StaggerItem className={styles.approachCard}>
              <div className={styles.approachTag}>EARN</div>
              <p style={{ fontSize: "1rem", color: "var(--color-text-body)", lineHeight: "1.65" }}>
                We support pathways towards employment, entrepreneurship, business
                growth and professional advancement.
              </p>
            </StaggerItem>
          </StaggerGroup>
        </Container>
      </section>

      {/* ============================================================
          OUR VALUES
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="CORE PRINCIPLES"
              title="Our Values"
              description="The foundational standards guiding our institutional conduct, service delivery, and partnerships."
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.valuesGrid} staggerDelay={0.07}>
            {values.map((v) => (
              <StaggerItem key={v.title} className={styles.valueCard}>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.description}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {/* OUR COMMITMENT */}
          <MotionSection direction="up" delay={0.1}>
            <div className={styles.commitmentCard}>
              <h3 className={styles.commitmentHeading}>OUR COMMITMENT</h3>
              <p className={styles.commitmentText}>
                We are committed to building programmes and partnerships that respond
                to real needs, develop practical capabilities and create measurable
                pathways to opportunity.
              </p>
              <Button variant="secondary" size="lg" href="/programmes" rightIcon={<ArrowRight size={18} />}>
                Explore Our Programmes
              </Button>
            </div>
          </MotionSection>
        </Container>
      </section>
    </>
  );
}
