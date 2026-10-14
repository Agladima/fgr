import React from "react";
import type { Metadata } from "next";
import styles from "./resources.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/animations/MotionSection";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerGroup";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Resources & Toolkits",
  description:
    "Knowledge, tools, and opportunities: career guides, business planning, digital skillkits, funding opportunities, and research publications.",
};

export default function ResourcesPage() {
  const resourceCategories = [
    {
      title: "Career Resources",
      desc: "Resources for people preparing for employment and professional advancement.",
      items: [
        "CV guidance & modern formatting",
        "Interview preparation techniques",
        "Career planning frameworks",
        "Workplace-readiness resources",
        "Professional communication toolkits",
        "Career development materials",
      ],
      action: "Explore Career Resources",
      href: "/contact?subject=Career+Resources",
    },
    {
      title: "Entrepreneurship & Business Resources",
      desc: "Practical resources for entrepreneurs and SMEs to build sustainable enterprises.",
      items: [
        "Business planning guides",
        "Entrepreneurship toolkits",
        "Financial-management resources",
        "Marketing strategies for SMEs",
        "Business-development materials",
        "SME growth checklists",
      ],
      action: "Explore Business Resources",
      href: "/contact?subject=Business+Resources",
    },
    {
      title: "Digital Skills Resources",
      desc: "Resources supporting digital learning, modern tools, and workplace productivity.",
      items: [
        "Digital literacy resources",
        "Technology guides & tutorials",
        "Productivity tool workflows",
        "Digital entrepreneurship playbooks",
        "AI learning resources",
        "Online learning recommendations",
      ],
      action: "Explore Digital Resources",
      href: "/contact?subject=Digital+Resources",
    },
    {
      title: "Funding & Opportunity Resources",
      desc: "Information on selected opportunities relevant to individuals, entrepreneurs, and institutions.",
      items: [
        "Grants directory & application guides",
        "Scholarships for youth & adults",
        "Fellowships & leadership programs",
        "Training cohort opportunities",
        "Business opportunities & tenders",
        "Employment & internship openings",
      ],
      action: "View Opportunities",
      href: "/news-events",
    },
    {
      title: "Organisational Resources",
      desc: "Resources for organisations, non-profits, and development professionals.",
      items: [
        "Project-management templates",
        "Proposal-development resources",
        "Monitoring and evaluation tools",
        "Organisational-development guides",
        "HR and recruitment toolkits",
        "Standard operating procedure templates",
      ],
      action: "Explore Organisational Resources",
      href: "/contact?subject=Organisational+Resources",
    },
    {
      title: "Reports & Publications",
      desc: "A central repository for FGR Career Development Center's research and releases.",
      items: [
        "Annual performance reports",
        "Workforce & labour-market research",
        "Cross River development studies",
        "Programme review documents",
        "Knowledge products & whitepapers",
        "Policy briefs & recommendations",
      ],
      action: "View Publications",
      href: "/contact?subject=Publications",
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
              eyebrow="RESOURCES"
              title="Knowledge, Tools &amp; Opportunities"
              theme="dark"
              align="left"
            />
            <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "860px", lineHeight: "1.7" }}>
              FGR Career Development Center provides resources designed to help
              individuals, entrepreneurs, professionals and organisations make
              informed decisions and strengthen their capabilities.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          RESOURCES CATALOGUE
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <StaggerGroup className={styles.resourcesGrid} staggerDelay={0.08}>
            {resourceCategories.map((cat) => (
              <StaggerItem key={cat.title} className={styles.resourceCard}>
                <h3 className={styles.resourceTitle}>{cat.title}</h3>
                <p className={styles.resourceDesc}>{cat.desc}</p>

                <div className={styles.itemList}>
                  {cat.items.map((item) => (
                    <div key={item} className={styles.itemRow}>
                      <span className={styles.itemDot} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "auto" }}>
                  <Button variant="outline" size="sm" href={cat.href} rightIcon={<ArrowUpRight size={14} />}>
                    {cat.action}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>
    </>
  );
}
