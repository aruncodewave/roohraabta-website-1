"use client";

import { useEffect, useRef, useState } from "react";

type TermsPopupProps = {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
};

type LinkPart = { href: string; label: string };
type TextPart = string | LinkPart | { break: true };
type Paragraph = TextPart[];
type Block = { subheading?: string; paragraphs: Paragraph[] };
type Section = { title: string; blocks: Block[] };

const sections: Section[] = [
  {
    title: "Introduction",
    blocks: [
      {
        paragraphs: [
          [
            "Vows for Eternity, referred to as VFE, we, us, or our, provides personalised matrimonial and advisory matchmaking services for Indian citizens, people of Indian origin, Non Resident Indians, and global citizens.",
          ],
          [
            "These Terms and Conditions constitute a legally binding agreement between you, referred to as you, your, user, or Member, and Vows for Eternity. By accessing or using our website at ",
            { href: "https://www.vowsforeternity.com", label: "www.vowsforeternity.com" },
            ", registering with us, subscribing to any membership, executing a Letter of Engagement, or otherwise engaging with our services, you confirm that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy in their entirety, without exception.",
          ],
          [
            "If you do not agree to these Terms, you must not access or use the website or services. If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.",
          ],
          [
            "By becoming a Member of VFE and or using the services, you unconditionally and irrevocably confirm that you have read, understood, and agreed to abide by these Terms.",
          ],
        ],
      },
    ],
  },
  {
    title: "1. Legal entity and jurisdiction",
    blocks: [
      {
        paragraphs: [
          [
            "Vows for Eternity operates through two legal entities. Vows for Eternity Inc is registered in the State of New York in the United States. Vows for Eternity is registered in New Delhi, India.",
          ],
          [
            "Users residing outside India shall be governed by the laws of the State of New York in the United States and shall submit to the exclusive jurisdiction of the courts located in New York.",
          ],
          [
            "Users residing in India shall be governed by the laws of India and shall submit to the exclusive jurisdiction of the courts located in New Delhi.",
          ],
          ["Jurisdiction shall be determined based on the user's location at the time of registration."],
          [
            "Any dispute, claim, or cause of action arising out of or relating to the website or services must be initiated within three months from the date of the event giving rise to such claim. Failure to initiate proceedings within this period constitutes an absolute, irrevocable, and unconditional waiver of such claim.",
          ],
        ],
      },
    ],
  },
  {
    title: "2. Eligibility",
    blocks: [
      {
        paragraphs: [
          [
            "You may use the services of Vows for Eternity only if you are of legal marriageable age under the laws applicable in your jurisdiction of residence. You must have full legal capacity, authority, and right to enter into this Agreement and to provide the information required in connection with the services.",
          ],
          [
            "You must not be subject to any law, court order, injunction, decree, or legal restriction that prohibits you from providing personal information or engaging in matrimonial discussions.",
          ],
          [
            "All information provided by you must be true, accurate, complete, and not misleading, and must be kept current throughout the duration of your membership.",
          ],
          [
            "By registering for VFE services, you represent and warrant that you have the legal right, consent, authority, and capacity to enter into this Agreement and that you are not prohibited by any applicable law or order from entering into matrimony.",
          ],
          [
            "If you are registering on behalf of another individual, you represent and warrant that you are legally authorised to act on their behalf and have obtained their express permission.",
          ],
          [
            "VFE reserves the right to terminate membership immediately for any misrepresentation, concealment, or provision of inaccurate or outdated information. In such cases, all fees paid shall be forfeited in full and VFE reserves the right to pursue legal remedies where appropriate.",
          ],
          [
            "VFE facilitates introductions solely for lawful matrimonial alliances between persons legally competent to enter into matrimony under applicable law. Membership is void where prohibited.",
          ],
        ],
      },
    ],
  },
  {
    title: "3. Nature of service",
    blocks: [
      {
        paragraphs: [
          [
            "VFE provides curated, advisory-led matchmaking services. These services may include consultations, profile curation and analysis, curated profile suggestions and introductions, and strategic guidance throughout the search process.",
          ],
          [
            "While VFE is committed to a professional, discreet, and personalised approach, you expressly acknowledge and agree that VFE does not make any guarantees, whether express or implied, regarding the number, frequency, or timing of introductions, mutual interest or compatibility between individuals, or relationship success or marital outcomes.",
          ],
          [
            "Matchmaking is an inherently subjective and time intensive process. There may be periods during which no profiles are shared based on your criteria, preferences, availability, and alignment. Such periods do not constitute non performance or breach of service.",
          ],
        ],
      },
    ],
  },
  {
    title: "4. Conditions of use",
    blocks: [
      {
        paragraphs: [
          [
            "By using the website and services, you agree that you will use VFE solely for lawful matrimonial purposes. You accept full responsibility for the authenticity, legality, and accuracy of all information provided by you or by anyone acting on your behalf.",
          ],
          [
            "You acknowledge that VFE does not conduct background checks, legal verification, criminal history checks, financial checks, or credit checks unless expressly agreed to in writing.",
          ],
          [
            "You assume all risks associated with communication or meetings with other individuals, whether online or offline, and agree to take all reasonable precautions to protect your personal, professional, and physical safety.",
          ],
          [
            "You agree not to use VFE for advertising, commercial solicitation, unlawful activities, harassment, or any conduct that may cause harm to others. You further agree to maintain confidentiality of your account credentials and all information shared with you through the service.",
          ],
          [
            "You must promptly update your profile if there are any material changes to your personal or professional circumstances that may affect your eligibility or suitability.",
          ],
          [
            "VFE reserves the right to remove content deemed inaccurate, inappropriate, unlawful, or offensive and may suspend or terminate membership without refund for violations of these Terms.",
          ],
        ],
      },
    ],
  },
  {
    title: "5. Communication and consent",
    blocks: [
      {
        paragraphs: [
          [
            "You authorise VFE to contact you via email, phone, messaging platforms, video calls, or other communication channels for service delivery, administration, and membership related purposes.",
          ],
          [
            "As communication is essential to the service, you may not opt out of receiving such communications during an active membership.",
          ],
          [
            "You consent to VFE using and sharing your profile and relevant information for matchmaking purposes, including sharing profiles and photographs with selected potential matches and communicating with you and, where authorised by you, with your family or representatives regarding progress.",
          ],
          ["VFE will not use your information for promotional or marketing purposes without your explicit consent."],
        ],
      },
    ],
  },
  {
    title: "6. Call recording notice",
    blocks: [
      {
        paragraphs: [
          [
            "All calls with Vows for Eternity may be recorded for purposes of quality assurance, staff training, and legal compliance. By engaging in a call with Vows for Eternity, you expressly consent to such recording and agree that no objection will be raised to the recording in any form or manner.",
          ],
        ],
      },
    ],
  },
  {
    title: "7. Membership duration and termination",
    blocks: [
      {
        subheading: "Membership Duration",
        paragraphs: [["Membership duration is defined by the plan you select at the time of enrollment."]],
      },
      {
        subheading: "Termination by Member:",
        paragraphs: [
          [
            'You may terminate your membership at any time by providing written notice to Vows for Eternity ("VFE"). No refunds will be issued for any unused portion of the membership.',
          ],
        ],
      },
      {
        subheading: "Termination by VFE:",
        paragraphs: [
          [
            "VFE reserves the right to terminate or suspend your membership immediately, without prior notice or refund, if you:",
          ],
          ["Violate these Terms and Conditions or applicable laws;"],
          ["Provide false, misleading, or incomplete information;"],
          [
            "Harass, intimidate, threaten, abuse, or endanger any VFE staff, representatives, or other members, in any form or manner;",
          ],
          ["Breach any other provision of this Agreement."],
        ],
      },
      {
        subheading: "Effect of Termination or Expiration:",
        paragraphs: [
          [
            "Upon termination or expiration of membership, all access to your profile, communications, and any associated content on the VFE platform will be revoked. VFE shall have no further obligations toward providing services or content once access is terminated.",
          ],
        ],
      },
    ],
  },
  {
    title: "8. Refund policy",
    blocks: [
      {
        paragraphs: [
          ["All fees are payable in advance, non transferable, and strictly non refundable under all circumstances."],
          [
            "By making a payment, you confirm that you have read and accepted the no refund policy. You agree that dissatisfaction, perceived lack of suitable introductions, periods without introductions, early termination, or personal circumstances do not constitute grounds for refund, reversal, or chargeback.",
          ],
        ],
      },
    ],
  },
  {
    title: "9. Proprietary rights",
    blocks: [
      {
        paragraphs: [
          [
            "All intellectual property associated with VFE, including trademarks, logos, designs, text, concepts, images, databases, processes, and proprietary systems, is owned exclusively by VFE and protected by applicable laws.",
          ],
          [
            "You may not reproduce, distribute, display, publish, scrape, reverse engineer, or commercially exploit any VFE content without prior written consent.",
          ],
          ["Any intellectual property infringement may result in immediate termination of membership and legal action."],
        ],
      },
    ],
  },
  {
    title: "10. Membership access and rights",
    blocks: [
      {
        paragraphs: [
          [
            "VFE reserves the right to refuse membership or discontinue services at its discretion where eligibility criteria are not met or where continued engagement is not aligned with the integrity of the service.",
          ],
          [
            "VFE may broaden the search by contacting individuals within or outside the VFE network where appropriate. VFE may but is not obligated to monitor disputes between members and is not responsible for interactions or transactions between members.",
          ],
        ],
      },
    ],
  },
  {
    title: "11. Indemnification",
    blocks: [
      {
        paragraphs: [
          [
            "You agree to indemnify and hold harmless VFE, its directors, officers, employees, agents, and affiliates from any losses, claims, damages, liabilities, costs, or expenses arising out of your use or misuse of the services, information provided by you, breach of these Terms, or violation of applicable laws or third party rights.",
          ],
          [
            "VFE reserves the right to assume exclusive control of the defence of any matter subject to indemnification, and you agree to cooperate fully in such defence.",
          ],
        ],
      },
    ],
  },
  {
    title: "12. Disclaimer",
    blocks: [
      {
        paragraphs: [
          ["You are solely responsible for your safety, conduct, and decisions in all interactions facilitated through VFE."],
          ["You should never share financial information or send money to other members or third parties."],
          [
            "All services are provided on an as is and as available basis. VFE disclaims all warranties, express or implied, including accuracy, reliability, or outcomes of profiles, introductions, or content posted by members or third parties.",
          ],
        ],
      },
    ],
  },
  {
    title: "13. Limitation of liability",
    blocks: [
      {
        paragraphs: [
          ["To the maximum extent permitted by law, VFE's total liability shall not exceed the membership fee paid by you."],
          [
            "VFE shall not be liable for indirect, incidental, consequential, special, or punitive damages, including emotional distress or loss arising from interactions with other members or third parties.",
          ],
          [
            "VFE does not verify information provided by members and is not responsible for inaccuracies, omissions, or fraudulent representations.",
          ],
        ],
      },
    ],
  },
  {
    title: "14. Data protection and privacy",
    blocks: [
      {
        paragraphs: [
          [
            "Your personal data is processed in accordance with our Privacy Policy. By using the services, you acknowledge that you have reviewed and accepted our data handling practices.",
          ],
        ],
      },
    ],
  },
  {
    title: "15. Third party links and social media",
    blocks: [
      {
        paragraphs: [
          [
            "The website may contain links to third party websites or tools. VFE is not responsible for the content, policies, or practices of such third parties.",
          ],
          [
            "If you engage with VFE through social media platforms, you are responsible for understanding the terms and privacy settings of those platforms.",
          ],
        ],
      },
    ],
  },
  {
    title: "16. Privacy policy",
    blocks: [
      {
        paragraphs: [
          [
            "Use of the website and services constitutes acceptance of the Privacy Policy. Please review it carefully before using the services.",
          ],
        ],
      },
    ],
  },
  {
    title: "17. Acceptance and modifications",
    blocks: [
      {
        paragraphs: [
          ["By using the website or services, you agree to these Terms."],
          [
            "VFE reserves the right to modify these Terms at any time. Changes become effective upon posting on the website. Continued use constitutes acceptance of the updated Terms.",
          ],
        ],
      },
    ],
  },
  {
    title: "18. Contact information",
    blocks: [
      {
        paragraphs: [
          [
            "For queries or complaints, please contact us at ",
            { href: "mailto:contactus@vowsforeternity.com", label: "contactus@vowsforeternity.com" },
            ".",
          ],
          [
            "India office details are Vows for Eternity, Level 3B, DLF Centre, Sansad Marg, Connaught Place, New Delhi 110001. ",
            { break: true },
            "Telephone number is: ",
            { href: "tel:+911161289047", label: "+91 1161289047" },
          ],
          [
            "United States office details are Vows for Eternity, 1330 Avenue of the Americas, Suite 23A, New York, NY 10019. ",
            { break: true },
            "Telephone number is: ",
            { href: "tel:+12126530953", label: "+1 2126530953" },
          ],
        ],
      },
    ],
  },
];

