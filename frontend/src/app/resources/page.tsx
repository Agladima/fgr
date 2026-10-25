import React from "react";
import type { Metadata } from "next";
import styles from "./resources.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/animations/MotionSection";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerGroup";
import { getSupabasePublicClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { ArrowUpRight, Download, FileText, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Resources & Toolkits",
  description:
    "Knowledge, tools, and opportunities: career guides, business planning, digital skillkits, funding opportunities, and research publications.",
};

export const instant = false;

interface PublicResource {
  id: string;
  title: string;
  category: string;
  description: string;
  file_url?: string | null;
  external_link?: string | null;
  format: string;
}

const fallbackDirectResources: PublicResource[] = [
  {
    id: "r1",
    title: "Modern CV & Cover Letter Architecture",
    category: "Career Resources",
    description: "Comprehensive guide and ATS-ready templates for job seekers and recent graduates.",
    file_url: "/resources/fgr-cv-guide.pdf",
    format: "PDF",
  },
  {
    id: "r2",
    title: "SME Business Plan & Cash Flow Toolkit",
    category: "Entrepreneurship & Business Resources",
    description: "Financial forecasting spreadsheets and operational roadmaps for local enterprises.",
    file_url: "/resources/fgr-business-toolkit.xlsx",
    format: "XLSX",
  },
  {
    id: "r3",
    title: "Digital Productivity & AI Prompt Handbook",
    category: "Digital Skills Resources",
    description: "Workplace workflows, cloud collaboration guidelines, and responsible AI usage.",
    file_url: "/resources/fgr-digital-guide.pdf",
    format: "PDF",
  },
  {
    id: "r4",
    title: "Workforce Development Annual Review",
    category: "Reports & Publications",
    description: "In-depth research on skills acquisition, labour market trends, and economic indicators in Cross River.",
    file_url: "/resources/fgr-annual-report.pdf",
    format: "PDF",
  },
];

async function getPublishedResources(): Promise<PublicResource[]> {
  if (!isSupabaseConfigured()) return fallbackDirectResources;

  try {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("resources")
      .select("id, title, category, description, file_url, external_link, format")
      .in("status", ["active", "published"])
      .eq("is_confidential", false)
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return fallbackDirectResources;
    return data;
  } catch {
    return fallbackDirectResources;
  }
}

export default async function ResourcesPage() {
  const liveResources = await getPublishedResources();

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
      action: "Inquire About Career Materials",
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
      action: "Inquire About Business Guides",
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
      action: "Inquire About Digital Toolkits",
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
      action: "View Opportunities & News",
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
      action: "Inquire About Organisational Toolkits",
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
      action: "Inquire About Research Releases",
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
          DIRECT DOWNLOADABLE PUBLICATIONS & GUIDES
          ============================================================ */}
      {liveResources.length > 0 && (
        <section className={styles.section} style={{ paddingBottom: "1.5rem" }}>
          <Container size="wide">
            <MotionSection direction="up">
              <SectionHeading
                eyebrow="FEATURED TOOLKITS"
                title="Downloadable Guides &amp; Frameworks"
                description="Access practical toolkits, curriculum guides, and official reports prepared by the Centre:"
                align="left"
              />
            </MotionSection>

            <StaggerGroup className={styles.resourcesGrid} staggerDelay={0.07}>
              {liveResources.map((res) => {
                const targetUrl = res.file_url || res.external_link || "/contact?subject=" + encodeURIComponent(res.title);
                return (
                  <StaggerItem key={res.id} className={styles.resourceCard}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", background: "rgba(22, 88, 123, 0.08)", padding: "3px 8px", borderRadius: 4 }}>
                        {res.category}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                        {res.format}
                      </span>
                    </div>

                    <h3 className={styles.resourceTitle} style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                      {res.title}
                    </h3>
                    <p className={styles.resourceDesc} style={{ marginBottom: "1.5rem" }}>
                      {res.description}
                    </p>

                    <div style={{ marginTop: "auto" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        href={targetUrl}
                        external={Boolean(res.file_url || res.external_link)}
                        rightIcon={res.file_url ? <Download size={14} /> : <ExternalLink size={14} />}
                      >
                        {res.file_url ? `Download ${res.format}` : "Access Resource"}
                      </Button>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </Container>
        </section>
      )}

      {/* ============================================================
          RESOURCES CATALOGUE
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="RESOURCE DOMAINS"
              title="Curated Knowledge Domains"
              description="Explore structured subject areas and advisory support across our strategic focus areas:"
              align="left"
            />
          </MotionSection>

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
