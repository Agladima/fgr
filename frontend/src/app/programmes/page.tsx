import React from "react";
import type { Metadata } from "next";
import styles from "./programmes.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/animations/MotionSection";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerGroup";
import { PRIMARY_CTAS } from "@/lib/constants/navigation";
import { getSupabasePublicClient, isSupabaseConfigured } from "@/lib/server/supabase";
import {
  CheckCircle2,
  ArrowUpRight,
  Wrench,
  Cpu,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Explore training, technical, vocational, digital, and entrepreneurship programmes across our strategic pillars.",
};

export const instant = false;

interface PublicProgramme {
  id: string;
  slug: string;
  title: string;
  pillar_number: number;
  pillar_name: string;
  summary: string;
  description?: string | null;
  areas?: string[];
  outcomes?: string[];
  target_audience?: string | null;
  duration?: string | null;
  delivery_modalities?: string[];
  application_open_date?: string | null;
  application_close_date?: string | null;
  eligibility?: string | null;
  application_instructions?: string | null;
  registration_url?: string | null;
  status: string;
}

const fallbackProgrammes: PublicProgramme[] = [
  {
    id: "p1",
    slug: "employability-career-development",
    pillar_number: 1,
    pillar_name: "PILLAR 01",
    title: "Employability & Career Development",
    summary:
      "We help individuals prepare for employment, navigate career transitions and develop the competencies required to succeed in the workplace.",
    description:
      "Comprehensive workplace-readiness and employment transition coaching covering CV design, mock interview simulations, and recruiter connections.",
    areas: [
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
    ],
    status: "open",
    registration_url: "/register",
  },
  {
    id: "p2",
    slug: "technical-vocational-skills",
    pillar_number: 2,
    pillar_name: "PILLAR 02",
    title: "Technical & Vocational Skills",
    summary:
      "We support practical skills acquisition aligned with market needs, employment opportunities and enterprise development.",
    description:
      "Hands-on trade instruction and technical craftsmanship preparing participants for immediate commercial productivity.",
    areas: [
      "Hospitality & Catering",
      "Fashion and tailoring",
      "Electrical and technical trades",
      "Renewable energy and solar installation",
      "Practical trade skills",
      "Market-driven vocational crafts",
    ],
    status: "open",
    registration_url: "/register",
  },
  {
    id: "p3",
    slug: "digital-skills-innovation",
    pillar_number: 3,
    pillar_name: "PILLAR 03",
    title: "Digital Skills & Innovation",
    summary:
      "We equip individuals with digital capabilities to participate in the modern technology-driven economy.",
    description:
      "Equipping youth and professionals with modern cloud tools, remote work methodologies, and productive digital workflows.",
    areas: [
      "Digital literacy foundations",
      "Workplace productivity tools & suites",
      "Data and analytical skills",
      "Digital marketing and communication",
      "Remote work workflows & freelancing",
      "Applied AI for workplace efficiency",
    ],
    status: "open",
    registration_url: "/register",
  },
  {
    id: "p4",
    slug: "entrepreneurship-business-development",
    pillar_number: 4,
    pillar_name: "PILLAR 04",
    title: "Entrepreneurship & Business Development",
    summary:
      "We support aspiring entrepreneurs and existing micro-enterprises to start, manage and grow viable businesses.",
    description:
      "Structured venture building support from business model generation to financial accounting and investor readiness.",
    areas: [
      "Business planning and strategy",
      "Entrepreneurship toolkits",
      "Financial management & bookkeeping",
      "Access to finance advisory",
      "Business registration and formalization",
      "Enterprise growth coaching",
    ],
    status: "open",
    registration_url: "/register",
  },
  {
    id: "p5",
    slug: "leadership-professional-development",
    pillar_number: 5,
    pillar_name: "PILLAR 05",
    title: "Leadership & Professional Development",
    summary:
      "We build leadership competencies, managerial skills and continuous professional development for high performance.",
    description:
      "Strategic executive workshops focusing on team leadership, ethical institutional governance, and high-impact execution.",
    areas: [
      "Leadership development",
      "Management competencies",
      "Communication and presentation",
      "Project management fundamentals",
      "Workplace emotional intelligence",
      "Institutional governance",
    ],
    status: "open",
    registration_url: "/register",
  },
];

