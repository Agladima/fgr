import React from "react";
import type { Metadata } from "next";
import styles from "./services.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/animations/MotionSection";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerGroup";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Professional Services",
  description:
    "Institutional advisory, project management, proposal development, MEL, HR support, and organizational development.",
};

export default function ProfessionalServicesPage() {
  const services = [
    {
      index: "01",
      title: "Project Management",
      lead: "We support organisations in planning, coordinating and implementing projects effectively.",
      items: [
        "Project planning",
        "Project coordination",
        "Implementation management",
        "Work planning",
        "Stakeholder coordination",
        "Activity scheduling",
        "Project documentation",
        "Progress reporting",
        "Project close-out support",
      ],
    },
    {
      index: "02",
      title: "Project Design & Development",
      lead: "We support organisations to turn ideas into structured programmes and projects.",
      items: [
        "Project concept development",
        "Programme design",
        "Theory of change",
        "Logical frameworks",
        "Work plans",
        "Activity planning",
        "Budget development",
        "Implementation frameworks",
        "Results frameworks",
      ],
    },
    {
      index: "03",
      title: "Grant & Proposal Development",
      lead: "We support organisations seeking to communicate their ideas effectively to potential funders and partners.",
      items: [
        "Concept notes",
        "Grant proposals",
        "Funding applications",
        "Partnership proposals",
        "Project narratives",
        "Budget narratives",
        "Results frameworks",
        "Programme documentation",
      ],
    },
    {
      index: "04",
      title: "Monitoring, Evaluation & Learning (MEL)",
      lead: "We support organisations to establish systems for measuring progress, results and learning.",
      items: [
        "Results frameworks",
        "Indicator development",
        "Monitoring tools",
        "Data collection systems",
        "Reporting frameworks",
        "Outcome tracking",
        "Learning processes",
        "Programme documentation",
      ],
    },
    {
      index: "05",
      title: "HR & Recruitment Support",
      lead: "We support organisations to strengthen their workforce and human-resource processes.",
      items: [
        "Recruitment support",
        "Job descriptions",
        "Staff capacity development",
        "Training needs assessment",
        "Workforce development",
        "HR documentation",
        "Staff onboarding support",
      ],
    },
    {
      index: "06",
      title: "Organisational Development",
      lead: "We support organisations seeking to strengthen their systems, people and institutional capacity.",
      items: [
        "Organisational assessments",
        "Capacity development",
        "Policy and procedure development",
        "Institutional strengthening",
        "Staff development",
        "Organisational systems support",
      ],
    },
    {
      index: "07",
      title: "SME Advisory & Business Support",
      lead: "We provide practical support to entrepreneurs and small and medium-sized enterprises seeking to strengthen their businesses.",
      items: [
        "Business planning",
        "Business development",
        "Enterprise training",
        "Market-readiness support",
        "Business documentation",
        "Capacity building",
      ],
    },
    {
      index: "08",
      title: "Technical Assistance",
      lead: "We provide technical assistance to organisations and partners implementing development, workforce and capacity-building initiatives.",
      items: [
        "Technical advisory",
        "Curriculum development support",
        "Expert trainer deployment",
        "Stakeholder engagement advisory",
        "Programme audit & quality assurance",
      ],
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
              eyebrow="PROFESSIONAL & INSTITUTIONAL SERVICES"
              title="Supporting Organisations to Deliver Better"
              theme="dark"
              align="left"
            />
            <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "860px", lineHeight: "1.7" }}>
              In addition to our workforce-development programmes, FGR Career
              Development Center provides professional and institutional support to
              organisations implementing development, capacity-building, enterprise
              and workforce initiatives.
            </p>
            <p style={{ fontSize: "1rem", color: "var(--color-text-inverse-muted)", maxWidth: "860px", lineHeight: "1.7", marginTop: "0.5rem" }}>
              Our services draw on our competencies in project management,
              organisational development, human resources, programme development,
              monitoring and evaluation and technical assistance.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          SERVICES CATALOGUE
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <StaggerGroup className={styles.servicesGrid} staggerDelay={0.08}>
            {services.map((svc) => (
              <StaggerItem key={svc.index} className={styles.serviceCard}>
                <div className={styles.serviceIndex}>SERVICE {svc.index}</div>
                <h3 className={styles.serviceTitle}>{svc.title}</h3>
                <p className={styles.serviceLead}>{svc.lead}</p>

                <div className={styles.serviceSubtitle}>Services Include:</div>
                <div className={styles.serviceItemList}>
                  {svc.items.map((item) => (
                    <div key={item} className={styles.serviceItem}>
                      <span className={styles.serviceDot} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {/* CALL TO ACTION BANNER */}
          <MotionSection direction="up" delay={0.1}>
            <div className={styles.enquireBanner}>
              <h2 className={styles.enquireHeading}>
                Ready to Strengthen Your Institutional Delivery?
              </h2>
              <p className={styles.enquireText}>
                Connect with our advisory team to discuss technical assistance,
                project management, grant proposal development, or workforce consulting.
              </p>
              <Button variant="secondary" size="lg" href="/partnership-enquiry" rightIcon={<ArrowUpRight size={18} />}>
                Enquire About Professional Services
              </Button>
            </div>
          </MotionSection>
        </Container>
      </section>
    </>
  );
}
