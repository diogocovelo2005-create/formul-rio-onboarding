import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";

const DEFAULT_PERSONALITY =
  "Your tone is warm, conversational, and personable — like a helpful colleague at the front desk, not a corporate chatbot. Keep responses concise but never robotic; a touch of warmth or personality is welcome.";

async function compilePersonality(instrucoes: string): Promise<string> {
  if (!ANTHROPIC_KEY) return DEFAULT_PERSONALITY;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `You are a prompt engineer. A local business owner has described how they want their AI WhatsApp assistant to behave. Convert their plain-language instructions into a single, well-structured paragraph for an AI system prompt.

Start from this default personality:
"${DEFAULT_PERSONALITY}"

The owner's instructions (in Portuguese or English):
"${instrucoes}"

Rules:
- Preserve the core identity (helpful assistant for a local appointment-based business)
- Integrate the owner's instructions naturally — weave them into flowing prose, do not list them
- Write in English (it will be mixed with other English system prompt content)
- Keep it concise: 2-4 sentences maximum
- Return ONLY the personality paragraph, no preamble, no explanation`,
          },
        ],
      }),
    });

    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim();
    return text || DEFAULT_PERSONALITY;
  } catch (err) {
    console.error("Personality compilation error:", err);
    return DEFAULT_PERSONALITY;
  }
}

function parseServicosJson(raw: string): object[] {
  try {
    const items = JSON.parse(raw || "[]");
    return items
      .filter((i: { nome?: string }) => i.nome?.trim())
      .map((i: { nome: string; preco?: string; duracao?: string; descricao?: string }) => ({
        nome: i.nome.trim(),
        preco: i.preco?.trim() || null,
        duracao: i.duracao?.trim() || null,
        descricao: i.descricao?.trim() || null,
      }));
  } catch {
    return [];
  }
}

function parseStaff(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
}

function buildSystemPromptExtras(data: Record<string, string>): string {
  const sections: string[] = [];

  if (data.setor) sections.push(`Setor de atividade: ${data.setor}.`);
  if (data.excecoes) sections.push(`Exceções ao horário: ${data.excecoes}`);
  if (data.walkin) sections.push(`Walk-in: ${data.walkin}`);
  if (data.cancelamento)
    sections.push(`Política de atrasos/cancelamentos: ${data.cancelamento}`);
  if (data.espera) sections.push(`Tempo de espera sem marcação: ${data.espera}`);
  if (data.fora_espaco)
    sections.push(`Atendimento fora do espaço/urgências: ${data.fora_espaco}`);
  if (data.pagamentos)
    sections.push(`Métodos de pagamento: ${data.pagamentos}`);
  if (data.fidelidade)
    sections.push(`Programa de fidelização: ${data.fidelidade}`);
  if (data.parcerias)
    sections.push(`Seguros/parcerias/descontos: ${data.parcerias}`);
  if (data.estacionamento)
    sections.push(`Estacionamento: ${data.estacionamento}`);
  if (data.espaco_info)
    sections.push(`Espaço e comodidades: ${data.espaco_info}`);
  if (data.produtos) sections.push(`Produtos à venda: ${data.produtos}`);
  if (data.redes) sections.push(`Redes sociais: ${data.redes}`);
  if (data.reclamacoes)
    sections.push(`Política de reclamações/garantias: ${data.reclamacoes}`);
  if (data.extras)
    sections.push(`Informações adicionais: ${data.extras}`);

  return sections.join("\n");
}

