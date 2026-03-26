import {
  Filter,
  GlProgram,
  UniformGroup,
  defaultFilterVert,
  type Texture,
  type Spritesheet,
} from "pixi.js";

const fragment = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uColormapTexture;
uniform sampler2D uPresetTexture;

uniform vec2 uCmOffset;
uniform vec2 uCmScale;

void main(void) {
    vec4 base = texture(uTexture, vTextureCoord);
    vec2 cmUv = vTextureCoord * uCmScale + uCmOffset;
    vec4 cm = texture(uColormapTexture, cmUv);

    if (cm.a > 0.1 && base.a > 0.0) {
        vec4 preset = texture(uPresetTexture, vec2(cm.r, 0.5));
        finalColor = vec4(preset.rgb * base.a, base.a);
    } else {
        finalColor = base;
    }
}
`;

let glProgram: GlProgram | null = null;

function getProgram(): GlProgram {
  if (!glProgram) {
    glProgram = GlProgram.from({ vertex: defaultFilterVert, fragment });
  }
  return glProgram;
}

export function createPaletteSwapFilter(
  colormapSheet: Spritesheet,
  presetTexture: Texture,
  shipFrameName: string
): Filter {
  const cmFrameName = `cm-${shipFrameName.replace("ship-", "")}`;
  const frameData = colormapSheet.data.frames[cmFrameName];
  const frame = frameData.frame;

  const sheetWidth = colormapSheet.textureSource.width;
  const sheetHeight = colormapSheet.textureSource.height;

  presetTexture.source.style.scaleMode = "nearest";
  colormapSheet.textureSource.style.scaleMode = "nearest";

  const paletteUniforms = new UniformGroup({
    uCmOffset: {
      value: new Float32Array([frame.x / sheetWidth, frame.y / sheetHeight]),
      type: "vec2<f32>",
    },
    uCmScale: {
      value: new Float32Array([frame.w / sheetWidth, frame.h / sheetHeight]),
      type: "vec2<f32>",
    },
  });

  return new Filter({
    glProgram: getProgram(),
    resources: {
      paletteUniforms,
      uColormapTexture: colormapSheet.textureSource,
      uPresetTexture: presetTexture.source,
    },
  });
}
