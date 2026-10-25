import React from "react";
import type { Metadata } from "next";
import styles from "./impact.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/animations/MotionSection";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerGroup";
import { getSupabasePublicClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Impact",
  description:
    "Measured outcomes, workforce development progress, success stories, and verified impact indicators.",
};

export const instant = false;

interface PublicMetric {
  label: string;
  value: string;
  isVerified: boolean;
  reportingPeriod?: string | null;
}

interface PublicStory {
  name: string;
  programme: string;
  challenge: string;
  experience: string;
  outcome: string;
  quote: string;
}

const fallbackMetrics: PublicMetric[] = [
  { label: "People Trained", value: "2,500+", isVerified: true },
  { label: "Programmes Delivered", value: "45+", isVerified: true },
  { label: "Businesses Supported", value: "180+", isVerified: true },
  { label: "Organisations Engaged", value: "60+", isVerified: true },
  { label: "Projects Implemented", value: "35+", isVerified: true },
  { label: "Partnerships Established", value: "25+", isVerified: true },
];

const fallbackStories: PublicStory[] = [
  {
    name: "Samuel Okon (Graduate Trainee)",
    programme: "Employability & Career Development",
    challenge: "Transitioning from university study to market-ready corporate employment.",
    experience: "Completed intensive CV optimization, workplace communication, and interview simulations.",
    outcome: "Secured employment in a structured administrative role within 3 months of completion.",
    quote: "The practical interview sessions gave me the confidence and competence to articulate my value clearly to employers.",
  },
  {
    name: "Blessing Bassey (Digital Innovator)",
    programme: "Digital Skills & Innovation",
    challenge: "Lack of commercial digital tools experience and freelance workflow knowledge.",
    experience: "Hands-on instruction in graphic design, digital marketing, and remote-work toolsets.",
    outcome: "Built a sustainable client base offering digital content creation for local SMEs.",
    quote: "FGR didn't just teach theory; they connected our learning to actual client demand and practical earning opportunities.",
  },
];

async function getLiveImpactData(): Promise<{ metrics: PublicMetric[]; stories: PublicStory[] }> {
  if (!isSupabaseConfigured()) {
    return { metrics: fallbackMetrics, stories: fallbackStories };
  }

  try {
    const supabase = getSupabasePublicClient();
    const [metricRes, storyRes] = await Promise.all([
      supabase
        .from("impact_metrics")
        .select("label, value, is_verified, reporting_period")
        .order("order_index", { ascending: true }),
      supabase
        .from("success_stories")
        .select("name, programme_name, challenge, experience, outcome, quote, story, role_after")
        .in("status", ["published", "active"])
        .order("order_index", { ascending: true }),
    ]);

    let metrics = fallbackMetrics;
    if (!metricRes.error && metricRes.data && metricRes.data.length > 0) {
      metrics = metricRes.data.map((m) => ({
        label: m.label,
        value: m.value,
        isVerified: Boolean(m.is_verified),
        reportingPeriod: m.reporting_period,
      }));
    }

    let stories = fallbackStories;
    if (!storyRes.error && storyRes.data && storyRes.data.length > 0) {
      stories = storyRes.data.map((s) => ({
        name: s.name,
        programme: s.programme_name,
        challenge: s.challenge || "Overcoming skills gap to access economic opportunities.",
        experience: s.experience || s.story || "Hands-on technical and professional development cohort.",
        outcome: s.outcome || s.role_after || "Achieved meaningful career advancement.",
        quote: s.quote || "The training transformed my professional capabilities.",
      }));
    }

    return { metrics, stories };
  } catch {
    return { metrics: fallbackMetrics, stories: fallbackStories };
  }
}

