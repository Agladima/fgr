import React from "react";
import type { Metadata } from "next";
import styles from "./news.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/animations/MotionSection";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerGroup";
import { PRIMARY_CTAS } from "@/lib/constants/navigation";
import { ArrowRight, ArrowUpRight, Calendar, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "News & Events",
  description:
    "What's happening at FGR Career Development Center: training workshops, cohort announcements, partnership updates, and opportunities.",
};

export default function NewsEventsPage() {
  const articles = [
    {
      title: "2026 Workforce Development Cohort Registration Opened in Calabar",
      date: "October 14, 2026",
      category: "Admissions",
      summary:
        "FGR Career Development Center has officially opened applications for upcoming training streams across technical trades, digital literacy, and employability pathways.",
    },
    {
      title: "Digital Innovation Bootcamp: AI, Product Tools & Remote Work Readiness",
      date: "September 28, 2026",
      category: "Training & Workshops",
      summary:
        "An intensive multi-week cohort aimed at equipping young professionals and university graduates with high-demand digital design, marketing, and productivity tool competencies.",
    },
    {
      title: "FGR Career Development Center Concludes Institutional Partnership Round",
      date: "August 15, 2026",
      category: "Partnership News",
      summary:
        "Strategic engagements with local employers, vocational foundations, and academic institutions to scale graduate internship and apprenticeship pipelines across Cross River State.",
    },
  ];

  const categories = [
    {
      title: "Training & Workshops",
      items: [
        "Upcoming & ongoing training programmes",
        "Practical weekend bootcamps",
        "Executive seminars & masterclasses",
        "Professional development cohorts",
        "Entrepreneurship incubations",
      ],
      action: "View Training Calendar",
      href: PRIMARY_CTAS.register.href,
    },
    {
      title: "Partnership News",
      items: [
        "New bilateral partnership agreements",
        "Institutional capacity collaborations",
        "International development projects",
        "Corporate apprenticeship alliances",
        "Academic and research partnerships",
      ],
      action: "Partner With Us",
      href: PRIMARY_CTAS.partner.href,
    },
    {
      title: "Opportunities",
      items: [
        "Sponsored training scholarships",
        "International fellowships",
        "Youth enterprise grants",
        "Direct graduate internships",
        "Employment vacancies with partner firms",
      ],
      action: "Explore Opportunities",
      href: "/contact?subject=Opportunities",
    },
    {
      title: "Events",
      items: [
        "Centre graduation ceremonies",
        "Regional workforce conferences",
        "Career fairs & recruitment drives",
        "SME networking roundtables",
        "Partner showcase events",
      ],
      action: "Event Enquiries",
      href: "/contact?subject=Events",
    },
    {
      title: "Media & Announcements",
      items: [
        "Official press releases",
        "Quarterly programme updates",
        "Television & radio features",
        "Curriculum additions & accreditations",
        "Institutional milestones",
      ],
      action: "Media Inquiries",
      href: "/contact?subject=Media",
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
              eyebrow="NEWS & EVENTS"
              title="What's Happening at FGR Career Development Center"
              theme="dark"
              align="left"
            />
            <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "860px", lineHeight: "1.7" }}>
              Stay informed about our programmes, training activities, partnerships,
              opportunities and other developments across Cross River State and
              beyond.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          LATEST NEWS ARTICLES
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="OFFICIAL UPDATES"
              title="Latest News &amp; Bulletins"
              description="Verified announcements and recent milestones from the Centre:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.articlesGrid} staggerDelay={0.09}>
            {articles.map((art) => (
              <StaggerItem key={art.title} className={styles.articleCard}>
                <div className={styles.metaRow}>
                  <span className={styles.categoryTag}>{art.category}</span>
                  <span>{art.date}</span>
                </div>
                <h3 className={styles.articleTitle}>{art.title}</h3>
                <p className={styles.articleSummary}>{art.summary}</p>
                <div style={{ marginTop: "auto" }}>
                  <Button variant="link" size="sm" href={`/contact?subject=Inquiry+on+${encodeURIComponent(art.title)}`}>
                    Read more →
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* ============================================================
          EVENT CATEGORIES & STREAMS
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="PROGRAMME STREAMS"
              title="Events, Opportunities &amp; Announcements"
              description="Explore our specialized news streams and upcoming activities:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.categoriesGrid} staggerDelay={0.07}>
            {categories.map((c) => (
              <StaggerItem key={c.title} className={styles.catCard}>
                <h3 className={styles.catTitle}>{c.title}</h3>
                <ul className={styles.catList}>
                  {c.items.map((it) => (
                    <li key={it}>• {it}</li>
                  ))}
                </ul>
                <div style={{ marginTop: "1.25rem" }}>
                  <Button variant="outline" size="sm" href={c.href}>
                    {c.action}
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
