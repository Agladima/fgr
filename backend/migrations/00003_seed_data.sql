-- ==============================================================================
-- FGR Career Development Center — Migration 00003: Seed Data
-- ==============================================================================

-- 1. Strategic Programmes (The 5 Pillars)
INSERT INTO public.programmes (slug, title, pillar_number, pillar_name, summary, areas, outcomes, delivery_modalities, order_index, status)
VALUES
  (
    'employability-career-development',
    'Employability & Career Development',
    1,
    'PILLAR 01',
    'We help individuals prepare for employment, navigate career transitions and develop the competencies required to succeed in the workplace.',
    ARRAY[
      'Career guidance and pathways',
      'Career planning and advisory',
      'CV and application support',
      'Interview preparation and simulations',
      'Workplace readiness and corporate ethics',
      'Professional communication',
      'Career coaching and mentorship',
      'Job-readiness cohorts',
      'Internship and employment linkages',
      'Continuous professional development'
    ],
    ARRAY[
      'High job-readiness assessment rate',
      'CV optimization and professional profile setup',
      'Direct linkage to partner employers and recruiters'
    ],
    ARRAY['Classroom training', 'Practical sessions', 'Simulations', 'Mentorship', 'Online learning'],
    1,
    'published'
  ),
  (
    'technical-vocational-skills',
    'Technical & Vocational Skills',
    2,
    'PILLAR 02',
    'We provide practical training that prepares learners for technical roles, vocational enterprises and skilled work.',
    ARRAY[
      'Vocational training streams',
      'Technical skills development',
      'Hands-on workshop instruction',
      'Trade competencies & craft standards',
      'Workplace health and safety (HSE)',
      'Quality standards and craftsmanship',
      'Apprenticeship linkages',
      'Practical tools and equipment mastery',
      'Technical enterprise preparation',
      'Competency assessments and trade testing'
    ],
    ARRAY[
      'Hands-on vocational competence',
      'Industry-recognized trade certifications',
      'Apprenticeship placements across regional firms'
    ],
    ARRAY['Hands-on workshop', 'Practical sessions', 'Field assignments', 'Trade testing'],
    2,
    'published'
  ),
  (
    'digital-skills-innovation',
    'Digital Skills & Innovation',
    3,
    'PILLAR 03',
    'We build digital capabilities to enable participants to participate in the digital economy and leverage modern technologies.',
    ARRAY[
      'Digital literacy foundations',
      'Workplace productivity tools',
      'Data and analytical competencies',
      'Web and mobile design',
      'Cloud and software workflows',
      'Digital entrepreneurship & freelancing',
      'Social media and digital marketing',
      'Applied AI for workplace efficiency',
      'Tech-enabled problem solving',
      'Innovation incubation'
    ],
    ARRAY[
      'Mastery of modern productivity and cloud suites',
      'Remote work and freelance income generation capability',
      'Tech project portfolio development'
    ],
    ARRAY['Bootcamps', 'Online learning', 'Practical sessions', 'Project-based learning'],
    3,
    'published'
  ),
  (
    'entrepreneurship-business-development',
    'Entrepreneurship & Business Development',
    4,
    'PILLAR 04',
    'We support aspiring and existing entrepreneurs to start, manage and grow sustainable businesses.',
    ARRAY[
      'Entrepreneurship fundamentals',
      'Business model development & Canvas',
      'Market research and validation',
      'Financial planning and bookkeeping',
      'Access to finance and investment readiness',
      'Marketing and customer acquisition',
      'Business registration and compliance',
      'Operations and scale management',
      'SME advisory services',
      'Enterprise mentorship and networking'
    ],
    ARRAY[
      'Validated and viable business plans',
      'Formal enterprise registration readiness',
      'Pitch deck and investor-readiness materials'
    ],
    ARRAY['Incubation cohorts', 'Mentorship', 'Simulations', 'Advisory clinics'],
    4,
    'published'
  ),
  (
    'leadership-professional-development',
    'Leadership & Professional Development',
    5,
    'PILLAR 05',
    'We prepare individuals and organisations for leadership roles, high performance and institutional growth.',
    ARRAY[
      'Leadership fundamentals and ethics',
      'Strategic thinking and execution',
      'People and team management',
      'Emotional intelligence and communication',
      'Conflict resolution and negotiation',
      'Project planning and delivery',
      'Executive coaching',
      'Organisational development',
      'Governance and accountability',
      'Change management'
    ],
    ARRAY[
      'Executive decision-making competence',
      'Strategic workforce leadership capability',
      'Enhanced institutional governance and delivery'
    ],
    ARRAY['Executive seminars', 'Masterclasses', 'Peer coaching', 'Case studies'],
    5,
    'published'
  )
