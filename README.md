# Contratos · Rose Barbosa

Gerador de contratos de locação residencial no papel timbrado da corretora. Formulário à esquerda, prévia do PDF ao vivo à direita, download em um clique.

Mesma base do site da corretora (`../rose/rose-barbosa-corretora`): Next.js App Router, TypeScript, Tailwind CSS 4, Base UI no padrão shadcn, Hugeicons e Bun.

## Executar

```sh
bun install
bun dev
```

```sh
bun test src        # extenso, datas, máscaras e texto do contrato
bun run typecheck
bun run lint
bun run build
```

## Como funciona

- **Tudo no navegador.** O PDF é gerado com `@react-pdf/renderer` e a prévia é desenhada com `pdfjs-dist`. Nenhum dado (CPF, RG, endereço) vai para um servidor.
- **Rascunhos** ficam no `localStorage` deste navegador (botão _Contratos_). Trocar de navegador ou limpar os dados do site apaga os rascunhos.
- **Campos faltando** aparecem em amarelo no PDF e na lista do topo. CPF inválido e RG igual ao CPF geram aviso, mas nunca bloqueiam o download.
- **Calculado sozinho:** valores por extenso, prazo e multa por extenso, data de término (início + prazo − 1 dia), dia de vencimento sugerido a partir do início, foro e local da assinatura a partir da cidade do imóvel.
- **Opções que mudam cláusulas:** imóvel mobiliado (Cl. 1), despesas do locatário (Cl. 9, 10 e 13) e testemunhas (assinaturas e fechamento).
- **Editar só neste contrato:** qualquer cláusula pode ter o texto reescrito à mão. O texto editado fica fixo e não acompanha mudanças feitas depois nos campos.

## Onde mexer

```text
src/
  app/                         # layout e página única
  design-system/               # base (Base UI), ui (Button, Dialog, Switch, RadioCards), ícones, tokens
  features/contracts/
    template/residencial.ts    # texto das cláusulas, igual ao "Modelo de contrato timbrado - Rose.docx"
    schema.ts                  # campos do contrato (zod)
    pdf/contract-pdf.tsx       # diagramação A4 com o timbrado
    components/                # formulário, prévia, rascunhos, editor de cláusulas
    lib/                       # avisos e rascunhos
  shared/                      # extenso, datas, máscaras, config da corretora
public/letterhead/timbrado.png # timbrado extraído do .docx (1414×2000)
```

Para mudar o texto padrão de uma cláusula, edite `template/residencial.ts`. Os testes em `residencial.test.ts` mostram o resultado esperado.
