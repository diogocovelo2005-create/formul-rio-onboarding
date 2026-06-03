"use client";

import { useState, useRef, useEffect } from "react";

const STEPS = [
  { id: "negocio", label: "O negócio", icon: "🏪" },
  { id: "equipa", label: "Equipa & Serviços", icon: "👥" },
  { id: "agendamento", label: "Agendamento", icon: "📅" },
  { id: "pagamentos", label: "Pagamentos", icon: "💳" },
  { id: "espaco", label: "Espaço & Produtos", icon: "🏠" },
  { id: "online", label: "Online & Contactos", icon: "📱" },
  { id: "final", label: "Políticas & Notas", icon: "📋" },
];

const ALL_REQ = [
  "nome",
  "setor",
  "morada",
  "maps_link",
  "horarios",
  "profissionais",
  "servicos",
  "pagamentos",
  "booking_link",
  "owner_whatsapp",
];

const REQ_LABELS: Record<string, string> = {
  nome: "Nome do negócio",
  setor: "Setor de atividade",
  morada: "Morada",
  maps_link: "Link Google Maps",
  horarios: "Horário",
  profissionais: "Profissionais",
  servicos: "Serviços",
  pagamentos: "Pagamentos",
  booking_link: "Link de marcações",
  owner_whatsapp: "WhatsApp do responsável",
};

/* ─── SHARED UI ─── */

