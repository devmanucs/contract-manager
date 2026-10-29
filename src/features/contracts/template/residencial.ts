import { site } from "@/shared/config/site";
import { formatDate, formatLongDate, leaseEndDate } from "@/shared/lib/dates";
import { currencyToWords, numberToWords } from "@/shared/lib/extenso";
import { formatMoney, parseMoney } from "@/shared/lib/format";
import type { ContractData, Party } from "../schema";
import type {
  Clause,
  ContractDocument,
  Field,
  Paragraph,
  Segment,
} from "./types";

// Residential lease on the Rose Barbosa letterhead. Clause texts follow
// "Modelo de contrato timbrado - Rose.docx"; only the bracketed fields and
// the options in ContractData vary between contracts.

const field = (value: string, placeholder: string): Field => ({
  kind: "field",
  value: value.trim(),
  placeholder,
});
const strong = (text: string) => ({ kind: "strong", text }) as const;
const p = (...segments: Segment[]): Paragraph => ({ kind: "text", segments });
const item = (...segments: Segment[]): Paragraph => ({
  kind: "item",
  segments,
});

const upper = (value: string) => value.toLocaleUpperCase("pt-BR");

function months(value: string, placeholder: string): Segment[] {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return [field("", placeholder), " meses"];
  return [field(numberToWords(n), placeholder), n === 1 ? " mês" : " meses"];
}

function money(value: string): Segment[] {
  const amount = parseMoney(value);
  return [
    "R$ ",
    field(amount === null ? "" : formatMoney(amount), "VALOR"),
    " (",
    field(amount === null ? "" : currencyToWords(amount), "VALOR POR EXTENSO"),
    ")",
  ];
}

function party(
  data: Party,
  role: "LOCADOR(A)" | "LOCATÁRIO(A)",
  addressPlaceholder: string,
): Segment[] {
  const segments: Segment[] = [
    field(upper(data.nome), `NOME DO ${role}`),
    ", RG: ",
    field(data.rg, "NÚMERO DO RG"),
    " ",
    field(data.orgaoEmissor, "ÓRGÃO EMISSOR/ESTADO"),
    ", CPF: ",
    field(data.cpf, "NÚMERO DO CPF"),
    ", ",
  ];
  if (data.estadoCivil.trim()) segments.push(data.estadoCivil.trim(), ", ");
  segments.push(
    field(data.profissao, "PROFISSÃO"),
    ", residente e domiciliado(a) na ",
    field(data.endereco, addressPlaceholder),
    ", CEP: ",
    field(data.cep, "CEP"),
    ", na cidade de ",
    field(data.cidade, "CIDADE - UF"),
  );

  const contacts: string[] = [];
  if (data.email.trim()) contacts.push(`E-mail: ${data.email.trim()};`);
  if (data.telefone.trim()) contacts.push(`Telefone: ${data.telefone.trim()};`);
  segments.push(contacts.length ? `, ${contacts.join(" ")} ` : ", ");
  segments.push("doravante denominado ", strong(role), ".");
  return segments;
}

const expenses = {
  consumo: {
    tenantPays:
      "Despesas de consumo de energia elétrica, água e gás. Os comprovantes dos pagamentos deverão ser entregues ao(à) LOCADOR(A) pelo(a) LOCATÁRIO(A) ou ao seu representante legal, junto com o pagamento do aluguel referente ao mês correspondente.",
    depositDebts: "como aluguéis em atraso, entre outros débitos da locação,",
    finalBills: "energia, água e gás",
  },
  completo: {
    tenantPays:
      "Despesas com Impostos, Energia Elétrica, Água, Taxas de Esgoto, IPTU, Taxa de Pintura e serviços semelhantes, exceto a taxa de condomínio que já está inclusa no aluguel. Os comprovantes dos pagamentos deverão ser entregues ao(à) LOCADOR(A) pelo(a) LOCATÁRIO(A) ou ao seu representante legal, junto com o pagamento do aluguel referente ao mês correspondente.",
    depositDebts:
      "como aluguéis em atraso, despesas condominiais não quitadas, entre outros,",
    finalBills: "energia, água e demais despesas",
  },
} as const;

type ClauseDraft = Omit<Clause, "overridden">;

