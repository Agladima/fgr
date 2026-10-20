import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/animations/MotionSection";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerGroup";
import { PRIMARY_CTAS, SITE_METADATA } from "@/lib/constants/navigation";
import { getSupabasePublicClient, isSupabaseConfigured } from "@/lib/server/supabase";
import heroImage from "@/assets/images/hero.jpg";
import aboutImage from "@/assets/images/about.jpg";
import news1Image from "@/assets/images/news1.jpg";
import news2Image from "@/assets/images/news2.jpg";
import news3Image from "@/assets/images/news3.jpg";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Wrench,
  Cpu,
  TrendingUp,
  Award,
  GraduationCap,
  Building2,
  Handshake,
} from "lucide-react";

export default async function Home() {
  const lceApproach = [
    {
      pillar: "LEARN",
      subtitle: "Skills Acquisition",
      text: "Acquire practical, technical, digital, entrepreneurial and professional skills relevant to today's economy.",
    },
    {
      pillar: "CONNECT",
      subtitle: "Network & Access",
      text: "Connect with employers, businesses, mentors, institutions, professional networks and opportunities at local, national and international levels.",
    },
    {
      pillar: "EARN",
      subtitle: "Economic Progress",
      text: "Translate skills and capabilities into employment, entrepreneurship, business growth and professional advancement.",
    },
  ];

  const strategicPillars = [
    {
      number: "01",
      title: "Employability & Career Development",
      description:
        "Preparing individuals for employment, career progression and the changing world of work.",
      icon: <Briefcase size={22} />,
      href: "/programmes#employability",
    },
    {
      number: "02",
      title: "Technical & Vocational Skills",
      description:
        "Providing practical and market-relevant skills that can lead to employment, livelihoods and enterprise.",
      icon: <Wrench size={22} />,
      href: "/programmes#vocational",
    },
    {
      number: "03",
      title: "Digital Skills & Innovation",
      description:
        "Building digital capabilities and preparing participants for opportunities in the digital economy.",
      icon: <Cpu size={22} />,
      href: "/programmes#digital",
    },
    {
      number: "04",
      title: "Entrepreneurship & Business Development",
      description:
        "Supporting individuals and businesses to develop, grow and sustain viable enterprises.",
      icon: <TrendingUp size={22} />,
      href: "/programmes#entrepreneurship",
    },
    {
      number: "05",
      title: "Leadership & Professional Development",
      description:
        "Building the leadership, communication, management and professional competencies required for advancement.",
      icon: <Award size={22} />,
      href: "/programmes#leadership",
    },
  ];

  const audiences = [
    {
      title: "Young People",
      description: "Building skills, career readiness and pathways to opportunity.",
      icon: <GraduationCap size={22} />,
    },
    {
      title: "Job Seekers",
      description: "Developing employability and workplace competencies.",
      icon: <Briefcase size={22} />,
    },
    {
      title: "Entrepreneurs & SMEs",
      description: "Supporting business development, capacity building and enterprise growth.",
      icon: <TrendingUp size={22} />,
    },
    {
      title: "Professionals",
      description: "Supporting continued learning, leadership and professional advancement.",
      icon: <Award size={22} />,
    },
    {
      title: "Employers",
      description: "Supporting workforce development and access to capable talent.",
      icon: <Building2 size={22} />,
    },
    {
      title: "Organisations & Institutions",
      description: "Providing project management, organisational support and technical assistance.",
      icon: <Handshake size={22} />,
    },
  ];

  const sampleNews = [
    {
      title: "2026 Workforce Cohort Intake Now Open",
      category: "Admissions",
      date: "October 2026",
      description:
        "Applications are now open for technical, digital, and employability training programmes at FGR Career Development Center.",
      href: "/news-events",
      image: news1Image,
      imageAlt: "Facilitator leading an employability workshop",
    },
    {
      title: "Digital Skills & Innovation Bootcamps Announced",
      category: "Programmes",
      date: "September 2026",
      description:
        "Intensive training in graphic design, computer applications, digital marketing, and remote-work readiness.",
      href: "/news-events",
      image: news2Image,
      imageAlt: "Panel discussion at a workforce development event",
    },
    {
      title: "FGR Expands Institutional Partnership Network",
      category: "Partnerships",
      date: "August 2026",
      description:
        "Collaborations established with private sector employers and development institutions to expand direct graduate placement.",
      href: "/news-events",
      image: news3Image,
      imageAlt: "Professional reviewing performance data on a laptop",
    },
  ];

  let displayedNews = sampleNews;
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabasePublicClient();
      const { data } = await supabase
        .from("news_articles")
        .select("title, category, summary, published_at, featured_image_url")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);

      if (data?.length) {
        displayedNews = data.map((article, index) => ({
          title: article.title,
          category: article.category,
          date: new Date(article.published_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          description: article.summary,
          href: "/news-events",
          image: article.featured_image_url || [news1Image, news2Image, news3Image][index % 3],
          imageAlt: `${article.title} news image`,
        }));
      }
    } catch {
      // Keep the curated fallback news when the public database is unavailable.
    }
  }

  return (
    <>
      {/* ============================================================
          1. HERO SECTION
          ============================================================ */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGlowSecondary} aria-hidden="true" />
        <div className={styles.heroMedia}>
          <Image
            src={heroImage}
            alt="Career development workshop in progress"
            fill
            priority
            sizes="100vw"
          />
        </div>

        <Container size="wide">
          <div className={styles.heroLayout}>
            <MotionSection direction="up" duration={0.65} delay={0.05}>
              <div className={styles.heroContent}>
              {/* Brand Tagline */}
              <div className={styles.heroTaglinePill}>
                <span className={styles.heroTaglineDot} />
                <span>{SITE_METADATA.tagline}</span>
              </div>

              {/* Headline */}
              <h1 id="hero-heading" className={styles.heroTitle}>
                <span className={styles.heroTitleLine}>Equipping People with Skills.</span>
                <span className={styles.heroTitleLine}>Connecting Them to Opportunities.</span>
              </h1>

              {/* Official Description */}
              <p className={styles.heroLead}>
                <span className={styles.heroLeadLine}>
                  <strong>FGR Career Development Center</strong> is a workforce-development institution focused on equipping young people and adults with practical skills,
                </span>
                <span className={styles.heroLeadLine}>
                  professional competencies and entrepreneurial capacity for employment, enterprise and meaningful economic participation.
                </span>
              </p>

              <p className={styles.heroSubtext}>
                <span className={styles.heroSubtextLine}>
                  We provide training, skills development, enterprise support, professional development and project-related services
                </span>
                <span className={styles.heroSubtextLine}>
                  while connecting individuals and organisations with opportunities for growth, collaboration and advancement.
                </span>
              </p>

              {/* Prominent Action Buttons */}
              <div className={styles.heroActions}>
                <Button
                  variant="secondary"
                  size="lg"
                  href={PRIMARY_CTAS.register.href}
                  rightIcon={<ArrowUpRight size={18} />}
                  className={styles.heroRegisterBtn}
                >
                  {PRIMARY_CTAS.register.label}
                </Button>

                <Button
                  variant="outline-pearl"
                  size="lg"
                  href={PRIMARY_CTAS.partner.href}
                  className={styles.heroPartnerBtn}
                >
                  {PRIMARY_CTAS.partner.label}
                </Button>
              </div>
              </div>
            </MotionSection>
          </div>
        </Container>
      </section>

      {/* ============================================================
          2. WHY FGR CAREER DEVELOPMENT CENTER? — From Learning to Opportunity
          ============================================================ */}
      <section className={styles.section} aria-labelledby="why-heading">
        <Container size="wide">
          <MotionSection direction="up" delay={0}>
            <div className={styles.whyHeader}>
              <SectionHeading
                eyebrow="WHY FGR CAREER DEVELOPMENT CENTER?"
                title={<span id="why-heading">From Learning to Opportunity</span>}
                align="left"
              />
              <p className={styles.whyHighlight}>
                Training should not end with a certificate.
              </p>
              <p className={styles.whyDescription}>
                We believe that meaningful development happens when people can acquire
                relevant skills, connect those skills to real opportunities and use
                them to improve their economic and professional lives.
              </p>
            </div>
          </MotionSection>

          <StaggerGroup className={styles.lceGrid} staggerDelay={0.1}>
            {lceApproach.map((item) => (
              <StaggerItem key={item.pillar} className={styles.lceCard}>
                <div className={styles.lceTag}>
                  <span>{item.pillar}</span>
                  <span className={styles.lceBadge}>{item.subtitle}</span>
                </div>
                <p className={styles.lceText}>{item.text}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* ============================================================
          3. ABOUT FGR CAREER DEVELOPMENT CENTER — Who We Are
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="about-heading">
        <Container size="wide">
          <MotionSection direction="up">
            <div className={styles.aboutCard}>
              <div className={styles.aboutGrid}>
                <div>
                  <SectionHeading
                    eyebrow="ABOUT FGR CAREER DEVELOPMENT CENTER"
                    title={<span id="about-heading">Who We Are</span>}
                    theme="dark"
                    align="left"
                  />
                  <p className={styles.aboutParagraph}>
                    FGR Career Development Center is a workforce-development
                    institution with established competencies in training, skills
                    development, entrepreneurship, professional development and
                    programme implementation.
                  </p>
                  <p className={styles.aboutParagraph}>
                    The Centre also provides project management, organisational support
                    and technical assistance to partners implementing development and
                    capacity-building initiatives.
                  </p>
                  <p className={styles.aboutParagraph}>
                    We work with individuals, businesses, institutions, government,
                    development organisations, professional bodies and other partners
                    to create pathways to skills, employment, enterprise and
                    professional opportunity.
                  </p>

                  <div className={styles.aboutAction}>
                    <Button
                      variant="secondary"
                      size="md"
                      href="/about"
                      rightIcon={<ArrowRight size={16} />}
                    >
                      Learn More About Us
                    </Button>
                  </div>
                </div>
                <div className={styles.aboutMedia}>
                  <Image
                    src={aboutImage}
                    alt="Career coaching conversation between two professionals"
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          4. OUR STRATEGIC FOCUS — Five Strategic Pillars
          ============================================================ */}
      <section className={styles.section} aria-labelledby="pillars-heading">
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="OUR STRATEGIC FOCUS"
              title={<span id="pillars-heading">Five Strategic Pillars</span>}
              description="Our programmes and initiatives are organised around five strategic pillars designed to create measurable pathways to growth."
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.pillarsGrid} staggerDelay={0.08}>
            {strategicPillars.map((pillar) => (
              <StaggerItem key={pillar.number} className={styles.pillarCard}>
                <div className={styles.pillarNumber}>{pillar.number}</div>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarDescription}>{pillar.description}</p>
                <Link href={pillar.href} className={styles.pillarAction}>
                  <span>Explore details</span>
                  <ArrowRight size={15} />
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <MotionSection direction="up" delay={0.2}>
            <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
              <Button variant="primary" size="lg" href="/programmes">
                Explore Our Programmes
              </Button>
            </div>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          5. WHO WE SERVE
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="audiences-heading">
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="TARGET AUDIENCES"
              title={<span id="audiences-heading">Who We Serve</span>}
              description="FGR Career Development Center delivers tailored programmes and institutional solutions across key segments:"
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.audiencesGrid} staggerDelay={0.07}>
            {audiences.map((aud) => (
              <StaggerItem key={aud.title} className={styles.audienceCard}>
                <div style={{ color: "var(--color-primary)", marginBottom: "0.75rem" }}>
                  {aud.icon}
                </div>
                <h3 className={styles.audienceTitle}>{aud.title}</h3>
                <p className={styles.audienceDesc}>{aud.description}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* ============================================================
          6. PARTNERSHIPS — Stronger Together
          ============================================================ */}
      <section className={styles.section} aria-labelledby="partner-banner-heading">
        <Container size="wide">
          <MotionSection direction="up">
            <div className={styles.partnerBanner}>
              <div className={styles.partnerContent}>
                <SectionHeading
                  eyebrow="PARTNERSHIPS"
                  title={<span id="partner-banner-heading">Stronger Together</span>}
                  align="left"
                />
                <p className={styles.partnerHeading}>
                  Sustainable workforce development requires collaboration.
                </p>
                <p className={styles.partnerText}>
                  FGR Career Development Center welcomes partnerships with government
                  institutions, private-sector organisations, international development
                  organisations, foundations, universities, professional bodies,
                  employers and other institutions committed to expanding access to
                  skills and opportunities.
                </p>
              </div>
              <div>
                <Button
                  variant="primary"
                  size="lg"
                  href="/partnership-enquiry"
                  rightIcon={<ArrowUpRight size={18} />}
                >
                  Partner With Us
                </Button>
              </div>
            </div>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          7. LATEST NEWS & EVENTS
          ============================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="news-heading">
        <Container size="wide">
          <MotionSection direction="up">
            <SectionHeading
              eyebrow="LATEST UPDATES"
              title={<span id="news-heading">Latest News &amp; Events</span>}
              description="Stay informed about upcoming cohorts, training sessions, and institutional developments."
              align="left"
            />
          </MotionSection>

          <StaggerGroup className={styles.newsGrid} staggerDelay={0.1}>
            {displayedNews.map((news) => (
              <StaggerItem key={news.title}>
                <article className={styles.newsCard}>
                  <div className={styles.newsImage}>
                    <Image src={news.image} alt={news.imageAlt} fill sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw" />
                  </div>
                  <div className={styles.newsOverlay}>
                    <div className={styles.newsMeta}>
                      <span className={styles.newsCategory}>{news.category}</span>
                      <span>{news.date}</span>
                    </div>
                    <h3 className={styles.newsTitle}>{news.title}</h3>
                    <p className={styles.newsExcerpt}>{news.description}</p>
                    <Link href={news.href} className={styles.newsLink}>
                      <span>Read update</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <MotionSection direction="up" delay={0.15}>
            <div style={{ textAlign: "center" }}>
              <Button variant="outline" size="md" href="/news-events">
                View All News &amp; Events
              </Button>
            </div>
          </MotionSection>
        </Container>
      </section>

      {/* ============================================================
          8. HOME PAGE FINAL CALL TO ACTION
          ============================================================ */}
      <section className={styles.finalCta} aria-labelledby="final-cta-heading">
        <Container size="wide">
          <MotionSection direction="up" duration={0.6}>
            <div className={styles.finalCtaContainer}>
              <h2 id="final-cta-heading" className={styles.finalCtaHeading}>
                Your Next Opportunity Starts With a Skill.
              </h2>
              <p className={styles.finalCtaText}>
                Whether you are looking to develop new skills, advance your career,
                strengthen your business or explore partnership opportunities, FGR
                Career Development Center is ready to connect you to the next step.
              </p>
              <div className={styles.finalCtaActions}>
                <Button
                  variant="secondary"
                  size="lg"
                  href={PRIMARY_CTAS.register.href}
                  rightIcon={<ArrowUpRight size={18} />}
                >
                  {PRIMARY_CTAS.register.label}
                </Button>
                <Button
                  variant="outline-pearl"
                  size="lg"
                  href={PRIMARY_CTAS.partner.href}
                >
                  {PRIMARY_CTAS.partner.label}
                </Button>
              </div>
            </div>
          </MotionSection>
        </Container>
      </section>
    </>
  );
}
