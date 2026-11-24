import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PeopleBehind from "@/components/common/PeopleBehind";
import { getTeamMember, teamMembers } from "@/data/team";

type TeamMemberPageProps = {
  params: Promise<{ member: string }>;
};

export function generateStaticParams() {
  return teamMembers.map((member) => ({ member: member.id }));
}

export async function generateMetadata({ params }: TeamMemberPageProps): Promise<Metadata> {
  const { member: id } = await params;
  const member = getTeamMember(id);

  if (!member) {
    return { title: "Our team | Vows for Eternity" };
  }

  return {
    title: `${member.name} | Our team | Vows for Eternity`,
    description: member.paragraphs[0],
  };
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { member: id } = await params;
  const member = getTeamMember(id);

  if (!member) notFound();

  return <PeopleBehind featuredId={member.id} />;
}