function renderPart(part: TextPart, index: number) {
  if (typeof part === "string") return part;
  if ("break" in part) return <br key={index} />;
  const external = part.href.startsWith("http");
  return (
    <a
      key={index}
      href={part.href}
      className="underline"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {part.label}
    </a>
  );
}

function TermsCopy() {
  return (
    <>
      {sections.map((section) => (
        <section key={section.title} className="mb-8">
          <h3 className="font-sans text-[20px] font-medium uppercase text-[#762323] sm:text-[22px]">{section.title}</h3>
          {section.blocks.map((block) => (
            <div key={block.subheading ?? block.paragraphs[0]?.[0]?.toString()} className="mt-3">
              {block.subheading ? (
                <h4 className="font-sans text-[18px] font-medium text-[#762323] sm:text-[20px]">{block.subheading}</h4>
              ) : null}
              {block.paragraphs.map((paragraph, index) => (
                <p key={index} className="mt-2 font-sans text-[18px] leading-relaxed text-[#762323] sm:text-[20px]">
                  {paragraph.map((part, partIndex) => renderPart(part, partIndex))}
                </p>
              ))}
            </div>
          ))}
        </section>
      ))}
      <p className="text-right font-sans text-[18px] text-[#762323]">Last Revised: 12 January 2026</p>
    </>
  );
}

