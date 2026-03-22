import { Container, Sprite, Text, Texture, TextStyle, Graphics } from "pixi.js";
import type { Meteor, MeteorObject } from "./types";
import { WORD_FONT_SIZE, WORD_OFFSET_Y, WORD_UNTYPED_ALPHA, WORD_TYPED_ALPHA, BULLET_RENDER_RADIUS } from "./constants";

export function createMeteorObject(meteor: Meteor, untypedStyle: TextStyle, typedStyle: TextStyle): MeteorObject {
  const container = new Container();
  container.position.set(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2);

  const tex = Texture.from({ resource: meteor.bitmap, transparent: true });
  const sprite = new Sprite(tex);
  sprite.anchor.set(0.5);
  container.addChild(sprite);

  const untypedText = new Text({ text: meteor.word, style: untypedStyle });
  untypedText.anchor.set(0.5, 0);
  untypedText.position.set(0, meteor.height / 2 + WORD_OFFSET_Y + WORD_FONT_SIZE);
  untypedText.alpha = WORD_UNTYPED_ALPHA;
  container.addChild(untypedText);

  const typedText = new Text({ text: "", style: typedStyle });
  typedText.anchor.set(0, 0);
  typedText.alpha = WORD_TYPED_ALPHA;
  typedText.visible = false;
  container.addChild(typedText);

  return { data: meteor, container, sprite, untypedText, typedText };
}

export function createBulletGraphics(): Graphics {
  const g = new Graphics();
  g.circle(0, 0, BULLET_RENDER_RADIUS);
  g.fill(0xffffff);
  return g;
}