async function generatePromoMessage(promo: {
  tipo: string;
  titulo: string;
  detalhes: string;
  data_inicio?: string;
  data_fim?: string;
  localizacao?: string;
  condicoes?: string;
}): Promise<string | null> {
  if (!ANTHROPIC_KEY) return null;

  const parts = [
    `Type: ${promo.tipo === "event" ? "Event" : promo.tipo === "campaign" ? "Campaign" : "Promotion"}`,
    `Name: ${promo.titulo}`,
    `Details: ${promo.detalhes}`,
    promo.data_inicio ? `Start date: ${promo.data_inicio}` : null,
    promo.data_fim ? `End date: ${promo.data_fim}` : null,
    promo.localizacao ? `Location: ${promo.localizacao}` : null,
    promo.condicoes ? `Conditions: ${promo.condicoes}` : null,
  ].filter(Boolean).join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `Write a concise, friendly WhatsApp message (2-3 sentences max) for a local business to send to clients about this promotion/event.

${parts}

Rules:
- Use {{nome}} as placeholder for the client's first name
- Use {{booking_link}} as placeholder for booking link if relevant
- Write in Portuguese (European)
- Keep it natural and warm, not corporate
- Return ONLY the message text, nothing else`,
          },
        ],
      }),
    });

    const data = await res.json();
    return data?.content?.[0]?.text?.trim() || null;
  } catch (err) {
    console.error("Promo message generation error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const servicos = [
      ...parseServicosJson(body.servicos_json || "[]"),
      ...parseServicosJson(body.packs_json || "[]").map((p) => ({ ...p, tipo: "pack" })),
    ];

    const staff = parseStaff(body.profissionais || "");
    const systemExtras = buildSystemPromptExtras(body);

    // Compile personality if provided
    let agentPersonalidade: string = DEFAULT_PERSONALITY;
    const instrucoes = (body.agent_personalidade_instrucoes || "").trim();
    if (instrucoes) {
      agentPersonalidade = await compilePersonality(instrucoes);
    }

    const row: Record<string, unknown> = {
      nome: body.nome,
      morada: body.morada || null,
      maps_link: body.maps_link || null,
      horarios: body.horarios || null,
      servicos: servicos.length > 0 ? servicos : null,
      booking_link: body.booking_link || null,
      owner_whatsapp: body.owner_whatsapp || null,
      system_prompt_extras: systemExtras || null,
      staff: staff,
      agent_personalidade_instrucoes: instrucoes || null,
      agent_personalidade: agentPersonalidade,
    };

    if (body.missed_call_msg?.trim()) {
      row.missed_call_message = body.missed_call_msg.trim();
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Supabase error:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao guardar os dados. Tente novamente." },
        { status: 500 }
      );
    }

    const created = await res.json();
    const businessId = created[0]?.id;

    // Process promotions if any
    let promosRaw: Array<{
      tipo: string;
      titulo: string;
      detalhes: string;
      data_inicio: string;
      data_fim: string;
      localizacao: string;
      condicoes: string;
    }> = [];
    try {
      promosRaw = JSON.parse(body.promotions_json || "[]");
    } catch {
      promosRaw = [];
    }

    if (businessId && promosRaw.length > 0) {
      const validPromos = promosRaw.filter((p) => p.titulo?.trim());

      // Generate WhatsApp messages in parallel
      const messages = await Promise.all(
        validPromos.map((p) => generatePromoMessage(p))
      );

      const today = new Date().toISOString().split("T")[0];
      const promoRows = validPromos.map((p, i) => ({
        business_id: businessId,
        titulo: p.titulo.trim(),
        mensagem: messages[i] || null,
        tipo: p.tipo || "promotion",
        detalhes: p.detalhes?.trim() || null,
        localizacao: p.localizacao?.trim() || null,
        condicoes: p.condicoes?.trim() || null,
        data_inicio: p.data_inicio || null,
        data_fim: p.data_fim || null,
        segmento: "all",
        ativo: !p.data_inicio || p.data_inicio <= today,
      }));

      const promoRes = await fetch(`${SUPABASE_URL}/rest/v1/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify(promoRows),
      });

      if (!promoRes.ok) {
        console.error("Promotions insert error:", await promoRes.text());
      }
    }

    return NextResponse.json({ ok: true, id: businessId });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { ok: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}
