export const IMAGES = {
  hero:           "/images/hero-motor.png",
  motorInternals: "/images/motor-internals.png",
  node:           "/images/nema-17-motor.jpg",
} as const;

const NODE_IMAGE_MAP: Record<string, string> = {
  "MOT-17-A": IMAGES.node,
  "STP-MR-02": IMAGES.node,
  "NEMA-17-Precision": IMAGES.node,
};

const TYPE_IMAGE_MAP: Record<string, string> = {
  Stepper: IMAGES.node,
};

export function getNodeImage(nodeId: string, type?: string): string | null {
  if (NODE_IMAGE_MAP[nodeId]) return NODE_IMAGE_MAP[nodeId];
  if (type && TYPE_IMAGE_MAP[type]) return TYPE_IMAGE_MAP[type];
  return null;
}
