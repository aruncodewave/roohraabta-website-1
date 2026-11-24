export type TeamLink = {
  label: string;
  href: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  title: string;
  image: string;
  fullImage?: string;
  backgroundColor: string;
  paragraphs: string[];
  links?: TeamLink[];
};

export function getTeamMember(id: string) {
  return teamMembers.find((member) => member.id === id);
}

export const teamMembers: TeamMember[] = [
  {
    id: "shahnaz",
    name: "Shahnaz Abjani",
    role: "Client Partner | South Asia",
    title: "Client Partner | South Asia",
    image: "/images/shahnaz.webp",
    fullImage: "/images/shahnazFull.webp",
    backgroundColor: "#F7F3EA",
    paragraphs: [
      "Shahnaz is a Karachi-based entrepreneur and community leader with more than three decades of experience across business, social impact and community service.",
      "She was the first woman in Pakistan to be appointed President of an Ismaili Council jurisdiction and co-founded Zindagi Trust, where she served as Chief Operating Officer. She has also built businesses across fashion, beauty, events, interiors and media.",
      "A lifelong mentor to women and couples, Shahnaz has developed a deep understanding of relationships, families and the cultural context in which both evolve.",
      "Married for 36 years, with two grown daughters and a grandchild, she combines professional perspective with lived experience in her work bringing two people, and often two families, together.",
    ],
  },
  {
    id: "ayesha",
    name: "Ayesha Singh",
    role: "Managing Client Partner | North America",
    title: "Managing Client Partner | North America",
    image: "/images/ayesha.webp",
    fullImage: "/images/ayeshaFull.webp",
    backgroundColor: "#F3EEE3",
    paragraphs: [
      "Ayesha has been with Vows for Eternity for close to a decade, following nearly two decades in global communications, including a leadership role at Burson-Marsteller.",
      "An Indian Canadian raised in India and now dividing her time between Toronto and New York, she understands what it means to build a life across cultures and borders. That perspective shapes the way she works with members navigating questions of identity, family and belonging.",
      "Growing up with a parent who was a psychotherapist and healer shaped her ability to look beyond what people say and recognize the emotions and experiences behind their expectations. Warm, perceptive and direct yet considerate, Ayesha believes that meaningful conversations begin with understanding the person, not simply their preferences.",
      "Outside work, she enjoys golf, photography and tarot reading.",
    ],
  },
  {
    id: "anuradha",
    name: "Anuradda Gupta",
    role: "Founder & CEO",
    title: "Founder & CEO",
    image: "/images/anu.svg",
    fullImage: "/images/anuFull.webp",
    backgroundColor: "#F7F1E6",
    paragraphs: [
      "Anuradda Gupta is an entrepreneur, author and speaker with experience building and leading businesses across matchmaking and financial services.",
      "She founded Vows for Eternity in 2012, establishing a personalized matchmaking service with members across more than 65 countries. Over the years, she has worked closely with individuals and families across cultures and generations, gaining firsthand insight into how expectations around marriage, independence, family and partnership continue to evolve.",
      "Beyond Vows for Eternity, Anuradda is the Founder of The Matrimonial Classifieds, a verified, self-directed matrimonial platform, and Co-founder of ARMEIS, a financial services company.",
      "She is the author of the forthcoming book Soft as Steel: On Love, Loss, and What We Refuse to Inherit, host of the Heart to Heart and Soft as Steel podcasts, and a TEDx speaker.",
      "She holds an MBA and is an alumna of Harvard Business School’s Owner/President Management Program.",
    ],
  },
  {
    id: "bhagyashree",
    name: "Bhagyashree Sharma",
    role: "Chief Growth Officer",
    title: "Chief Growth Officer",
    image: "/images/bhagyashree.webp",
    fullImage: "/images/bhagyaFull.webp",
    backgroundColor: "#EFE6D4",
    paragraphs: [
      "Bhagyashree has been part of Vows for Eternity since its inception. As a member of the founding team, she has played an integral role in its growth and today leads global memberships, working closely with Anuradda on the expansion of Vows for Eternity Privé.",
      "Before joining VFE, she worked with Fortune 500 companies, bringing a strong foundation in business strategy and client relationships. Her years in matchmaking have given her firsthand insight into the expectations and complexities of working with individuals and families across cultures.",
      "Raised in Delhi and naturally curious about people and places, Bhagyashree enjoys traveling, exploring different perspectives and spending quiet time with her dog, Tofu.",
    ],
  },
  {
    id: "riema",
    name: "Riema Mehra",
    role: "Client Partner | South Asia",
    title: "Client Partner | South Asia",
    image: "/images/riema.png",
    fullImage: "/images/riemaFull.webp",
    backgroundColor: "#F6F1E8",
    paragraphs: [
      "Before joining Vows for Eternity, Riema was a lecturer at Lucknow University. Her background in higher education shaped her communication skills and ability to engage with people from different backgrounds.",
      "Riema is known for her warm, approachable manner and her belief in guiding rather than pushing. She recognizes that decisions about marriage take time and brings patience, thoughtful follow-ups and a practical perspective to her conversations with members and their families.",
      "She also leads the team at The Matrimonial Classifieds, a sister company of Vows for Eternity.",
    ],
  },
  {
    id: "jackie",
    name: "Jackie Cohen, MD",
    role: "Client Partner | North America",
    title: "Client Partner | North America",
    image: "/images/jackie.webp",
    fullImage: "/images/jackieFull.webp",
    backgroundColor: "#F6F1E8",
    paragraphs: [
      "Jackie is a retired physician, a Harvard graduate and one of the first women to enter the field of urology. She brings decades of professional experience alongside a deeply personal understanding of relationships and marriage.",
      "Raised in a secular Jewish family in Chicago, Jackie understands the different ways individuals navigate faith, cultural identity and personal beliefs.",
      "Having experienced years of dating, matchmaking, marriage, divorce and remarriage, she knows firsthand that finding a life partner is rarely a straightforward journey. Her experiences have shaped her belief that while romance matters, lasting relationships are built on trust, mutual respect and understanding.",
      "Now happily remarried for 19 years, Jackie brings empathy, perspective and a genuine desire to help others find meaningful companionship.",
      "She lives in California with her husband, Mark Cohen, a member of our Advisory Council, and their two dogs. She enjoys cooking, traveling and spending time with family and friends.",
    ],
  },
  {
    id: "namita",
    name: "Namita Bharwani",
    role: "Client Partner | South Asia",
    title: "Client Partner | South Asia",
    image: "/images/namita.webp",
    fullImage: "/images/namitaFull.webp",
    backgroundColor: "#F4EFE4",
    paragraphs: [
      "Namita brings more than two decades of experience working with individuals and families, including nearly fourteen years as a Montessori educator and ten years with Vows for Eternity.",
      "Years in the classroom taught her to listen closely, build trust and recognize that every person arrives with their own expectations and circumstances. She brings that same patience to her work today.",
      "At Vows for Eternity, Namita guides prospective members and their families through the membership process, helping them make informed decisions about their search. She focuses on understanding each member’s priorities, addressing concerns early and setting realistic expectations from the start.",
    ],
  },
];