function clauses(data: ContractData): ClauseDraft[] {
  const { imovel } = data;
  const exp = expenses[data.despesas];
  const end = leaseEndDate(data.inicio, Number(data.prazoMeses));
  const foro = data.foro.trim() || imovel.cidade;

  return [
    {
      id: "objeto",
      heading: "CLÁUSULA PRIMEIRA – OBJETO DO CONTRATO",
      paragraphs: [
        p(
          "O presente contrato tem como OBJETO um imóvel ",
          field(
            `${imovel.descricao.trim()}${imovel.mobiliado ? " mobiliado" : ""}`,
            "TIPO DO IMÓVEL",
          ),
          " (conforme laudo de vistoria em anexo com fotos e vídeos), localizado na ",
          field(imovel.endereco, "ENDEREÇO COMPLETO DO IMÓVEL LOCADO"),
          ", CEP: ",
          field(imovel.cep, "CEP"),
          ", na cidade de ",
          field(imovel.cidade, "CIDADE - UF"),
          ", vinculado à Conta Contrato nº ",
          field(imovel.contaEnergia, "NÚMERO DA CONTA CONTRATO DE ENERGIA"),
          " junto à concessionária de energia, o qual se encontra livre e desembaraçado, desocupado e sem qualquer pendência judicial.",
        ),
      ],
    },
    {
      id: "destinacao",
      heading: "CLÁUSULA SEGUNDA – DESTINAÇÃO",
      paragraphs: [
        p(
          "O(A) LOCATÁRIO(A) utilizará o Imóvel exclusivamente para FINS RESIDENCIAIS, destino que não poderá ser alterado sem o prévio consentimento escrito do(a) LOCADOR(A), sendo vedada qualquer cessão, transferência ou sublocação, ainda quando parcial e temporária, gratuita ou onerosa. Na hipótese de o(a) LOCATÁRIO(A) abandonar o Imóvel, fica o(a) LOCADOR(A) autorizado(a) a tomar a posse do Imóvel, a fim de evitar a depredação ou invasão no mesmo, sem prejuízo do integral cumprimento das demais sanções legais e contratuais.",
        ),
      ],
    },
    {
      id: "intermediacao",
      heading: "CLÁUSULA TERCEIRA – DA INTERMEDIAÇÃO E TITULARIDADE",
      paragraphs: [
        p(
          "Fica qualificada como intermediadora do presente instrumento a corretora ",
          field(site.broker.name, "NOME DA CORRETORA"),
          ", inscrita no CRECI sob o nº ",
          field(site.broker.creci, "NÚMERO DO CRECI"),
          ". Caberá exclusivamente à corretora a responsabilidade de realizar e acompanhar todos os trâmites necessários.",
        ),
      ],
    },
    {
      id: "violacao",
      heading: "CLÁUSULA QUARTA – VIOLAÇÃO",
      paragraphs: [
        p(
          "Será considerada como violação da Cláusula ante-anterior qualquer situação de fato pela qual o(a) LOCATÁRIO(A) deixe de ocupar direta e integralmente o Imóvel locado, em seu nome e conta própria.",
        ),
      ],
    },
    {
      id: "prazo",
      heading: "CLÁUSULA QUINTA – PRAZO",
      paragraphs: [
        p(
          "A locação será pelo prazo determinado de ",
          ...months(data.prazoMeses, "PRAZO POR EXTENSO"),
          ", iniciando-se a partir de ",
          field(formatDate(data.inicio), "DATA DE INÍCIO"),
          " e término no dia ",
          field(formatDate(end), "DATA DE TÉRMINO"),
          ", data em que o(a) LOCATÁRIO(A) obriga-se a devolver o imóvel completamente desocupado e nas mesmas condições em que o recebeu.",
        ),
      ],
    },
    {
      id: "multa",
      heading: "CLÁUSULA SEXTA – MULTA RESCISÓRIA",
      paragraphs: [
        p(
          "Se o(a) LOCATÁRIO(A) devolver o Imóvel ou o(a) LOCADOR(A) pedir o imóvel antes de transcorrido o prazo estabelecido na Cláusula anterior, ou caso a rescisão ocorra por inadimplência de obrigação aqui ajustada ou qualquer violação às cláusulas deste contrato, pagará uma multa contratual correspondente ao valor de ",
          ...months(data.multaMeses, "NÚMERO POR EXTENSO"),
          " de aluguel proporcionais, sem prejuízo do integral cumprimento das demais sanções legais e contratuais.",
        ),
      ],
    },
    {
      id: "prorrogacao",
      heading: "CLÁUSULA SÉTIMA – PRORROGAÇÃO DO CONTRATO",
      paragraphs: [
        p(
          "Findo o prazo de locação estipulado na Cláusula Quinta, se não ocorrer a hipótese de rescisão ou renúncia (o que, neste último caso, deverá ocorrer mediante aviso prévio por escrito de quaisquer dos contratantes até 30 dias antes do vencimento de cada período contratual), prorrogar-se-á automaticamente a locação por um prazo igual ao anterior sem a necessidade de assinatura de um novo Contrato, com as mesmas Cláusulas e garantias do Contrato vigente.",
        ),
        p(
          strong("Parágrafo Primeiro:"),
          " Caso seja prorrogado o contrato automaticamente, os valores dos aluguéis serão corrigidos pelo Índice estabelecido na Cláusula Oitava.",
        ),
      ],
    },
    {
      id: "preco",
      heading: "CLÁUSULA OITAVA – PREÇO E REAJUSTE",
      paragraphs: [
        p(
          "O valor do aluguel mensal será de ",
          ...money(data.aluguel),
          ", a ser pago no ato da assinatura deste contrato pelo(a) LOCATÁRIO(A) via ",
          field(data.formaPagamento, "FORMA DE PAGAMENTO"),
          ". Os demais pagamentos deverão ser quitados até o dia ",
          field(data.diaVencimento, "DIA DO VENCIMENTO"),
          " de cada mês a vencer (pagos da mesma forma), reajustáveis anualmente pelo índice abaixo mencionado.",
        ),
        item(
          "a) O pagamento fora do prazo implicará em multa de 10% (dez por cento) mais juros de mora de 1% (um por cento) ao mês, contados dia a dia e correção monetária pelo índice divulgado. Decorrido o prazo de 10 (dez) dias do vencimento, o débito será automaticamente, e sem aviso prévio, encaminhado ao departamento jurídico para cobrança amigável e/ou judicial.",
        ),
        item(
          "b) A correção anual se dará pelo índice “IGP-M/FGV”. Seja por motivo de extinção ou não, fica desde já estabelecido que os índices substitutos serão, sucessivamente, o IPC (FIPE), IGP (FGV) e o IPC (FGV), respectivamente pela ordem. Caso estes índices sejam extintos ou não calculados, o reajuste será feito pela média de três índices à escolha do(a) locador(a) que reflitam a variação da inflação ocorrida no período.",
        ),
      ],
    },
    {
      id: "garantia",
      heading: "CLÁUSULA NONA – GARANTIA",
      paragraphs: [
        p(
          "Em garantia aos pagamentos dos aluguéis e demais obrigações aqui assumidas, o(a) LOCATÁRIO(A) depositará a título de caução, em favor do(a) LOCADOR(A), o equivalente a ",
          ...money(data.caucao),
          ", que será pago à vista no ato da assinatura deste contrato.",
        ),
        p(
          strong("Parágrafo Primeiro:"),
          " A caução fornecida pelo(a) LOCATÁRIO(A) poderá ser utilizada pelo(a) LOCADOR(A) para cobrir os prejuízos decorrentes do descumprimento das obrigações previstas neste contrato, de acordo com o estabelecido pela Lei do Inquilinato e pelo Código Civil Brasileiro. Caso o(a) LOCADOR(A) opte por utilizar parte ou a totalidade da caução para cobrir débitos ou danos, deverá notificar o(a) LOCATÁRIO(A) por escrito, especificando os motivos e os valores descontados, respeitando o prazo de 30 (trinta) dias para a devolução do restante da caução, se houver.",
        ),
        p(
          strong("Parágrafo Segundo:"),
          ` Ao término do contrato de locação, a caução fornecida será devolvida integralmente, descontadas eventuais reparações de danos causados pelo(a) LOCATÁRIO(A) (além do desgaste natural decorrente do uso regular do imóvel), bem como débitos devidos relativos à locação, ${exp.depositDebts} conforme estabelecido pela Lei do Inquilinato (Lei nº 8.245/91) e pelo Código Civil Brasileiro. A devolução da caução será realizada em até 30 (trinta) dias após a entrega das chaves do imóvel, mediante a apresentação do recibo de quitação de todas as obrigações previstas neste contrato. Para sanar qualquer divergência quanto aos valores a serem descontados da caução, será realizada uma vistoria de saída no imóvel, a qual terá como base a vistoria de entrada.`,
        ),
      ],
    },
    {
      id: "despesas",
      heading: "CLÁUSULA DÉCIMA – OUTRAS DESPESAS E TRANSFERÊNCIA",
      paragraphs: [
        p(
          "O valor do aluguel será pago integralmente livre de impostos ao(à) LOCADOR(A), respeitando a legislação sobre a renda, sendo de responsabilidade do(a) LOCATÁRIO(A) as seguintes obrigações:",
        ),
        item(`a) ${exp.tenantPays}`),
      ],
    },
    {
      id: "outras-obrigacoes",
      heading: "CLÁUSULA DÉCIMA PRIMEIRA – OUTRAS OBRIGAÇÕES",
      paragraphs: [
        p(
          "Além das obrigações mencionadas nas cláusulas anteriores, qualquer outra despesa que caiba ao(à) LOCADOR(A) e for paga pelo(a) LOCATÁRIO(A) poderá este também cobrá-la junto e indissoluvelmente com qualquer aluguel subsequente, aplicando-se à demora ou recusa de ressarcimento as mesmas sanções que decorrerem de atraso no pagamento dos aluguéis.",
        ),
      ],
    },
    {
      id: "correspondencia",
      heading:
        "CLÁUSULA DÉCIMA SEGUNDA – CORRESPONDÊNCIA, INTIMAÇÃO E NOTIFICAÇÃO",
      paragraphs: [
        p(
          "Obriga-se o(a) LOCATÁRIO(A) a entregar ao(à) LOCADOR(A) ou seu representante legal, dentro das 48 (quarenta e oito) horas de seu recebimento, qualquer correspondência, intimação ou notificação que lhe for entregue no imóvel locado; caso não o faça, assume integralmente todas as responsabilidades exigidas em tais intervenções e suas consequências.",
        ),
      ],
    },
    {
      id: "diferencas",
      heading: "CLÁUSULA DÉCIMA TERCEIRA – DIFERENÇAS",
      paragraphs: [
        p(
          `No ato da entrega das chaves, o(a) LOCADOR(A) liquidará os aluguéis até a data e apresentará os comprovantes quitados das despesas de que trata a Cláusula Décima, e depositará mediante recibo a importância correspondente ao consumo de ${exp.finalBills} dos dias que excederem o último pagamento, calculada com base no valor médio dos 03 (três) meses anteriores.`,
        ),
      ],
    },
    {
      id: "conservacao",
      heading: "CLÁUSULA DÉCIMA QUARTA – CONSERVAÇÃO",
      paragraphs: [
        p(
          "Obriga-se o(a) LOCATÁRIO(A) a devolver o imóvel no estado em que o recebeu (Art. 569, IV do Código Civil), de acordo com os Laudos de Vistoria em anexo, que passam a ser parte integrante deste Contrato. O(A) LOCATÁRIO(A) declara que visitou e examinou previamente o imóvel locado, encontrando-o conforme o Termo de Vistoria assinado pelas partes, zelando pelo que nele contiver e fazendo de imediato e por sua conta todos os reparos dos estragos provenientes do uso normal no curso da locação (de modo especial os decorrentes de entupimentos e obstruções na rede de esgoto e água pluvial), para assim restituí-lo quando findo ou rescindido este Contrato, sem direito a retenção ou indenização por quaisquer gastos, mesmo que tenham sido feitos com autorização.",
        ),
      ],
    },
    {
      id: "reparos",
      heading: "CLÁUSULA DÉCIMA QUINTA – REPAROS",
      paragraphs: [
        p(
          "Havendo divergência nas vistorias de entrega e recebimento do imóvel, o(a) LOCADOR(A) autoriza o(a) LOCATÁRIO(A) a fazer pinturas (salvo no caso de pagamento de taxa de pintura antecipada), colocação de vidros etc., e a exigir o ressarcimento tão logo apresente as notas fiscais e recibos de mão de obra correspondentes. O(A) LOCADOR(A) não responderá, em nenhum caso, por quaisquer danos que venha a sofrer o(a) LOCATÁRIO(A) em razão de derramamento de líquidos (água de rompimento de canos, de chuvas, de abertura de torneiras, defeitos de esgotos ou fossas, incêndios, arrombamentos, roubos, furtos, casos fortuitos ou de força maior).",
        ),
      ],
    },
    {
      id: "danos",
      heading: "CLÁUSULA DÉCIMA SEXTA – DANOS",
      paragraphs: [
        p(
          "O(A) LOCATÁRIO(A) será responsável pelos danos causados ao imóvel pelo mau uso ou por aqueles que afetarem os vizinhos, bem como ao condomínio, não se prejudicando durante os respectivos reparos a continuidade deste Contrato, em todos os seus efeitos.",
        ),
      ],
    },
    {
      id: "inspecao",
      heading: "CLÁUSULA DÉCIMA SÉTIMA – INSPEÇÃO",
      paragraphs: [
        p(
          "O(A) LOCADOR(A) ou seu representante legal poderá, com prévia comunicação formal, inspecionar o imóvel, pessoalmente ou através de representantes, sendo tal vistoria imprescindível antes da restituição, a fim de verificar a fiel observância das obrigações assumidas pelo(a) LOCATÁRIO(A), o(a) qual não poderá, sob pretexto algum, fazer oposição a esse direito.",
        ),
      ],
    },
    {
      id: "benfeitorias",
      heading: "CLÁUSULA DÉCIMA OITAVA – BENFEITORIAS",
      paragraphs: [
        p(
          "As benfeitorias ou acessões que vierem a ser introduzidas de qualquer natureza no imóvel locado serão incorporadas automaticamente a ele, e passarão integralmente à plena propriedade do(a) LOCADOR(A). O(A) LOCATÁRIO(A) renuncia desde logo, de modo irrevogável, a todo direito de indenização, compensação ou retenção aos valores despendidos pelas benfeitorias úteis e voluptuárias, resguardando o direito de retenção das necessárias.",
        ),
      ],
    },
    {
      id: "adaptacoes",
      heading: "CLÁUSULA DÉCIMA NONA – ADAPTAÇÕES",
      paragraphs: [
        p(
          "O(A) LOCADOR(A) desde já autoriza o(a) LOCATÁRIO(A) a fazer as adaptações que se fizerem necessárias à instalação de aparelhos eletrodomésticos, inclusive ar-condicionado no imóvel objeto dessa locação.",
        ),
      ],
    },
    {
      id: "preferencia",
      heading: "CLÁUSULA VIGÉSIMA – DIREITO DE PREFERÊNCIA",
      paragraphs: [
        p(
          "Em caso de venda do imóvel, o(a) LOCATÁRIO(A) será notificado(a) por escrito, garantindo-lhe o direito de preferência previsto na Lei do Inquilinato, através de carta com aviso de recebimento. Não se manifestando o(a) LOCATÁRIO(A) no prazo legal de 30 dias, será considerado como desistente. Não manifestando interesse na compra do imóvel, o(a) LOCATÁRIO(A) autoriza o(a) LOCADOR(A) a mostrá-lo aos futuros pretendentes, desde que acompanhados de um corretor credenciado, com data e hora marcadas previamente.",
        ),
      ],
    },
    {
      id: "sancoes",
      heading: "CLÁUSULA VIGÉSIMA PRIMEIRA – SANÇÕES",
      paragraphs: [
        p(
          "À inadimplência total ou parcial de quaisquer das obrigações deste Contrato serão aplicadas cumulativamente ou alternativamente, a juízo do(a) LOCADOR(A) ou de sua representante legal, as seguintes sanções:",
        ),
        item(
          "a) Rescisão contratual automática, independente de interpelação judicial ou extrajudicial. Não significa a tolerância de qualquer infração como renúncia de direito, caso a mesma se repita ou se prolongue, com exigências das obrigações financeiras totais previstas neste Contrato, por antecipação. Multa penal igual ao valor do dano, em se tratando de mau uso do imóvel e suas benfeitorias.",
        ),
        item(
          "b) Perdas e danos que se apurarem, incluindo custas processuais.",
        ),
        item(
          "c) Pagamentos dos honorários dos advogados e peritos do(a) LOCADOR(A) ou sua representante legal, desde já fixado em 20% (vinte por cento) sobre o valor total do contrato.",
        ),
      ],
    },
    {
      id: "foro",
      heading: "CLÁUSULA VIGÉSIMA SEGUNDA – DO FORO",
      paragraphs: [
        p(
          "O presente contrato passa a vigorar entre as partes a partir da assinatura do mesmo, as quais elegem o foro da cidade de ",
          field(foro, "CIDADE DO FORO - UF"),
          ", onde se situa o imóvel, para dirimir quaisquer dúvidas provenientes da execução e cumprimento do mesmo.",
        ),
      ],
    },
  ];
}

