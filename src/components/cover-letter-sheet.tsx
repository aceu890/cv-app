import type { CoverLetter } from "@/lib/cv/schema";

export function CoverLetterSheet({
  letter,
  name,
  email,
  phone,
  location,
}: {
  letter: CoverLetter;
  name: string;
  email: string;
  phone: string;
  location: string;
}) {
  const date = new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(letter.updatedAt ? new Date(letter.updatedAt) : new Date());

  return (
    <div className="cv-page bg-white px-[72px] py-[68px] text-[#1a1a1a]">
      <p className="text-[17px] font-semibold tracking-wide">{name || "Tu nombre"}</p>
      <p className="mt-1 text-[11.5px] text-[#444]">
        {[location, phone, email].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-8 text-[12px]">{date}</p>
      {letter.company ? (
        <p className="mt-4 text-[12px] font-medium">{letter.company}</p>
      ) : null}
      {letter.role ? (
        <p className="text-[12px]">Ref: {letter.role}</p>
      ) : null}
      <div className="mt-8 whitespace-pre-wrap text-[12.5px] leading-[1.65]">
        {letter.body}
      </div>
    </div>
  );
}
