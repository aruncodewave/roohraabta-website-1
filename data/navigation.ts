export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  children?: NavChild[];
};

export const primaryNav: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  {
    id: "about",
    label: "About us",
    children: [
      { label: "About us", href: "/about" },
      { label: "Founder's Note", href: "/about/story" },
      { label: "Our Team", href: "/about/team" },
    ],
  },
  { id: "memberships", label: "Our Memberships", href: "/membership" },
  { id: "advisory", label: "The Advisory Council", href: "/advisory-council" },
  { id: "begin", label: "Begin Your Journey", href: "/contact" },
  { id: "faqs", label: "Frequently Asked Questions", href: "/faqs" },
  {
    id: "media",
    label: "Media",
    children: [
      { label: "Press Coverage", href: "/media/press" },
      { label: "Blog", href: "/media/blog" },
      { label: "Videos", href: "/media/videos" },
      { label: "Podcasts", href: "/media/podcasts" },
    ],
  },
  { id: "contact", label: "Contact Us", href: "/contact#offices" },
];

export const memberLogin = {
  label: "Member Login",
  href: "https://dev-webapp.vowsforeternity.com/login",
};

function navItem(id: string) {
  const item = primaryNav.find((entry) => entry.id === id);
  if (!item?.href) throw new Error(`Missing navigation item ${id}`);
  return { label: item.label, href: item.href };
}

function navChild(id: string, label: string) {
  const child = primaryNav.find((entry) => entry.id === id)?.children?.find((entry) => entry.label === label);
  if (!child) throw new Error(`Missing navigation item ${label}`);
  return child;
}

const about = primaryNav.find((entry) => entry.id === "about");

export const footerMenuRows = [
  [navItem("home"), { label: about?.label ?? "About us", href: "/about" }],
  [
    { label: "Vows for Eternity Select", href: "/membership/select" },
    { label: "Vows for Eternity Privé", href: "/membership/prive" },
  ],
  [navItem("advisory"), navItem("faqs")],
  [navChild("media", "Blog"), navChild("media", "Press Coverage"), navItem("begin")],
];

export type FooterCity = {
  label: string;
  href: string;
};

export type FooterService = {
  label: string;
  href: string;
  cities: FooterCity[];
};

export const footerNav = {
  copyright: "© Vowsofeternity Lorem ipsum dolor st amiet",
  legal: [
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Accessibility Statement", href: "/accessibility" },
  ],
  services: [
    {
      label: "Dubai",
      href: "/elite-matchmaker-near-me/uae",
      cities: [{ label: "Dubai", href: "/elite-matchmaker-near-me/uae/dubai" }],
    },
    {
      label: "United Kingdom",
      href: "/elite-matchmaker-near-me/united-kingdom",
      cities: [{ label: "London", href: "/elite-matchmaker-near-me/united-kingdom/london" }],
    },
    {
      label: "India",
      href: "/elite-matchmaker-near-me/india",
      cities: [
        { label: "Delhi", href: "/elite-matchmaker-near-me/india/delhi" },
        { label: "Mumbai", href: "/elite-matchmaker-near-me/india/mumbai" },
        { label: "Bangalore", href: "/elite-matchmaker-near-me/india/bangalore" },
        { label: "Kolkata", href: "/elite-matchmaker-near-me/india/kolkata" },
        { label: "Hyderabad", href: "/elite-matchmaker-near-me/india/hyderabad" },
      ],
    },
    {
      label: "USA",
      href: "/elite-matchmaker-near-me/usa",
      cities: [
        { label: "California", href: "/elite-matchmaker-near-me/usa/california" },
        { label: "Los Angeles", href: "/elite-matchmaker-near-me/usa/los-angeles" },
        { label: "New York", href: "/elite-matchmaker-near-me/usa/new-york" },
        { label: "San Francisco", href: "/elite-matchmaker-near-me/usa/san-francisco" },
      ],
    },
  ] satisfies FooterService[],
  contactCities: ["New York", "Dubai", "New Delhi"],
  whatsapp: {
    label: "WhatsApp - +91 98215 87166",
    href: "https://wa.me/919821587166",
  },
  social: [
    { label: "Instagram", href: "https://www.instagram.com/anuradhaguptavfe/" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=100063856037567" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/anuradha-gupta-9565945/" },
  ],
};
