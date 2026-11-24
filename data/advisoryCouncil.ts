export type CouncilMember = {
  id: string;
  name: string;
  role: string;
  src: string;
  paragraphs: string[];
};

export const councilIntro = [
  "Our Advisory Council brings together leaders from business, education, philanthropy and community life, representing different cultures, generations and perspectives.",
  "Their collective experience informs our understanding of relationships, family dynamics and the changing expectations surrounding marriage and partnership.",
];

export const councilMembers: CouncilMember[] = [
  {
    id: "ahmed",
    name: "Ahmed Samy",
    role: "Entrepreneur · Technology Leader · Community Builder",
    src: "/images/ahmed.svg",
    paragraphs: [
      "Ahmed is an Egyptian entrepreneur and technology leader with more than 25 years of experience across the Middle East and internationally.",
      "He has held senior leadership roles with Fortune 500 companies, founded businesses across technology, media and real estate, and served as CEO of the Industry Technology and Innovation Council at Egypt’s Ministry of International Trade and Industry, advancing innovation, economic development and job creation.",
      "Community building and mentorship have remained central to his work. He has served on the boards of nonprofit and academic institutions and held leadership roles within the Entrepreneurs’ Organization and Rotary.",
      "A father of grown children, Ahmed brings a perspective shaped not only by decades of leadership, but by life, relationships, parenthood and change. He brings to the Council a willingness to question assumptions and an understanding that people, like relationships, rarely follow a straight line.",
    ],
  },
  {
    id: "deepika",
    name: "Deepika Jindal",
    role: "Business Leader · Educationist · Philanthropist",
    src: "/images/deepika.svg",
    paragraphs: [
      "Deepika married into the Jindal family, one of India’s most prominent industrial families, at nineteen. The family’s interests span steel, power and infrastructure. It was a traditional household, a prominent name and a path that could easily have been written for her. Instead, she wrote her own.",
      "Over the years, she has built a life across business, education and philanthropy. She is Managing Director of Jindal Stainless Steel Lifestyle Limited and Founder of Arttd’inox. She also serves as Chairperson of OP Jindal Modern School, Vidya Devi Jindal School and OP Jindal Cancer Institute.",
      "Her journey has given her a firsthand perspective on how expectations around marriage, independence and family have evolved across generations.",
      "She believes deeply in the institution of marriage, without romanticizing it. For her, relationships require friendship, adaptation and a willingness to evolve alongside another person.",
    ],
  },
  {
    id: "shahnaz",
    name: "Shahnaz Gaffar",
    role: "Engineer · Business Leader · Mentor",
    src: "/images/gaffar.svg",
    paragraphs: [
      "Shahnaz is an engineer and business leader based in Doha, with more than 25 years of experience across operations, project management and organizational leadership in the Middle East.",
      "Raised in the Middle East with roots in Kerala, she grew up in a Sunni Muslim family where education, integrity and personal responsibility were deeply valued. Her father, an engineer and educator, shaped her belief that character matters as much as achievement. As Head of Field Operations Support at North Oil Company in Qatar, she has built her career in a demanding, multicultural industry.",
      "Beyond her professional life, Shahnaz has long been someone others turn to for perspective. She listens without judgment and offers thoughtful guidance when people face difficult personal decisions.",
      "Married and a mother of two sons, she believes a lasting marriage requires more than shared backgrounds or circumstances. Trust, respect, communication and shared values matter, as does the willingness to grow alongside another person. Her perspective is shaped by her faith, her family life and decades of living and working across cultures.",
    ],
  },
  {
    id: "maharani",
    name: "H.H. Maharani Radhikaraje Gaekwad",
    role: "Historian · Cultural Steward · Philanthropist",
    src: "/images/maharani.svg",
    paragraphs: [
      "Radhikaraje trained as a historian and worked as a journalist with The Indian Express before marrying into the former royal family of Baroda, whose ancestral home, Lukshmi Vilas Palace, is recognized as the world’s largest private residence.",
      "Today, much of her work sits at the intersection of heritage and change. As Vice President of Maharani Chimnabai Stree Udyogalaya, Trustee of the Maharaja Fatehsingh Museum and Director of CDS Art Foundation, she works across women’s livelihoods, cultural preservation and the future of traditional crafts.",
      "Her work extends beyond preservation to creating opportunities. She has supported artisanal families, vocational training for women and initiatives that encourage greater economic independence.",
      "For Radhikaraje, heritage is not simply something inherited. It carries a responsibility to understand and preserve what matters while making room for change.",
    ],
  },
  {
    id: "mark",
    name: "Mark Cohen, MD",
    role: "Physician · Developmental Pediatrician · Advisor",
    src: "/images/mark.svg",
    paragraphs: [
      "Mark is a retired developmental pediatrician with nearly four decades of experience working with children and families. A Princeton graduate, he trained in medicine at Penn State and later served as Medical Director at Kaiser Permanente.",
      "Raised in a Jewish family in Philadelphia, Mark grew up with a strong connection to Jewish heritage and traditions. Having experienced both Conservative and Reform Jewish communities, he appreciates the different ways individuals and families navigate religious beliefs, cultural identity and changing expectations across generations.",
      "Throughout his medical career, Mark developed an understanding of how childhood experiences and family relationships shape the way people approach adulthood, marriage and parenthood. He believes that understanding someone’s personal history is essential to understanding their choices and relationships.",
      "Having experienced marriage, divorce and remarriage, Mark also brings a personal perspective on the complexities of finding companionship and building a lasting partnership.",
      "He is married to Jackie Cohen, a Client Partner at Vows for Eternity.",
    ],
  },
];
