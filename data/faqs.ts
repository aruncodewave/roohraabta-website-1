export type FaqItem = {
  question: string;
  paragraphs: string[];
};

export type FaqSection = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const faqSections: FaqSection[] = [
  {
    id: "about",
    title: "About Vows for Eternity",
    items: [
      {
        question: "Is this a platform for arranged marriages?",
        paragraphs: [
          "No. We offer arranged introductions, not arranged marriages.",
          "We bring two people together because we believe there may be meaningful compatibility. Whether they choose to meet, pursue a relationship or build a future together is entirely their decision.",
        ],
      },
      {
        question: "What do you believe about marriage?",
        paragraphs: [
          "We believe a lasting partnership is built on friendship, mutual respect, shared values and the willingness to grow together.",
          "Marriage should be a conscious choice, not an obligation dictated by age, family expectations or timelines. What that partnership looks like is ultimately for the two people involved to decide.",
        ],
      },
      {
        question: "Who are your members?",
        paragraphs: [
          "Our members include professionals, entrepreneurs and individuals from business and legacy families, from many cultures and backgrounds.",
          "They are based across the world and come to us at different stages of life, whether seeking a first marriage or a new beginning.",
        ],
      },
      {
        question: "Do you only work with people in India?",
        paragraphs: [
          "No. Vows for Eternity is a global matchmaking service.",
          "For more than a decade, we have worked with members across more than 65 countries, with particularly strong networks in India, the UAE and the United States.",
        ],
      },
      {
        question: "Do you work across different cultures and communities?",
        paragraphs: [
          "Yes. Our members come from different cultures, faiths, communities and family backgrounds.",
          "We understand that considerations such as religion, cultural traditions, language and family expectations may be important when choosing a life partner.",
          "Our role is to understand what matters to you and reflect those preferences in your search.",
        ],
      },
      {
        question: "Do you work with people who have been married before?",
        paragraphs: [
          "Yes.",
          "We work with people seeking marriage for the first time, as well as those who are divorced, widowed, single parents or beginning a new chapter in their lives.",
        ],
      },
      {
        question: "What is your success rate?",
        paragraphs: [
          "Approximately 30–35% of our members find their life partner through Vows for Eternity.",
          "Finding a life partner is deeply personal, and no matchmaking service can guarantee an outcome. Our commitment is to conduct each search with care, discretion and sound judgment.",
        ],
      },
    ],
  },
  {
    id: "process",
    title: "The Matchmaking Process",
    items: [
      {
        question: "How do I begin?",
        paragraphs: [
          "Complete our Apply for Membership form, and a member of our team will contact you to arrange an initial conversation.",
          "We will learn more about your circumstances and what you are seeking, explain our approach and recommend the membership best suited to your search.",
        ],
      },
      {
        question: "Is everyone who applies accepted?",
        paragraphs: [
          "No.",
          "We consider each application individually, taking into account your circumstances, expectations and our ability to meaningfully support your search.",
        ],
      },
      {
        question: "How do you decide who may be a good match?",
        paragraphs: [
          "We consider practical factors such as geography, education, family background and life stage, alongside values, temperament, aspirations and expectations of a relationship.",
          "Our approach is based on understanding the whole person rather than simply matching criteria on paper.",
        ],
      },
      {
        question: "What is the difference between profile sharing and an introduction?",
        paragraphs: [
          "We share a profile when we believe there may be meaningful compatibility.",
          "An introduction takes place only when both individuals express interest. The number of profiles shared may therefore be greater than the number of introductions made.",
        ],
      },
      {
        question: "Is there a minimum number of introductions each month?",
        paragraphs: [
          "No.",
          "We prioritize relevance over volume. Profiles are shared when we identify someone we believe may be compatible, rather than to meet a predetermined number.",
        ],
      },
      {
        question: "What if I don't connect with the profiles being shared?",
        paragraphs: [
          "We encourage you to share candid feedback.",
          "Understanding what resonates with you, what doesn't and why helps us refine the search and identify more relevant profiles.",
        ],
      },
      {
        question: "How long does the process usually take?",
        paragraphs: [
          "There is no fixed timeline.",
          "Some members meet someone relatively early in their search, while others take considerably longer. The duration depends on individual circumstances, preferences and the time it takes to develop a meaningful connection.",
          "Membership durations vary according to the offering you select.",
        ],
      },
      {
        question: "Can my family be involved?",
        paragraphs: [
          "Yes, if that is your preference.",
          "Some members involve their families from the beginning. Others prefer to manage the early stages independently and involve their families later.",
          "We respect the approach that works best for you.",
        ],
      },
      {
        question: "Do both people need to be Vows for Eternity members?",
        paragraphs: [
          "Not necessarily.",
          "Select memberships focus on introductions within our existing membership community.",
          "Privé searches may extend beyond that community through our international networks, trusted relationships and discreet external inquiries.",
          "In either case, an introduction takes place only when both individuals express interest.",
        ],
      },
      {
        question: "Do you offer relationship guidance or additional support?",
        paragraphs: [
          "Yes. The level of support depends on your membership.",
          "This may include guidance from our senior team, the Founder or professionals from our network of relationship counselors and advisors.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Verification",
    items: [
      {
        question: "Is my information confidential?",
        paragraphs: [
          "Yes. Confidentiality is fundamental to how Vows for Eternity operates.",
          "Member profiles are not publicly accessible. Information is shared privately with potential matches when we believe there may be meaningful compatibility.",
          "We handle personal information with discretion throughout the matchmaking process.",
        ],
      },
      {
        question: "Will my profile appear on a website or app?",
        paragraphs: [
          "No.",
          "Vows for Eternity is not an online browsing platform. Member profiles are not publicly searchable or displayed in an online database.",
          "Profiles are shared privately through our team as part of the matchmaking process.",
        ],
      },
      {
        question: "How do you verify the people you introduce?",
        paragraphs: [
          "We take verification seriously.",
          "Our process includes personal conversations, identity checks and, where appropriate, references and additional due diligence. We also draw on trusted relationships and referrals within our established networks.",
          "Verification practices and access to official records vary across countries. While we take reasonable steps to establish credibility, no process can eliminate every risk or guarantee the accuracy of all information provided.",
        ],
      },
    ],
  },
  {
    id: "membership",
    title: "Membership, Fees & Policies",
    items: [
      {
        question: "What is the difference between Vows for Eternity Select and Vows for Eternity Privé?",
        paragraphs: [
          "Vows for Eternity Select offers a personalized search within our curated membership community, guided by a dedicated Match Concierge, with different levels of access and advisory support.",
          "Vows for Eternity Privé extends beyond our existing membership community, drawing on our international networks and trusted relationships. It offers greater involvement from our senior leadership and, depending on the membership, a search personally led by our Founder.",
          "We help you understand which approach is best suited to your circumstances during your initial consultation.",
        ],
      },
      {
        question: "How are membership fees paid?",
        paragraphs: [
          "Membership fees are payable in full at the time of joining.",
          "We accept bank transfers, checks and major credit or debit cards, subject to availability in your country.",
        ],
      },
      {
        question: "Is there a success fee?",
        paragraphs: [
          "Some memberships include a success fee, payable when a successful match is confirmed.",
          "A successful match includes marriage, a mutually agreed commitment to a life together, or confirmation by the member that they have found their life partner and wish to conclude their search.",
          "Where applicable, the success fee and its payment terms are outlined in your membership agreement.",
        ],
      },
      {
        question: "Can I pause my membership?",
        paragraphs: [
          "Membership pauses are available only under Oud and Privé memberships and may be requested once during the membership term, for a maximum of three months.",
          "All pauses are subject to approval based on individual circumstances. Membership pauses are not available under Jasmine or Amber.",
        ],
      },
      {
        question: "What is your refund policy?",
        paragraphs: [
          "Membership fees are non-refundable once payment has been received.",
          "Our work involves allocating resources, understanding your circumstances, developing your profile and initiating your search.",
          "The same policy applies if you meet someone independently during your membership.",
        ],
      },
    ],
  },
];
