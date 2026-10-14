export interface NavDropdownChild {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  children?: NavDropdownChild[];
}

export const DESKTOP_NAV_ITEMS: NavItem[] = [
  { label: "About", href: "/about" },
  {
    label: "Programmes & Services",
    children: [
      {
        label: "Training Programmes",
        href: "/programmes",
        description: "Employability, vocational skills, digital innovation & leadership",
      },
      {
        label: "Professional Services",
        href: "/professional-services",
        description: "Workforce advisory, executive training & institutional solutions",
      },
    ],
  },
  { label: "Partnerships", href: "/partnerships" },
  { label: "Impact", href: "/impact" },
  {
    label: "Insights",
    children: [
      {
        label: "Resources & Toolkits",
        href: "/resources",
        description: "Career guides, downloadable templates & whitepapers",
      },
      {
        label: "News & Events",
        href: "/news-events",
        description: "Workshops, announcements & cohort registrations",
      },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export const MAIN_NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Programmes", href: "/programmes" },
  { label: "Professional Services", href: "/professional-services" },
  { label: "Partnerships", href: "/partnerships" },
  { label: "Impact", href: "/impact" },
  { label: "Resources", href: "/resources" },
  { label: "News & Events", href: "/news-events" },
  { label: "Contact Us", href: "/contact" },
];

export const PRIMARY_CTAS = {
  register: {
    label: "Register for Training",
    href: "/register",
  },
  partner: {
    label: "Partner With Us",
    href: "/partnership-enquiry",
  },
};

export const SITE_METADATA = {
  name: "FGR Career Development Center",
  shortName: "FGR Center",
  tagline: "LEARN • CONNECT • EARN",
  description:
    "Empowering youth, professionals, and institutions through employability, vocational training, digital innovation, and career leadership.",
};
