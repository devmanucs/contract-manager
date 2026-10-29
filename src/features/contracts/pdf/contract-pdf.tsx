import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type {
  ContractDocument,
  Field,
  Paragraph,
  Segment,
  Signature,
} from "../template/types";

// Mirrors "Modelo de contrato timbrado - Rose.docx": A4, full-page letterhead
// behind the text, Arial 10pt justified with 2 cm side margins. Helvetica is
// the PDF base font metrically equal to Arial, so no font file is embedded.

// The default hyphenator is English; contracts must not split Portuguese words.
Font.registerHyphenationCallback((word) => [word]);
// react-pdf also offers a hyphenated break wherever a word touches a style
// change ("MA" + ","), which printed "solteiro-" / ", Vendedor". Its line
// breaker treats a penalty of 10000 as "never break here".
const NO_HYPHENATION = 10000;

const A4 = { width: 595.28, height: 841.89 };
const twip = (value: number) => value / 20;
const margin = twip(1134);

const styles = StyleSheet.create({
  page: {
    paddingTop: 128,
    paddingBottom: margin,
    paddingHorizontal: margin,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.32,
    color: "#222222",
  },
  // Absolute size: "100%" resolves against the padded content box, which
  // shrank the letterhead to ~75% of the sheet.
  letterhead: {
    position: "absolute",
    top: 0,
    left: 0,
    width: A4.width,
    height: A4.height,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 17.5,
    color: "#242424",
    textAlign: "center",
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: "Helvetica-Bold",
    color: "#555555",
    textAlign: "center",
    marginBottom: 18,
  },
  paragraph: { textAlign: "justify", marginBottom: twip(110) },
  item: {
    textAlign: "justify",
    marginBottom: twip(110),
    paddingLeft: twip(1446 - 1134),
  },
  heading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    color: "#242424",
    marginTop: twip(160),
    marginBottom: twip(70) + 2,
    paddingBottom: 1,
    borderBottomWidth: 0.6,
    borderBottomColor: "#c8c8c8",
  },
  strong: { fontFamily: "Helvetica-Bold" },
  value: {
    fontFamily: "Helvetica-Bold",
    color: "#444444",
    backgroundColor: "#f2f2f2",
  },
  missing: {
    fontFamily: "Helvetica-Bold",
    color: "#8a4b00",
    backgroundColor: "#ffe7a3",
  },
  placeAndDate: { textAlign: "right", marginTop: 14, marginBottom: 28 },
  signatures: { flexDirection: "row", flexWrap: "wrap", columnGap: 28 },
  signature: { width: "46%", marginBottom: 30, textAlign: "center" },
  signatureLine: {
    height: 30,
    borderBottomWidth: 0.6,
    borderBottomColor: "#7f7f7f",
    marginBottom: 4,
  },
  signatureName: { fontSize: 9 },
  signatureRole: { fontSize: 7.5, color: "#666666", marginTop: 1 },
});

function FieldText({ field }: { field: Field }) {
  return field.value ? (
    <Text style={styles.value}>{field.value}</Text>
  ) : (
    <Text style={styles.missing}>[{field.placeholder}]</Text>
  );
}

function SegmentText({ segment }: { segment: Segment }) {
  if (typeof segment === "string") return segment;
  if (segment.kind === "strong")
    return <Text style={styles.strong}>{segment.text}</Text>;
  return <FieldText field={segment} />;
}

function ParagraphText({ paragraph }: { paragraph: Paragraph }) {
  return (
    <Text
      style={paragraph.kind === "item" ? styles.item : styles.paragraph}
      hyphenationPenalty={NO_HYPHENATION}
      orphans={2}
      widows={2}
    >
      {paragraph.segments.map((segment, index) => (
        <SegmentText key={index} segment={segment} />
      ))}
    </Text>
  );
}

function SignatureBlock({ signature }: { signature: Signature }) {
  return (
    <View style={styles.signature} wrap={false}>
      <View style={styles.signatureLine} />
      <Text style={styles.signatureName}>
        <FieldText field={signature.name} />
      </Text>
      <Text style={styles.signatureRole}>
        {signature.role}
        {"  •  CPF: "}
        {signature.cpf.value || `[${signature.cpf.placeholder}]`}
      </Text>
    </View>
  );
}

export function ContractPdf({
  document,
  letterheadUrl,
  title,
}: {
  document: ContractDocument;
  letterheadUrl: string;
  title: string;
}) {
  return (
    <Document title={title} author="Rose Barbosa" language="pt-BR">
      <Page size="A4" style={styles.page}>
        {/* react-pdf's Image has no alt; the letterhead is decorative. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={letterheadUrl} style={styles.letterhead} fixed />

        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.subtitle}>{document.subtitle}</Text>

        {document.intro.map((paragraph, index) => (
          <ParagraphText key={index} paragraph={paragraph} />
        ))}

        {document.clauses.map((clause) => (
          <View key={clause.id}>
            <Text style={styles.heading} minPresenceAhead={36}>
              {clause.heading}
            </Text>
            {clause.paragraphs.map((paragraph, index) => (
              <ParagraphText key={index} paragraph={paragraph} />
            ))}
          </View>
        ))}

        {document.closing.map((paragraph, index) => (
          <ParagraphText key={index} paragraph={paragraph} />
        ))}

        <View wrap={false}>
          <Text style={styles.placeAndDate} hyphenationPenalty={NO_HYPHENATION}>
            {document.placeAndDate.segments.map((segment, index) => (
              <SegmentText key={index} segment={segment} />
            ))}
          </Text>
          <View style={styles.signatures}>
            {document.signatures.slice(0, 2).map((signature) => (
              <SignatureBlock key={signature.role} signature={signature} />
            ))}
          </View>
        </View>
        {document.signatures.length > 2 && (
          <View style={styles.signatures} wrap={false}>
            {document.signatures.slice(2).map((signature, index) => (
              <SignatureBlock key={index} signature={signature} />
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
