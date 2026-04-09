import { memo } from "react";
import { type ItemType } from "../itemConfig";
import { getItemTextureInfo } from "../itemTextures";

interface ItemSpriteProps {
  itemType: ItemType;
  className?: string;
}

export const ItemSprite = memo(({ itemType, className = "" }: ItemSpriteProps) => {
  const textureInfo = getItemTextureInfo(itemType);
  if (textureInfo.backgroundPosition) {
    return (
      <div
        className={`w-full h-full pointer-events-none select-none [image-rendering:pixelated] ${className}`}
        style={{
          backgroundImage: `url(${textureInfo.src})`,
          backgroundPosition: textureInfo.backgroundPosition,
          backgroundSize: textureInfo.backgroundSize,
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  }
  return (
    <img
      src={textureInfo.src}
      draggable={false}
      className={`w-full h-full pointer-events-none select-none [image-rendering:pixelated] ${className}`}
      alt=""
    />
  );
});