async function getPublishedProgrammes(): Promise<PublicProgramme[]> {
  if (!isSupabaseConfigured()) return fallbackProgrammes;

  try {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("programmes")
      .select("*")
      .in("status", ["published", "open", "closing_soon", "closed", "completed"])
      .order("pillar_number", { ascending: true })
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return fallbackProgrammes;

    return data.map((p) => {
      // Check if application closing date has passed
      let effectiveStatus = p.status;
      if (p.application_close_date && new Date(p.application_close_date) < new Date()) {
        if (effectiveStatus === "open" || effectiveStatus === "closing_soon" || effectiveStatus === "published") {
          effectiveStatus = "closed";
        }
      }

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        pillar_number: p.pillar_number,
        pillar_name: p.pillar_name || `PILLAR 0${p.pillar_number}`,
        summary: p.summary,
        description: p.description,
        areas: Array.isArray(p.areas) && p.areas.length > 0 ? p.areas : [],
        outcomes: Array.isArray(p.outcomes) ? p.outcomes : [],
        target_audience: p.target_audience,
        duration: p.duration,
        delivery_modalities: p.delivery_modalities,
        application_open_date: p.application_open_date,
        application_close_date: p.application_close_date,
        eligibility: p.eligibility,
        application_instructions: p.application_instructions,
        registration_url: p.registration_url || "/register",
        status: effectiveStatus,
      };
    });
  } catch {
    return fallbackProgrammes;
  }
}

export default async function ProgrammesPage() {
  const programmes = await getPublishedProgrammes();

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
              FGR Career Development Center&apos;s programmes are organised around strategic pillars.
              We equip participants with practical capabilities and verified credentials for employment,
              enterprise, and leadership.
            </p>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          PROGRAMMES LISTING
          ============================================================ */}
      <section className={styles.section}>
        <Container size="wide">
          {programmes.map((prog, index) => {
            const isClosed = prog.status === "closed" || prog.status === "completed";
            const isClosingSoon = prog.status === "closing_soon";

            return (
              <MotionSection key={prog.id} direction="up" delay={index * 0.05}>
                <div id={prog.slug} className={styles.programmeBlock}>
                  <div className={styles.programmeHeader}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                      <span className={styles.programmePill}>{prog.pillar_name}</span>
                      {isClosed ? (
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b", background: "#fee2e2", padding: "4px 10px", borderRadius: 999 }}>
                          Applications Closed
                        </span>
                      ) : isClosingSoon ? (
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", background: "#fef3c7", padding: "4px 10px", borderRadius: 999 }}>
                          Closing Soon {prog.application_close_date ? `(Deadline: ${new Date(prog.application_close_date).toLocaleDateString()})` : ""}
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "4px 10px", borderRadius: 999 }}>
                          Accepting Applications
                        </span>
                      )}
                    </div>

                    <h2 className={styles.programmeTitle}>{prog.title}</h2>
                    <p className={styles.programmeLead}>{prog.summary}</p>
                  </div>

                  {prog.areas && prog.areas.length > 0 && (
                    <>
                      <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "1rem" }}>
                        Programme Areas &amp; Curriculum
                      </h3>
                      <StaggerGroup className={styles.areaGrid} staggerDelay={0.04}>
                        {prog.areas.map((area) => (
                          <StaggerItem key={area} className={styles.areaItem}>
                            <CheckCircle2 size={16} className={styles.areaIcon} />
                            <span>{area}</span>
                          </StaggerItem>
                        ))}
                      </StaggerGroup>
                    </>
                  )}

                  {prog.description && (
                    <div className={styles.goalBox}>
                      <div className={styles.goalLabel}>Curriculum Focus</div>
                      <p className={styles.goalText}>{prog.description}</p>
                    </div>
                  )}

                  <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {isClosed ? (
                      <Button
                        variant="secondary"
                        size="md"
                        href={`/contact?subject=Waitlist+Interest+for+${encodeURIComponent(prog.title)}`}
                      >
                        Join Waitlist for Next Cohort
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        href={prog.registration_url || PRIMARY_CTAS.register.href}
                        rightIcon={<ArrowUpRight size={16} />}
                      >
                        Apply for this Programme
                      </Button>
                    )}

                    {prog.duration && (
                      <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                        Duration: {prog.duration}
                      </span>
                    )}
                  </div>
                </div>
              </MotionSection>
            );
          })}
        </Container>
      </section>

      {/* ============================================================
          DELIVERY MODALITIES
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="METHODOLOGY"
              title="How We Deliver Our Programmes"
              description="A multi-format approach combining theory, practical application and continuous mentorship:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.modalitiesGrid} staggerDelay={0.05}>
            {deliveryModalities.map((m) => (
              <StaggerItem key={m} className={styles.modalityCard}>
                <CheckCircle2 size={18} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                <span>{m}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>
    </>
  );
}
