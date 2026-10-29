"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { RadioCards } from "@/design-system/ui/radio-cards";
import { Button } from "@/design-system/ui/button";
import { formatDate, leaseEndDate } from "@/shared/lib/dates";
import { maskCep, maskCpf, maskMoney, maskPhone } from "@/shared/lib/format";
import {
  expenseOptions,
  type ContractData,
  type ExpenseOption,
} from "../schema";
import { ClauseList } from "./clause-list";
import {
  FieldShell,
  inputClass,
  Section,
  SwitchField,
  TextField,
} from "./fields";

const onlyDigits = (max: number) => (value: string) =>
  value.replace(/\D/g, "").slice(0, max);

function PartyFields({ who }: { who: "locador" | "locatario" }) {
  return (
    <>
      <TextField
        name={`${who}.nome`}
        label="Nome completo"
        className="sm:col-span-6"
        autoComplete="off"
      />
      <TextField
        name={`${who}.cpf`}
        label="CPF"
        mask={maskCpf}
        inputMode="numeric"
        className="sm:col-span-2"
      />
      <TextField name={`${who}.rg`} label="RG" className="sm:col-span-2" />
      <TextField
        name={`${who}.orgaoEmissor`}
        label="Órgão emissor"
        placeholder="SSP/MA"
        className="sm:col-span-2"
      />
      <TextField
        name={`${who}.profissao`}
        label="Profissão"
        className="sm:col-span-3"
      />
      <TextField
        name={`${who}.estadoCivil`}
        label="Estado civil"
        hint="opcional"
        className="sm:col-span-3"
      />
      <TextField
        name={`${who}.endereco`}
        label="Endereço residencial"
        placeholder="Rua, número, complemento, bairro"
        className="sm:col-span-6"
      />
      <TextField
        name={`${who}.cep`}
        label="CEP"
        mask={maskCep}
        inputMode="numeric"
        className="sm:col-span-2"
      />
      <TextField
        name={`${who}.cidade`}
        label="Cidade - UF"
        placeholder="Imperatriz - MA"
        className="sm:col-span-4"
      />
      <TextField
        name={`${who}.email`}
        label="E-mail"
        hint="opcional"
        type="email"
        className="sm:col-span-3"
      />
      <TextField
        name={`${who}.telefone`}
        label="Telefone"
        hint="opcional"
        mask={maskPhone}
        inputMode="tel"
        className="sm:col-span-3"
      />
    </>
  );
}

function LeaseEnd() {
  const [inicio, prazo] = useWatch<ContractData, ["inicio", "prazoMeses"]>({
    name: ["inicio", "prazoMeses"],
  });
  const end = formatDate(leaseEndDate(inicio, Number(prazo)));
  return (
    <FieldShell
      id="lease-end"
      label="Término"
      hint="automático"
      className="sm:col-span-2"
    >
      <output
        id="lease-end"
        className={`${inputClass} flex items-center bg-muted/60`}
      >
        {end || "—"}
      </output>
    </FieldShell>
  );
}