function Field({
  label,
  placeholder,
  value,
  onChange,
  required,
  hint,
  multi,
  rows = 4,
  missing,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
  multi?: boolean;
  rows?: number;
  missing?: boolean;
}) {
  const showError = missing && required && !value?.trim();
  const base =
    "w-full px-3.5 py-3 text-[15px] rounded-[10px] outline-none transition-colors font-[inherit] leading-relaxed";
  const border = showError
    ? "border-[1.5px] border-error bg-error-bg"
    : "border-[1.5px] border-border bg-background focus:border-accent";

  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-foreground mb-1.5">
        {label}{" "}
        {required && <span className="text-error-text">*</span>}
      </label>
      {hint && (
        <p className="text-[13px] text-muted mb-2 leading-snug whitespace-pre-line">
          {hint}
        </p>
      )}
      {multi ? (
        <textarea
          className={`${base} ${border} resize-y`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          className={`${base} ${border}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {showError && (
        <p className="text-xs text-error font-medium mt-1">
          Este campo é obrigatório
        </p>
      )}
    </div>
  );
}

function Ex({ children }: { children: string }) {
  return (
    <div className="bg-example-bg border border-dashed border-example-border rounded-lg px-3.5 py-2.5 text-[13px] text-example-text -mt-3 mb-5 leading-relaxed whitespace-pre-line">
      <span className="font-semibold text-accent mr-1">Exemplo:</span>
      {children}
    </div>
  );
}

function SectionTitle({ letter, title }: { letter: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="bg-accent text-white w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
        {letter}
      </span>
      <h3
        className="text-[17px] font-bold text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
    </div>
  );
}

const Divider = () => (
  <div className="border-t border-border-dark my-7" />
);

/* ─── STEP COMPONENTS ─── */

type StepProps = {
  d: Record<string, string>;
  s: (k: string, v: string) => void;
  m: boolean;
};

function Step1({ d, s, m }: StepProps) {
  return (
    <>
      <SectionTitle letter="A" title="O Negócio" />
      <Field label="Nome do negócio" placeholder="Barbearia do Zé" value={d.nome} onChange={(v) => s("nome", v)} required missing={m} />
      <Field label="Setor de atividade" placeholder="Barbearia" value={d.setor} onChange={(v) => s("setor", v)} required missing={m} hint="Ex: Barbearia, Clínica de Estética, Estúdio de Tatuagens, Explicações, Psicologia, Oficina" />
      <Field label="Morada completa" placeholder="Rua de Santa Catarina 123, 4000-001 Porto" value={d.morada} onChange={(v) => s("morada", v)} required missing={m} hint="Rua, número, código postal e cidade" />
      <Field label="Link do Google Maps" placeholder="https://maps.google.com/..." value={d.maps_link} onChange={(v) => s("maps_link", v)} required missing={m} hint="Pesquise o seu negócio no Google Maps → clique em «Partilhar» → copie o link" />
      <Field label="Horário de funcionamento normal" placeholder={"Seg-Sex: 9h-19h\nSáb: 9h-13h\nDom: fechado"} value={d.horarios} onChange={(v) => s("horarios", v)} required missing={m} multi rows={3} hint="Escreva dia a dia" />
      <Field label="Exceções ao horário ao longo do ano" placeholder="Fechamos aos feriados. Em agosto fechamos na 2ª quinzena." value={d.excecoes} onChange={(v) => s("excecoes", v)} multi rows={2} hint="Feriados, férias, horários especiais — se não houver, deixe em branco" />
      <Ex>{`"Fechamos aos feriados"\n"Em agosto fechamos para férias na 2ª quinzena"\n"Na véspera de Natal fechamos mais cedo às 16h"`}</Ex>
    </>
  );
}

function Step2({ d, s, m }: StepProps) {
  return (
    <>
      <SectionTitle letter="B" title="Equipa e Profissionais" />
      <Field label="Nomes dos profissionais (que recebem marcações)" placeholder="João, Maria, Rita" value={d.profissionais} onChange={(v) => s("profissionais", v)} required missing={m} hint="Separados por vírgula" />
      <Divider />
      <SectionTitle letter="C" title="Serviços e Preçário" />
      <Field label="Serviços individuais" value={d.servicos} onChange={(v) => s("servicos", v)} required missing={m} multi rows={8} placeholder={"Corte clássico — 12€ — 30min — Tesoura ou máquina, inclui lavagem\nBarba completa — 8€ — 20min — Navalha e toalha quente"} hint={"Um por linha, no formato:\nNome — Preço (fixo ou variável) — Duração — Descrição detalhada\n\nSe o preço não for fixo, escreva «Variável» ou «A partir de X€» e explique na descrição."} />
      <Ex>{`Corte clássico — 12€ — 30min — Tesoura ou máquina, inclui lavagem e styling\nColoração Global — Variável (sob avaliação) — 120min — Mudança de tom com produtos sem amoníaco. O valor depende do comprimento e densidade do cabelo. Recomendamos vir com o cabelo lavado do dia anterior.`}</Ex>
      <Field label="Packs, combos ou planos" value={d.packs} onChange={(v) => s("packs", v)} multi rows={4} placeholder={"Pack Completo — 18€ — Corte + Barba — 45min\nPack Noivo — 35€ — Corte + Barba + Tratamento — 90min"} hint="Combinações com desconto ou subscrições — se não tiver, deixe em branco" />
      <Ex>{`Pack Noiva — 120€ — Cabelo + Maquilhagem + Unhas — 180min\nPack Pai & Filho — 20€ — 2 cortes — 50min`}</Ex>
    </>
  );
}

function Step3({ d, s }: StepProps) {
  return (
    <>
      <SectionTitle letter="D" title="Política de Agendamento e Funcionamento" />
      <Field label="Aceitam clientes sem marcação prévia?" placeholder="Sim, por ordem de chegada" value={d.walkin} onChange={(v) => s("walkin", v)} hint={'Ex: "Apenas com marcação", "Sim, por ordem de chegada", "Walk-in sujeito a disponibilidade"'} />
      <Field label="Política de atrasos e cancelamentos" placeholder="Aguardamos até 15 min, após isso a marcação é cancelada" value={d.cancelamento} onChange={(v) => s("cancelamento", v)} hint={'Ex: "Pedimos cancelamento com 24h de antecedência"'} />
      <Field label="Tempo médio de espera (se aplicável)" placeholder="Com marcação o atendimento é imediato" value={d.espera} onChange={(v) => s("espera", v)} hint={'Se aceitam walk-ins — ex: "Sem marcação ao sábado pode ser 30-40min"'} />
      <Divider />
      <SectionTitle letter="E" title="Atendimento Fora do Espaço / Urgências" />
      <Field label="Presta serviços fora do seu espaço físico ou tem canal de urgências?" value={d.fora_espaco} onChange={(v) => s("fora_espaco", v)} multi rows={3} placeholder="Fazemos deslocações ao domicílio com taxa extra de 10€" hint="Domicílios, consultas online, piquete de urgência — se não se aplica, deixe em branco" />
      <Ex>{`"Damos consultas presenciais e também online via Zoom."\n"Temos um piquete de urgência 24/7 pelo número X, com taxas noturnas."\n"Fazemos deslocações a hotéis/quintas para casamentos com taxa de 0.40€/km."`}</Ex>
    </>
  );
}

function Step4({ d, s, m }: StepProps) {
  return (
    <>
      <SectionTitle letter="F" title="Pagamentos, Parcerias e Fidelização" />
      <Field label="Métodos de pagamento aceites" placeholder="Dinheiro, Multibanco, MB Way" value={d.pagamentos} onChange={(v) => s("pagamentos", v)} required missing={m} />
      <Field label="Programa de fidelização ou benefícios" placeholder="Ao 10º serviço, o 11º é grátis" value={d.fidelidade} onChange={(v) => s("fidelidade", v)} hint={'Ex: "Temos cartão de pontos físico", "Não temos" — se não tiver, deixe em branco'} />
      <Field label="Trabalha com algum seguro, subsistema de saúde ou parceria de descontos?" value={d.parcerias} onChange={(v) => s("parcerias", v)} multi rows={2} placeholder="Trabalhamos com a Multicare e AdvanceCare" hint="Se não se aplica, deixe em branco" />
      <Ex>{`"Trabalhamos com a Multicare e AdvanceCare."\n"Temos 10% de desconto para estudantes da UP."`}</Ex>
    </>
  );
}

function Step5({ d, s }: StepProps) {
  return (
    <>
      <SectionTitle letter="G" title="O Espaço e Logística" />
      <Field label="Estacionamento e acessos" placeholder="Parque gratuito nas traseiras" value={d.estacionamento} onChange={(v) => s("estacionamento", v)} hint={'Ex: "Estacionamento pago (zona azul) na rua", "Fácil estacionar na rua"'} />
      <Field label="Regras e comodidades do espaço" value={d.espaco_info} onChange={(v) => s("espaco_info", v)} multi rows={4} placeholder={"Temos Wi-Fi e café gratuito.\nEspaço acessível para cadeira de rodas.\nCrianças a partir dos 3 anos."} hint="Wi-Fi, bebidas, acessibilidade, restrições de idade, acompanhantes, animais — tudo o que o cliente deve saber sobre o espaço" />
      <Ex>{`"Temos Wi-Fi e café gratuito. Não é permitida a entrada de animais. Pedimos para não trazer acompanhantes por falta de espaço na sala de espera."`}</Ex>
      <Divider />
      <SectionTitle letter="H" title="Venda de Produtos" />
      <Field label="Vende produtos físicos no espaço?" value={d.produtos} onChange={(v) => s("produtos", v)} multi rows={3} placeholder={"Champô antiqueda — Marca X — 18€\nÓleo de barba — Captain Fawcett — 22€"} hint={'Formato: Tipo — Nome/Marca — Preço\nOu simplesmente: "Vendemos cremes e óleos — perguntar no espaço"\nSe não vende, deixe em branco'} />
    </>
  );
}

function Step6({ d, s, m }: StepProps) {
  return (
    <>
      <SectionTitle letter="I" title="Presença Online e Links" />
      <Field label="Link principal de marcações (Booking)" placeholder="https://fresha.com/o-meu-negocio" value={d.booking_link} onChange={(v) => s("booking_link", v)} required missing={m} hint={'Link do Fresha, Booksy, Calendly, site próprio, ou "Marcações geridas por WhatsApp"'} />
      <Field label="Redes sociais e website" value={d.redes} onChange={(v) => s("redes", v)} multi rows={3} placeholder={"Instagram: @username\nFacebook: facebook.com/pagina\nWebsite: www.site.pt"} hint="Instagram, Facebook, TikTok, website — tudo o que tiver" />
      <Divider />
      <SectionTitle letter="K" title="Contacto de Suporte / Transmissão Humana" />
      <Field label="Número de WhatsApp do responsável (com indicativo)" placeholder="+351 912 345 678" value={d.owner_whatsapp} onChange={(v) => s("owner_whatsapp", v)} required missing={m} hint="É para aqui que o assistente reencaminha a conversa quando não souber responder ou o cliente pedir para falar com um humano." />
    </>
  );
}

function Step7({ d, s }: StepProps) {
  return (
    <>
      <SectionTitle letter="J" title="Reclamações, Feedback ou Trocas" />
      <Field label="Se um cliente não ficar satisfeito, qual é a vossa política?" value={d.reclamacoes} onChange={(v) => s("reclamacoes", v)} multi rows={3} placeholder="Pedimos que envie um e-mail para geral@email.com para que a gerência possa resolver." hint="Garantias, procedimento de reclamação, trocas — se não tiver política formal, descreva como lidam na prática" />
      <Ex>{`"Damos uma garantia de 5 dias nas unhas de gel. Se alguma partir ou levantar nesse período, o arranjo é totalmente gratuito."\n"Pedimos que envie um e-mail para geral@email.com para que a gerência possa analisar e resolver."`}</Ex>
      <Divider />
      <SectionTitle letter="L" title="Mensagens Automatizadas e Notas Finais" />
      <Field label="Mensagem de chamada perdida (personalizar)" value={d.missed_call_msg} onChange={(v) => s("missed_call_msg", v)} multi rows={3} hint={'Quando o cliente liga e ninguém atende, o sistema envia este WhatsApp automático. Se quiser alterar o modelo padrão, escreva a sua versão. Se não, deixe em branco.\n\nPadrão: "Olá! Não conseguimos atender a sua chamada de momento por estarmos em atendimento. Como o posso ajudar por aqui? Se preferir, pode fazer a sua marcação diretamente neste link: [LINK]"'} />
      <Field label="Informações adicionais frequentes" value={d.extras} onChange={(v) => s("extras", v)} multi rows={5} placeholder={"Falamos Inglês e Francês.\nA profissional Maria não faz o serviço X às terças."} hint="Tudo o que os seus clientes costumam perguntar e que não foi coberto acima — quanto mais info, melhor o assistente responde" />
      <Ex>{`"Falamos Inglês e Francês."\n"A profissional Maria não faz o serviço X às terças-feiras."\n"Não fazemos dreadlocks nem extensões."\n"Raspar a zero é grátis para quem está em quimioterapia."`}</Ex>
    </>
  );
}

/* ─── MAIN ─── */

const INITIAL: Record<string, string> = {
  nome: "", setor: "", morada: "", maps_link: "", horarios: "", excecoes: "",
  profissionais: "", servicos: "", packs: "",
  walkin: "", cancelamento: "", espera: "", fora_espaco: "",
  pagamentos: "", fidelidade: "", parcerias: "",
  estacionamento: "", espaco_info: "", produtos: "",
  booking_link: "", redes: "", owner_whatsapp: "",
  reclamacoes: "", missed_call_msg: "", extras: "",
};

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7];

export default function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [apiError, setApiError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  const s = (k: string, v: string) =>
    setData((prev) => ({ ...prev, [k]: v }));
  const goTo = (i: number) => {
    setStep(i);
    setShowMissing(false);
  };

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const StepComp = STEP_COMPONENTS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;
  const allMissing = ALL_REQ.filter((k) => !data[k].trim());

  const handleSubmit = async () => {
    if (allMissing.length > 0) {
      setShowMissing(true);
      return;
    }
    setSending(true);
    setApiError("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) {
        setSubmitted(true);
      } else {
        setApiError(json.error || "Erro desconhecido.");
      }
    } catch {
      setApiError("Erro de ligação. Verifique a internet e tente novamente.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-[72px] h-[72px] rounded-full bg-success flex items-center justify-center mx-auto mb-6 text-3xl text-white font-bold">
            ✓
          </div>
          <h2
            className="text-2xl font-bold text-foreground mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Formulário enviado com sucesso!
          </h2>
          <p className="text-base text-muted leading-relaxed">
            Recebemos todas as informações do seu negócio. Vamos configurar o
            seu assistente virtual e entraremos em contacto em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div ref={topRef} className="max-w-[620px] mx-auto px-5 pt-8 pb-12">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="text-xs font-semibold tracking-[2.5px] text-accent uppercase mb-2">
            Formulário de Onboarding
          </div>
          <h1
            className="text-[26px] font-bold text-foreground mb-1.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Configure o seu negócio
          </h1>
          <p className="text-sm text-muted">
            Preencha as informações para ativarmos o seu assistente virtual
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[13px] font-semibold text-accent">
              {STEPS[step].icon} {STEPS[step].label}
            </span>
            <span className="text-xs text-gray-400">
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <div className="h-1 bg-border-dark rounded overflow-hidden">
            <div
              className="h-full rounded bg-gradient-to-r from-accent-hover to-accent"
              style={{
                width: `${progress}%`,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Step pills */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {STEPS.map((st, i) => (
            <button
              key={st.id}
              onClick={() => goTo(i)}
              className="transition-all cursor-pointer"
              style={{
                padding: "5px 11px",
                fontSize: 11,
                fontWeight: i === step ? 600 : 400,
                color:
                  i === step ? "#fff" : i < step ? "#8b7355" : "#666",
                background:
                  i === step
                    ? "#8b7355"
                    : i < step
                    ? "#ede8de"
                    : "transparent",
                border:
                  i === step
                    ? "none"
                    : `1px solid ${i < step ? "#d4cfc3" : "#e0ddd5"}`,
                borderRadius: 18,
              }}
            >
              {st.icon} {st.label}
            </button>
          ))}
        </div>

        {/* Missing fields banner */}
        {showMissing && allMissing.length > 0 && (
          <div className="bg-error-banner border border-error-border rounded-[10px] px-4 py-3.5 mb-5">
            <p className="text-sm font-semibold text-error-text mb-1">
              Faltam campos obrigatórios:
            </p>
            <p className="text-[13px] text-error-label leading-relaxed">
              {allMissing.map((k) => REQ_LABELS[k]).join(" · ")}
            </p>
          </div>
        )}

        {/* API error */}
        {apiError && (
          <div className="bg-error-banner border border-error-border rounded-[10px] px-4 py-3.5 mb-5">
            <p className="text-sm font-semibold text-error-text">{apiError}</p>
          </div>
        )}

        {/* Form card */}
        <div className="bg-card rounded-2xl border border-border-dark p-6 mb-6">
          <StepComp d={data} s={s} m={showMissing} />
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <button
            onClick={() => goTo(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-6 py-3 text-[15px] font-medium rounded-[10px] border-[1.5px] transition-colors cursor-pointer disabled:cursor-not-allowed"
            style={{
              color: step === 0 ? "#ccc" : "#8b7355",
              borderColor: step === 0 ? "#e8e4dc" : "#8b7355",
              background: "transparent",
            }}
          >
            ← Anterior
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={sending}
              className="px-8 py-3 text-[15px] font-semibold text-white rounded-[10px] border-none transition-colors cursor-pointer disabled:cursor-wait"
              style={{
                background: sending ? "#a89880" : "#8b7355",
              }}
            >
              {sending ? "A enviar..." : "Enviar formulário ✓"}
            </button>
          ) : (
            <button
              onClick={() => goTo(step + 1)}
              className="px-8 py-3 text-[15px] font-semibold text-white bg-accent rounded-[10px] border-none cursor-pointer hover:bg-accent-hover transition-colors"
            >
              Seguinte →
            </button>
          )}
        </div>

        <p className="text-[11px] text-gray-300 text-center mt-5">
          <span className="text-error-text">*</span> Campos obrigatórios — se
          algo não se aplicar, salte ou escreva «não»
        </p>
      </div>
    </div>
  );
}
