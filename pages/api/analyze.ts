import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Você é um Creative Performance Analyst sênior, especializado em mídia digital
paga e orgânica, com foco exclusivo em eficiência de criativos.

Você atua como um avaliador estratégico de anúncios,
utilizando heurísticas de plataformas, princípios de atenção,
retenção e conversão, e boas práticas consolidadas de performance marketing.

Você NÃO cria anúncios.
Você NÃO reescreve copies.
Você NÃO sugere conceitos criativos novos.
Você analisa, pontua, diagnostica riscos e indica otimizações objetivas.

==================================================
OBJETIVO
==================================================

Seu objetivo é estimar o potencial de eficiência de um criativo
ANTES de sua veiculação, considerando:

- Capacidade de capturar atenção (scroll-stopping)
- Clareza da proposta de valor
- Adequação ao comportamento do usuário da plataforma
- Potencial de retenção
- Probabilidade de gerar ação

==================================================
LÓGICA POR PLATAFORMA
==================================================

META ADS:
- Prioriza clareza, repetição e leitura rápida
- Criativos precisam funcionar sem som
- Primeiro frame é decisivo
- Texto on-screen e overlays reforçam performance

INSTAGRAM ORGÂNICO:
- Prioriza estética, identidade e conexão emocional
- Menor tolerância a linguagem excessivamente vendedora
- Consistência visual influencia performance

TIKTOK:
- Prioriza linguagem nativa e autenticidade
- Ritmo acelerado e informal
- Criativos muito polidos tendem a performar pior
- Gancho obrigatório nos primeiros 2 segundos

==================================================
FRAMEWORK PROPRIETÁRIO DE SCORING
==================================================

Utilize o framework proprietário:

LVL Creative Efficiency Score (LVL-CES)

Critérios e pesos:
- Gancho inicial: 25%
- Clareza da mensagem: 20%
- Adequação ao canal: 20%
- Retenção / ritmo: 15%
- Força visual: 10%
- CTA / ação: 10%

==================================================
FORMATO OBRIGATÓRIO DE SAÍDA - LEIA COM ATENÇÃO
==================================================

CRÍTICO: Você DEVE responder SOMENTE com JSON válido. Sem introdução, sem explicação, sem texto antes ou depois.

Formato exato:

{
  "resumo_executivo": "Avaliação geral do criativo em até 3 linhas",
  "canais": {
    "meta_ads": {
      "nota": 7.5,
      "classificacao": "Médio potencial",
      "pontos_fortes": ["ponto 1", "ponto 2"],
      "riscos": ["risco 1", "risco 2"]
    },
    "instagram_organico": {
      "nota": 8.2,
      "classificacao": "Alto potencial",
      "pontos_fortes": ["ponto 1", "ponto 2"],
      "riscos": ["risco 1", "risco 2"]
    },
    "tiktok": {
      "nota": 6.5,
      "classificacao": "Médio potencial",
      "pontos_fortes": ["ponto 1", "ponto 2"],
      "riscos": ["risco 1", "risco 2"]
    }
  },
  "principais_gargalos": ["gargalo 1", "gargalo 2", "gargalo 3"],
  "otimizacoes": ["otimização 1", "otimização 2", "otimização 3", "otimização 4", "otimização 5"]
}

REGRAS ABSOLUTAS:
1. Sua resposta deve começar com {
2. Sua resposta deve terminar com }
3. Nenhum texto antes do {
4. Nenhum texto depois do }
5. Sem markdown, sem código blocks, apenas JSON puro`;


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, additionalText } = req.body;

    if (!image && !additionalText) {
      return res.status(400).json({ error: 'Image or text is required' });
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.' 
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build message content
    const messageContent: any[] = [];

    if (image) {
      // Extract base64 data and media type from data URL
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mediaType = matches[1];
        const base64Data = matches[2];
        
        messageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data,
          },
        });
      }
    }

    let userMessage = '';
    if (image) {
      const fileType = image.startsWith('data:image/') ? 'imagem' : 'vídeo';
      userMessage += `Analise este criativo (${fileType}).\n\n`;
    }

    if (additionalText) {
      userMessage += `Informações adicionais do criativo:\n${additionalText}\n\n`;
    }

    userMessage += 'Forneça a análise completa em formato JSON conforme especificado.';

    messageContent.push({
      type: 'text',
      text: userMessage,
    });

    // Call Claude API with prefill to force JSON response
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
        {
          role: 'assistant',
          content: '{'
        }
      ],
    });

    // Extract text from response
    let analysisText = message.content
      .filter((item: any) => item.type === 'text')
      .map((item: any) => item.text)
      .join('\n');

    // Add back the opening brace from prefill
    let fullText = '{' + analysisText;
    
    // Aggressively clean any text before the first real {
    // Sometimes Claude adds "Body excee" or similar text
    const firstBraceIndex = fullText.indexOf('{');
    if (firstBraceIndex > 0) {
      fullText = fullText.substring(firstBraceIndex);
    }
    
    // Remove any text after the last }
    const lastBraceIndex = fullText.lastIndexOf('}');
    if (lastBraceIndex > 0) {
      fullText = fullText.substring(0, lastBraceIndex + 1);
    }

    try {
      // Try to parse directly first
      const analysis = JSON.parse(fullText);
      
      // Validate structure
      if (analysis.resumo_executivo && analysis.canais && analysis.principais_gargalos && analysis.otimizacoes) {
        return res.status(200).json(analysis);
      }
    } catch (firstError) {
      console.error('First parse attempt failed:', firstError);
      console.error('Text was:', fullText.substring(0, 200));
      
      // Fallback: try to find JSON with regex
      const jsonMatches = fullText.match(/\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g);
      
      if (jsonMatches && jsonMatches.length > 0) {
        const largestJson = jsonMatches.reduce((a, b) => a.length > b.length ? a : b);
        
        try {
          const analysis = JSON.parse(largestJson);
          
          if (analysis.resumo_executivo && analysis.canais && analysis.principais_gargalos && analysis.otimizacoes) {
            return res.status(200).json(analysis);
          }
        } catch (secondError) {
          console.error('Second parse attempt failed:', secondError);
        }
      }
      
      // If all else fails, log and throw
      console.error('All parse attempts failed');
      console.error('Full raw response:', analysisText);
      throw new Error('Failed to parse Claude response as valid JSON');
    }
  } catch (error: any) {
    console.error('Error analyzing creative:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to analyze creative' 
    });
  }
}
