interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
}

export default function BrandLogo({
  className = "",
  imageClassName = "",
}: BrandLogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <img
        src="/assets/trackify-logo.png"
        alt=""
        className={`h-full w-full scale-[1.18] object-contain ${imageClassName}`}
      />
    </span>
  );
}