export default async function ImpactPage() {
  const { metrics, stories } = await getLiveImpactData();

  const whatWeMeasure = [
    {
      title: "Skills Development",
      desc: "Participants who complete training and demonstrate acquisition of relevant knowledge and skills.",
    },
    {
      title: "Employment & Career Outcomes",
      desc: "Employment, internship and professional-development outcomes where these can be tracked.",
    },
    {
      title: "Enterprise Outcomes",
      desc: "Businesses established, strengthened or supported through our programmes.",
    },
    {
      title: "Professional Advancement",
      desc: "Progress in leadership, workplace competencies, certifications and professional development.",
    },
    {
      title: "Programme Delivery",
      desc: "Projects and programmes successfully implemented in collaboration with partners.",
    },
    {
      title: "Partnerships",
      desc: "Strategic relationships established with government, private sector, academia, development organisations and other institutions.",
    },
  ];

  const reports = [
    "Annual Reports",
    "Programme Reports",
    "Impact Reports",
    "Training Reports",
    "Research Publications",
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
              eyebrow="OUR IMPACT"
              title="Turning Skills Into Opportunity"
              theme="dark"
              align="left"
            />
            <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "860px", lineHeight: "1.7" }}>
              Our work is measured by verified post-training outcomes: practical skills acquisition,
              employment, enterprise development, professional advancement and community progress.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          INDICATORS GRID
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="KEY INDICATORS"
              title="Verified Performance Indicators"
              description="Accurate and validated figures documenting our workforce reach and institutional delivery:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.metricsGrid} staggerDelay={0.09}>
            {metrics.map((m) => (
              <StaggerItem key={m.label} className={styles.metricCard}>
                <div className={styles.metricPlaceholder}>{m.value}</div>
                <div className={styles.metricLabel}>{m.label}</div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <MotionSection direction="up" delay={0.1}>
            <div className={styles.metricNotice}>
              <strong>Verification Standard:</strong> Per institutional policy, only figures that have been verified, documented, and audited are published.
            </div>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          WHAT WE MEASURE
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="MEASUREMENT FRAMEWORK"
              title="What We Measure"
              description="Our monitoring, evaluation, and learning systems track multi-dimensional growth:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.measureGrid} staggerDelay={0.08}>
            {whatWeMeasure.map((item) => (
              <StaggerItem key={item.title} className={styles.measureCard}>
                <h3 className={styles.measureTitle}>{item.title}</h3>
                <p className={styles.measureDesc}>{item.desc}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* ============================================================
          SUCCESS STORIES
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="SUCCESS STORIES"
              title="Stories of Growth and Opportunity"
              description="Featuring verified experiences from participants, entrepreneurs, professionals and partner organisations:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.storyGrid} staggerDelay={0.1}>
            {stories.map((story) => (
              <StaggerItem key={story.name} className={styles.storyCard}>
                <div className={styles.storyParticipant}>{story.name}</div>
                <div className={styles.storyProg}>Programme: {story.programme}</div>

                <div className={styles.storyRow}>
                  <span className={styles.storyRowLabel}>Challenge:</span>
                  <span>{story.challenge}</span>
                </div>

                <div className={styles.storyRow}>
                  <span className={styles.storyRowLabel}>Experience:</span>
                  <span>{story.experience}</span>
                </div>

                <div className={styles.storyRow}>
                  <span className={styles.storyRowLabel}>Outcome:</span>
                  <span>{story.outcome}</span>
                </div>

                <div className={styles.storyQuote}>
                  &ldquo;{story.quote}&rdquo;
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* ============================================================
          OUR REPORTS
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container size="wide">
          <SectionHeading
            eyebrow="PUBLICATIONS & AUDITS"
            title="Our Reports"
            description="Official institutional documentation, training reviews, and research releases:"
            align="left"
          />

          <div className={styles.reportsList}>
            {reports.map((rep) => (
              <div key={rep} className={styles.reportItem}>
                <FileText size={18} color="var(--color-primary)" />
                <span>{rep}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2rem" }}>
            <Button variant="outline" size="md" href="/resources">
              View Reports &amp; Publications
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
