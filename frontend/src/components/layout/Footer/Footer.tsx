"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { MAIN_NAV_ITEMS, PRIMARY_CTAS, SITE_METADATA } from "@/lib/constants/navigation";
import logoImage from "@/assets/images/fgr logo.jpeg";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const [currentYear, setCurrentYear] = useState<number>(2026);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentYear(new Date().getFullYear());
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const servicePillars = [
    "Training & Skills Development",
    "SME & Enterprise Support",
    "Project Management & Support",
    "Professional & Institutional Services",
    "Youth & Workforce Empowerment",
  ];

  const socialLinks = [
    { label: "Facebook", href: "https://facebook.com", icon: <FacebookIcon /> },
    { label: "LinkedIn", href: "https://linkedin.com", icon: <LinkedinIcon /> },
    { label: "Instagram", href: "https://instagram.com", icon: <InstagramIcon /> },
    { label: "YouTube", href: "https://youtube.com", icon: <YoutubeIcon /> },
    { label: "X / Twitter", href: "https://x.com", icon: <XIcon /> },
  ];

  return (
    <footer className={styles.footer} role="contentinfo">
      {/* Top Pre-Footer Call to Action Strip */}
      <div className={styles.ctaStrip}>
        <Container size="wide" className={styles.ctaStripContainer}>
          <div className={styles.ctaContent}>
            <span className={styles.ctaBadge}>YOUR NEXT STEP</span>
            <h2 className={styles.ctaHeading}>
              Your Next Opportunity Starts With a Skill.
            </h2>
            <p className={styles.ctaSubtext}>
              Whether you are looking to develop new skills, advance your career,
              strengthen your business or explore partnership opportunities,
              FGR Career Development Center is ready to connect you to the next step.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Button
              variant="secondary"
              size="lg"
              href={PRIMARY_CTAS.register.href}
              rightIcon={<ArrowUpRight size={18} />}
              className={styles.ctaBtnPrimary}
            >
              {PRIMARY_CTAS.register.label}
            </Button>
            <Button
              variant="outline-pearl"
              size="lg"
              href={PRIMARY_CTAS.partner.href}
              className={styles.ctaBtnSecondary}
            >
              {PRIMARY_CTAS.partner.label}
            </Button>
          </div>
        </Container>
      </div>

      {/* Main Footer Links & Info */}
      <div className={styles.mainFooter}>
        <Container size="wide">
          <div className={styles.grid}>
            {/* Column 1: Organization Overview */}
            <div className={styles.orgColumn}>
              <div className={styles.logoGroup}>
                <div className={styles.logoMark}>
                  <Image src={logoImage} alt="FGR" fill sizes="44px" />
                </div>
                <div className={styles.logoText}>
                  <span className={styles.logoTitle}>FGR CAREER DEVELOPMENT</span>
                  <span className={styles.logoSubtitle}>CENTER</span>
                </div>
              </div>

              <div className={styles.taglinePill}>
                <span>{SITE_METADATA.tagline}</span>
              </div>

              <p className={styles.orgSubServices}>
                Training • SME Support • Skills Development • Project Support • Professional Services
              </p>

              <p className={styles.orgDescription}>
                A workforce-development institution equipping young people and adults
                with practical skills, professional competencies, and entrepreneurial
                capacity for employment, enterprise, and economic participation in
                Cross River State and beyond.
              </p>

              <div className={styles.socialRow}>
                <span className={styles.socialLabel}>Follow Us:</span>
                <div className={styles.socialIcons}>
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialIconLink}
                      aria-label={`Follow FGR on ${social.label}`}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className={styles.linksColumn}>
              <h3 className={styles.columnTitle}>Quick Links</h3>
              <ul className={styles.linkList}>
                {MAIN_NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.footerLink}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Focus & Get Involved */}
            <div className={styles.linksColumn}>
              <h3 className={styles.columnTitle}>Get Involved</h3>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/register" className={styles.footerLinkHighlight}>
                    Register for Training →
                  </Link>
                </li>
                <li>
                  <Link href="/partnership-enquiry" className={styles.footerLinkHighlight}>
                    Partner With Us →
                  </Link>
                </li>
              </ul>

              <h4 className={styles.columnSubTitle}>Core Competencies</h4>
              <ul className={styles.linkList}>
                {servicePillars.map((pillar) => (
                  <li key={pillar} className={styles.competencyItem}>
                    <span className={styles.competencyBullet}>•</span>
                    <span>{pillar}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact & Location */}
            <div className={styles.contactColumn}>
              <h3 className={styles.columnTitle}>Contact &amp; Location</h3>
              <ul className={styles.contactList}>
                <li className={styles.contactItem}>
                  <MapPin size={18} className={styles.contactIcon} />
                  <div>
                    <span className={styles.contactLabel}>Location:</span>
                    <span className={styles.contactVal}>
                      Calabar, Cross River State, Nigeria
                    </span>
                  </div>
                </li>
                <li className={styles.contactItem}>
                  <Mail size={18} className={styles.contactIcon} />
                  <div>
                    <span className={styles.contactLabel}>Email:</span>
                    <span className={styles.contactVal}>
                      info@fgrcdc.org.ng (Enquiries)
                    </span>
                  </div>
                </li>
                <li className={styles.contactItem}>
                  <Phone size={18} className={styles.contactIcon} />
                  <div>
                    <span className={styles.contactLabel}>Phone:</span>
                    <span className={styles.contactVal}>
                      +234 (0) 800 000 0000
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Copyright & Legal Bar */}
      <div className={styles.bottomBar}>
        <Container size="wide" className={styles.bottomBarContainer}>
          <div className={styles.copyright}>
            © {currentYear ?? 2026} FGR Career Development Center. All Rights Reserved. • Calabar, Cross River State, Nigeria
          </div>

          <div className={styles.taglineCenter}>
            <strong>LEARN • CONNECT • EARN</strong>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