export function ContractForm({
  onEditClause,
}: {
  onEditClause: (id: string) => void;
}) {
  const { setValue, getValues, control } = useFormContext<ContractData>();
  const despesas = useWatch({ control, name: "despesas" });
  const testemunhas = useWatch({ control, name: "testemunhas" });
  const cidadeImovel = useWatch({ control, name: "imovel.cidade" });
  const foro = useWatch({ control, name: "foro" });

  return (
    <div className="flex flex-col gap-8 pb-16">
      <Section
        id="locador"
        title="Locador(a)"
        description="Proprietário do imóvel."
      >
        <PartyFields who="locador" />
      </Section>

      <Section
        id="locatario"
        title="Locatário(a)"
        description="Quem vai alugar."
      >
        <PartyFields who="locatario" />
      </Section>

      <Section id="imovel" title="Imóvel">
        <TextField
          name="imovel.descricao"
          label="Tipo do imóvel"
          placeholder="residencial/apartamento"
          className="sm:col-span-6"
        />
        <div className="sm:col-span-6">
          <SwitchField
            name="imovel.mobiliado"
            label="Mobiliado"
            description="Acrescenta “mobiliado” na Cláusula Primeira."
          />
        </div>
        <TextField
          name="imovel.endereco"
          label="Endereço completo"
          placeholder="Rua, número, bloco, apto., bairro"
          className="sm:col-span-6"
        />
        <TextField
          name="imovel.cep"
          label="CEP"
          mask={maskCep}
          inputMode="numeric"
          className="sm:col-span-2"
        />
        <TextField
          name="imovel.cidade"
          label="Cidade - UF"
          placeholder="Imperatriz - MA"
          className="sm:col-span-4"
        />
        <TextField
          name="imovel.contaEnergia"
          label="Conta contrato de energia"
          inputMode="numeric"
          className="sm:col-span-3"
        />
      </Section>

      <Section id="valores" title="Prazo e valores">
        <TextField
          name="inicio"
          label="Início"
          type="date"
          className="sm:col-span-2"
          onValueChange={(value) => {
            // The due day usually matches the start day (19/10 → dia 19).
            if (!getValues("diaVencimento") && value) {
              setValue("diaVencimento", String(Number(value.slice(8, 10))));
            }
          }}
        />
        <TextField
          name="prazoMeses"
          label="Prazo (meses)"
          mask={onlyDigits(3)}
          inputMode="numeric"
          className="sm:col-span-2"
        />
        <LeaseEnd />
        <TextField
          name="aluguel"
          label="Aluguel (R$)"
          mask={maskMoney}
          inputMode="numeric"
          placeholder="0,00"
          className="sm:col-span-2"
        />
        <TextField
          name="caucao"
          label="Caução (R$)"
          mask={maskMoney}
          inputMode="numeric"
          placeholder="0,00"
          className="sm:col-span-2"
        />
        <div className="flex items-end sm:col-span-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setValue("caucao", getValues("aluguel"), { shouldDirty: true })
            }
          >
            Caução = aluguel
          </Button>
        </div>
        <TextField
          name="diaVencimento"
          label="Dia do vencimento"
          mask={onlyDigits(2)}
          inputMode="numeric"
          className="sm:col-span-2"
        />
        <TextField
          name="multaMeses"
          label="Multa rescisória (meses)"
          mask={onlyDigits(2)}
          inputMode="numeric"
          className="sm:col-span-2"
        />
        <TextField
          name="formaPagamento"
          label="Forma de pagamento"
          hint="“via …”"
          className="sm:col-span-6"
        />
      </Section>

      <Section
        id="despesas"
        title="Despesas do locatário"
        description="Muda as Cláusulas Nona, Décima e Décima Terceira."
      >
        <RadioCards
          aria-label="Despesas do locatário"
          className="sm:col-span-6"
          value={despesas}
          onValueChange={(value: ExpenseOption) =>
            setValue("despesas", value, { shouldDirty: true })
          }
          options={Object.entries(expenseOptions).map(([value, option]) => ({
            value: value as ExpenseOption,
            ...option,
          }))}
        />
      </Section>

      <Section id="assinatura" title="Foro e assinatura">
        <TextField
          name="foro"
          label="Foro"
          hint="vazio = cidade do imóvel"
          placeholder={cidadeImovel || "Cidade - UF"}
          className="sm:col-span-3"
        />
        <TextField
          name="localAssinatura"
          label="Local da assinatura"
          hint="vazio = foro"
          placeholder={foro || cidadeImovel || "Cidade - UF"}
          className="sm:col-span-3"
        />
        <TextField
          name="dataAssinatura"
          label="Data da assinatura"
          type="date"
          className="sm:col-span-2"
        />
        <div className="sm:col-span-6">
          <SwitchField
            name="testemunhas"
            label="Testemunhas"
            description="Adiciona duas assinaturas e a menção no fechamento."
          />
        </div>
        {testemunhas &&
          (["testemunha1", "testemunha2"] as const).map((key, index) => (
            <div key={key} className="contents">
              <TextField
                name={`${key}.nome`}
                label={`Testemunha ${index + 1}`}
                className="sm:col-span-4"
              />
              <TextField
                name={`${key}.cpf`}
                label="CPF"
                mask={maskCpf}
                inputMode="numeric"
                className="sm:col-span-2"
              />
            </div>
          ))}
      </Section>

      <Section
        id="clausulas"
        title="Cláusulas"
        description="Edite o texto de uma cláusula só neste contrato, quando fugir do padrão."
      >
        <ClauseList className="sm:col-span-6" onEdit={onEditClause} />
      </Section>
    </div>
  );
}
