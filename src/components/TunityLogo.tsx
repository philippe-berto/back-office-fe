import Image from "next/image";

export default function TunityLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/Tunity-Logo-1.png"
        alt="Tunity Logo"
        width={100}
        height={100}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
