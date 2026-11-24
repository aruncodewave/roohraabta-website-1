const experienceIcons = ["/icons/chat.svg", "/icons/circle.svg", "/icons/profile.svg", "/icons/messages.svg"];

export default function ExperienceIcon({ index }: { index: number }) {
  const src = experienceIcons[index % experienceIcons.length];

  return <img src={src} alt="" width={56} height={48} className="mx-auto h-12 w-auto" />;
}