const itemPattern = /^[a-z]\)\s/;

/** Turns hand-written clause text back into paragraphs (blank lines are dropped). */
export function paragraphsFromText(text: string): Paragraph[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const label = /^(Parágrafo [^:]+:)(.*)$/.exec(line);
      if (label) return p(strong(label[1]), label[2]);
      return itemPattern.test(line) ? item(line) : p(line);
    });
}

export function segmentText(segment: Segment) {
  if (typeof segment === "string") return segment;
  if (segment.kind === "strong") return segment.text;
  return segment.value || `[${segment.placeholder}]`;
}

/** Plain text of a clause body, used to seed the "edit only here" editor. */
export function clauseText(clause: Pick<Clause, "paragraphs">) {
  return clause.paragraphs
    .map((paragraph) => paragraph.segments.map(segmentText).join(""))
    .join("\n\n");
}

export function buildContract(data: ContractData): ContractDocument {
  const { locador, locatario, imovel } = data;
  const witnesses = [data.testemunha1, data.testemunha2];
  const local =
    data.localAssinatura.trim() || data.foro.trim() || imovel.cidade;

  return {
    title: "CONTRATO DE LOCAÇÃO DE IMÓVEL",
    subtitle: "PARA FINS RESIDENCIAIS",
    intro: [
      p(
        "Por este Instrumento Particular de Contrato de Locação de Imóvel para FINS RESIDENCIAIS, que fazem de um lado ",
        ...party(locador, "LOCADOR(A)", "ENDEREÇO RESIDENCIAL DO LOCADOR"),
      ),
      p(
        "Do outro lado, ",
        ...party(
          locatario,
          "LOCATÁRIO(A)",
          "ENDEREÇO RESIDENCIAL DO LOCATÁRIO",
        ),
      ),
    ],
    clauses: clauses(data).map((clause) => {
      const override = data.overrides[clause.id];
      return override?.trim()
        ? {
            ...clause,
            paragraphs: paragraphsFromText(override),
            overridden: true,
          }
        : { ...clause, overridden: false };
    }),
    closing: [
      p(
        data.testemunhas
          ? "Por estarem, assim, justos e contratados, firmam o presente instrumento em vias de igual teor, juntamente com 2 (duas) testemunhas."
          : "Por estarem, assim, justos e contratados, firmam o presente instrumento em vias de igual teor.",
      ),
    ],
    placeAndDate: p(
      field(local, "CIDADE - UF"),
      ", ",
      field(formatLongDate(data.dataAssinatura), "DIA DE MÊS DE ANO"),
      ".",
    ),
    signatures: [
      {
        name: field(upper(locador.nome), "NOME DO LOCADOR(A)"),
        role: "LOCADOR(A)",
        cpf: field(locador.cpf, "NÚMERO DO CPF"),
      },
      {
        name: field(upper(locatario.nome), "NOME DO LOCATÁRIO(A)"),
        role: "LOCATÁRIO(A)",
        cpf: field(locatario.cpf, "NÚMERO DO CPF"),
      },
      ...(data.testemunhas
        ? witnesses.map((witness, index) => ({
            name: field(upper(witness.nome), `TESTEMUNHA 0${index + 1}`),
            role: "TESTEMUNHA",
            cpf: field(witness.cpf, "NÚMERO DO CPF"),
          }))
        : []),
    ],
  };
}

/** Every placeholder still empty, in reading order (for the checklist). */
export function missingFields(document: ContractDocument) {
  const all: Segment[] = [
    ...document.intro.flatMap((paragraph) => paragraph.segments),
    ...document.clauses.flatMap((clause) =>
      clause.paragraphs.flatMap((paragraph) => paragraph.segments),
    ),
    ...document.placeAndDate.segments,
    ...document.signatures.flatMap((signature) => [
      signature.name,
      signature.cpf,
    ]),
  ];
  return all.filter(
    (segment): segment is Field =>
      typeof segment === "object" && segment.kind === "field" && !segment.value,
  );
}
