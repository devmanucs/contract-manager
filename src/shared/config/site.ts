export const site = {
  name: "Contratos · Rose Barbosa",
  description:
    "Gerador de contratos de locação no papel timbrado da corretora.",
  broker: {
    name: "Rose Barbosa",
    creci: "8740",
  },
  letterhead: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/letterhead/timbrado.png`,
} as const;
