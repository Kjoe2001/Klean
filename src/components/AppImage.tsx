import Image from 'next/image';
import type { CSSProperties } from 'react';

type AppImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  wrapperClassName?: string;
  sizes?: string;
  duotone?: boolean;
  unoptimized?: boolean;
};

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHgyPSIxMDAlIiB5MT0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRjFGN0Y2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQUFDQkM0Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+';

export default function AppImage({
  src,
  alt,
  width,
  height,
  fill,
  priority = false,
  className = '',
  wrapperClassName = '',
  sizes,
  duotone = true,
  unoptimized,
}: AppImageProps) {
  const objectClass = `rounded-[20px] object-cover ${className}`.trim();
  const shouldUnoptimize = unoptimized ?? !priority;

  const style: CSSProperties | undefined = fill
    ? undefined
    : width && height
      ? { aspectRatio: `${width} / ${height}` }
      : undefined;

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] glass-highlight ${wrapperClassName}`.trim()}
      style={style}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        unoptimized={shouldUnoptimize}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
        className={objectClass}
      />
      {duotone && (
        <div className="pointer-events-none absolute inset-0 bg-bangladesh-green/15 mix-blend-multiply" />
      )}
    </div>
  );
}
