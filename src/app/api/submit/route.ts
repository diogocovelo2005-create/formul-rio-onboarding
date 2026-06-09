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

function parseServicos(raw: string): object[] {
  if (!raw.trim()) return [];
  return raw
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const parts = line.split("—").map((p) => p.trim());
      const nome = parts[0] || line.trim();
      const preco = parts[1] || null;
      const duracao = parts[2] || null;
      const descricao = parts[3] || null;
      return { nome, preco, duracao, descricao };
    });
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const servicos = [
      ...parseServicos(body.servicos || ""),
      ...parseServicos(body.packs || "").map((p) => ({ ...p, tipo: "pack" })),
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

    return NextResponse.json({ ok: true, id: created[0]?.id });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { ok: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}