ON CONFLICT (slug) DO NOTHING;

-- 2. Impact Metrics
INSERT INTO public.impact_metrics (metric_key, label, value, order_index, is_verified)
VALUES
  ('people_trained', 'People Trained', '2,500+', 1, true),
  ('programmes_delivered', 'Programmes Delivered', '45+', 2, true),
  ('businesses_supported', 'Businesses Supported', '180+', 3, true),
  ('organisations_engaged', 'Organisations Engaged', '60+', 4, true),
  ('projects_implemented', 'Projects Implemented', '35+', 5, true),
  ('partnerships_established', 'Partnerships Established', '25+', 6, true)
ON CONFLICT (metric_key) DO NOTHING;

-- 3. Success Stories
INSERT INTO public.success_stories (name, programme_name, challenge, experience, outcome, quote, order_index, status)
VALUES
  (
    'Samuel Okon (Graduate Trainee)',
    'Employability & Career Development',
    'Transitioning from tertiary education to corporate employment with limited interview exposure.',
    'Completed intensive CV optimization, workplace communication, and employer mock simulations at Calabar Hub.',
    'Secured a competitive role in operations with an infrastructure firm within 3 months of completion.',
    'The practical interview sessions gave me the confidence and competence to articulate my value clearly to employers.',
    1,
    'active'
  ),
  (
    'Blessing Bassey (Digital Innovator)',
    'Digital Skills & Innovation',
    'Lack of commercial digital tools experience and international freelance workflow knowledge.',
    'Hands-on instruction in graphic design, digital marketing, and remote-work toolsets.',
    'Built a sustainable client base offering digital content creation for regional and remote SMEs.',
    'FGR did not just teach theory; they connected our learning to actual client demand and practical earning opportunities.',
    2,
    'active'
  )
ON CONFLICT DO NOTHING;

-- 4. Initial News & Announcements
INSERT INTO public.news_articles (slug, title, category, summary, content, author, status)
VALUES
  (
    '2026-workforce-development-cohort-registration',
    '2026 Workforce Development Cohort Registration Opened in Calabar',
    'Admissions',
    'FGR Career Development Center has officially opened applications for upcoming training streams across technical trades, digital literacy, and employability pathways.',
    'FGR Career Development Center has officially commenced registration for its upcoming 2026 workforce development cohorts. Training takes place at the state-of-the-art Calabar Hub with hybrid and virtual options available. Scholarships and sponsored slots are provided in collaboration with regional institutional partners.',
    'FGR Communications',
    'published'
  ),
  (
    'digital-innovation-bootcamp-calabar',
    'Digital Innovation Bootcamp: AI, Product Tools & Remote Work Readiness',
    'Training & Workshops',
    'An intensive multi-week cohort aimed at equipping young professionals and university graduates with high-demand digital competencies.',
    'This intensive programme addresses critical skills gaps in digital product operations, creative software, and AI productivity tools. Participants will build a capstone portfolio evaluated by industry practitioners.',
    'FGR Tech Team',
    'published'
  ),
  (
    'fgr-institutional-partnership-round',
    'FGR Career Development Center Concludes Institutional Partnership Round',
    'Partnership News',
    'Strategic engagements with local employers, vocational foundations, and academic institutions to scale graduate internship pipelines across Cross River State.',
    'The Centre completed extensive roundtable deliberations with stakeholders from the public and private sectors, consolidating apprenticeship placements and collaborative curriculum frameworks for Cross River youth.',
    'FGR Partnerships Directorate',
    'published'
  )
ON CONFLICT (slug) DO NOTHING;

-- 5. Initial Resources
INSERT INTO public.resources (title, category, description, file_url, format, order_index, status)
VALUES
  ('Modern CV & Cover Letter Architecture', 'Career Resources', 'Comprehensive guide and ATS-ready templates for job seekers and recent graduates.', '/resources/fgr-cv-guide.pdf', 'PDF', 1, 'active'),
  ('SME Business Plan & Cash Flow Toolkit', 'Entrepreneurship & Business Resources', 'Financial forecasting spreadsheets and operational roadmaps for local enterprises.', '/resources/fgr-business-toolkit.xlsx', 'XLSX', 2, 'active'),
  ('Digital Productivity & AI Prompt Handbook', 'Digital Skills Resources', 'Workplace workflows, cloud collaboration guidelines, and responsible AI usage.', '/resources/fgr-digital-guide.pdf', 'PDF', 3, 'active'),
  ('Workforce Development Annual Review', 'Reports & Publications', 'In-depth research on skills acquisition, labour market trends, and economic indicators in Cross River.', '/resources/fgr-annual-report.pdf', 'PDF', 4, 'active')
ON CONFLICT DO NOTHING;
