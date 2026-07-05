type IconProps = {
  name: string;
  className?: string;
};

export function Icon({ name, className = "" }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded msym ${className}`}
      aria-hidden="true"
      translate="no"
      data-nosnippet
    >
      {name}
    </span>
  );
}
