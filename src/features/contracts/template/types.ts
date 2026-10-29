/** A filled-in value; an empty `value` renders as the `[PLACEHOLDER]`. */
export type Field = { kind: "field"; value: string; placeholder: string };
export type Strong = { kind: "strong"; text: string };
export type Segment = string | Field | Strong;

export type Paragraph = {
  /** "item" paragraphs are the indented a), b), c) lists. */
  kind: "text" | "item";
  segments: Segment[];
};

export type Clause = {
  id: string;
  heading: string;
  paragraphs: Paragraph[];
  /** True when the body comes from a hand-written override. */
  overridden: boolean;
};

export type Signature = { name: Field; role: string; cpf: Field };

export type ContractDocument = {
  title: string;
  subtitle: string;
  intro: Paragraph[];
  clauses: Clause[];
  closing: Paragraph[];
  placeAndDate: Paragraph;
  signatures: Signature[];
};