export default function TermsPopup({ open, onClose, onAgree }: TermsPopupProps) {
  const [showHint, setShowHint] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const reachedBottom = () => {
    const element = panelRef.current;
    if (!element) return true;
    return element.scrollHeight - element.scrollTop <= element.clientHeight + 12;
  };

  const agree = () => {
    if (!reachedBottom()) {
      setShowHint(true);
      return;
    }
    onAgree();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#171717]/45 px-4" role="dialog" aria-modal="true" aria-labelledby="terms-title">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close terms" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col bg-cream shadow-lg">
        <div className="px-8 pt-8 pb-4 sm:px-12">
          <h2 id="terms-title" className="font-serif text-[36px] text-[#762323] sm:text-[42px]">
            Terms & Conditions
          </h2>
          <div className="mt-4 h-px w-40 bg-[#762323]" />
        </div>
        <div
          ref={panelRef}
          className="flex-1 overflow-y-auto px-8 pb-6 sm:px-12"
          onScroll={() => {
            if (reachedBottom()) setShowHint(false);
          }}
        >
          <TermsCopy />
        </div>
        <div className="flex flex-col items-end gap-3 px-8 py-6 sm:px-12">
          {showHint ? (
            <p className="font-sans text-[18px] text-[#762323]">Please scroll to the bottom to read all terms and conditions</p>
          ) : null}
          <button
            type="button"
            onClick={agree}
            className="cursor-pointer border border-[#8B7E2A] px-8 py-2 font-sans text-[20px] text-[#762323]"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
