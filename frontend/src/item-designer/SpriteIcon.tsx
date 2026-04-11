interface IconImageProps {
  filePath: string;
  size?: number;
}

export function IconImage({ filePath, size = 64 }: IconImageProps) {
  return (
    <img
      src={filePath}
      alt=""
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        objectFit: "contain",
      }}
    />
  );
}
