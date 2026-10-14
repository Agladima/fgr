import React from "react";
import type { Metadata } from "next";
import styles from "./partnerships.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/animations/MotionSection";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerGroup";
import { PRIMARY_CTAS } from "@/lib/constants/navigation";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Partnerships",
  description:
    "Partner with FGR Career Development Center: Government, NGOs, foundations, universities, private sector, and employers.",
};

export default function PartnershipsPage() {
  const whoWePartnerWith = [
    {
      title: "Government Institutions",
      desc: "For workforce development, skills programmes, youth development and capacity-building initiatives.",
    },
    {
      title: "International Organisations",
      desc: "For programme implementation, technical assistance, skills development and institutional partnerships.",
    },
    {
      title: "NGOs & Civil Society Organisations",
      desc: "For joint programmes, capacity building and community-based development initiatives.",
    },
    {
      title: "Foundations & Philanthropic Organisations",
      desc: "For programme funding, scholarships, equipment and institutional strengthening.",
    },
    {
      title: "Universities & Educational Institutions",
      desc: "For research, training, curriculum development, professional exchange and knowledge sharing.",
    },
    {
      title: "Private-Sector Organisations",
      desc: "For workforce development, sponsorship, internships, apprenticeships and employment pathways.",
    },
    {
      title: "Professional Bodies",
      desc: "For professional development, certification and industry engagement.",
    },
    {
      title: "Employers",
      desc: "For talent development, internships, workplace exposure and employment opportunities.",
    },
  ];

  const areasOfPartnership = [
    {
      number: "01",
      title: "Programme Funding",
      desc: "Support specific workforce-development, skills, entrepreneurship and professional-development programmes.",
    },
    {
      number: "02",
      title: "Institutional Strengthening",
      desc: "Support the development of systems, infrastructure, technology, staff capacity and organisational capabilities.",
    },
    {
      number: "03",
      title: "Technical Partnerships",
      desc: "Provide curriculum, technical expertise, trainers, certification and professional knowledge.",
    },
    {
      number: "04",
      title: "Training & Certification",
      desc: "Collaborate on training, professional development and recognised certification pathways.",
    },
    {
      number: "05",
      title: "Equipment & Technology",
      desc: "Support access to computers, software, technical equipment and other learning resources.",
    },
    {
      number: "06",
      title: "Scholarships",
      desc: "Sponsor training opportunities for young people, job seekers, entrepreneurs and other target groups.",
    },
    {
      number: "07",
      title: "Mentorship",
      desc: "Connect participants with experienced professionals, entrepreneurs and industry leaders.",
    },
    {
      number: "08",
      title: "Research & Knowledge Exchange",
      desc: "Collaborate on research, workforce development, innovation and knowledge sharing.",
    },
    {
      number: "09",
      title: "Internships & Employment Pathways",
      desc: "Create connections between trained participants and employers.",
    },
    {
      number: "10",
      title: "International Partnerships",
      desc: "Facilitate international mentorship, professional exchange, technical assistance, learning opportunities and access to global networks.",
    },
  ];

  const whatWeBring = [
    "Local presence",
    "Local knowledge",
    "Training infrastructure",
    "Workforce-development expertise",
    "Programme implementation capacity",
    "Project management capabilities",
    "Participant mobilisation capacity",
    "Stakeholder relationships",
    "Local institutional connections",
    "Monitoring and reporting capabilities",
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
              eyebrow="PARTNER WITH US"
              title="Building Partnerships That Create Opportunity"
              theme="dark"
              align="left"
            />
            <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "860px", lineHeight: "1.7" }}>
              FGR Career Development Center believes that sustainable workforce
              development requires collaboration. We welcome strategic partnerships
              that expand access to skills, employment, enterprise, professional
              development and economic opportunity.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          WHO WE PARTNER WITH
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="PARTNER ECOSYSTEM"
              title="Who We Partner With"
              description="We welcome collaboration with key institutions committed to advancing human capital and sustainable livelihoods:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.partnersGrid} staggerDelay={0.07}>
            {whoWePartnerWith.map((partner) => (
              <StaggerItem key={partner.title} className={styles.partnerCard}>
                <h3 className={styles.partnerCardTitle}>{partner.title}</h3>
                <p className={styles.partnerCardDesc}>{partner.desc}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* ============================================================
          AREAS OF PARTNERSHIP
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="AREAS OF COLLABORATION"
              title="Areas of Partnership"
              description="Explore the ten strategic domains where our partners generate shared, measurable impact:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.areasGrid} staggerDelay={0.06}>
            {areasOfPartnership.map((area) => (
              <StaggerItem key={area.number} className={styles.areaCard}>
                <div className={styles.areaNumber}>{area.number}</div>
                <div>
                  <h3 className={styles.areaTitle}>{area.title}</h3>
                  <p className={styles.areaDesc}>{area.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* ============================================================
          WHAT WE BRING & WHY PARTNER WITH US
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="OUR VALUE PROPOSITION"
              title="What We Bring to Partners"
              description="FGR Career Development Center combines resources, networks, and localized execution capabilities:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.bringGrid} staggerDelay={0.05}>
            {whatWeBring.map((item) => (
              <StaggerItem key={item} className={styles.bringItem}>
                <CheckCircle2 size={16} color="var(--color-secondary-contrast)" />
                <span>{item}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <MotionSection direction="up" delay={0.1}>
            <div className={styles.whyPartnerCard}>
              <h3 className={styles.whyPartnerTitle}>WHY PARTNER WITH US?</h3>
              <p className={styles.whyPartnerText}>
                We seek partnerships that combine resources, expertise, networks and
                local implementation capacity to create practical opportunities for
                people and organisations.
              </p>
              <p className={styles.whyPartnerText}>
                Whether the partnership involves funding, technical support,
                equipment, certification, mentorship, programme implementation or
                knowledge exchange, we are open to developing models that create
                measurable value for participants and partners.
              </p>
              <div className={styles.whyPartnerTagline}>
                Let&apos;s Build Opportunity Together.
              </div>
              <Button
                variant="secondary"
                size="lg"
                href={PRIMARY_CTAS.partner.href}
                rightIcon={<ArrowUpRight size={18} />}
              >
                Start a Partnership Conversation
              </Button>
            </div>
          </MotionSection>
        </Container>
      </section>
    </>
  );
}
