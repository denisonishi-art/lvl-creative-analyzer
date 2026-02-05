# 🚀 LVL Creative Analyzer

Análise preditiva de performance de criativos para Meta Ads, Instagram e TikTok usando IA.

![LVL Creative Analyzer](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Claude API](https://img.shields.io/badge/Claude-Sonnet%204-orange?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)

## ✨ Features

- 🎨 Interface moderna e profissional com glassmorphism
- 🤖 Análise inteligente via Claude Sonnet 4
- 📊 Scores individuais por canal (Meta Ads, Instagram, TikTok)
- 🎯 Framework proprietário LVL-CES
- ⚡ Deploy rápido na Vercel
- 🔒 API Key protegida no backend

## 📋 Pré-requisitos

1. **Conta na Anthropic** (para API Key)
   - Acesse: https://console.anthropic.com
   - Crie uma conta (grátis com $5 de crédito)
   - Vá em "API Keys" e crie uma nova chave

2. **Conta no GitHub** (grátis)
   - Acesse: https://github.com

3. **Conta na Vercel** (grátis)
   - Acesse: https://vercel.com

## 🚀 Deploy na Vercel (5 minutos)

### Passo 1: Preparar o código

1. **Baixe todos os arquivos** deste projeto
2. Coloque em uma pasta chamada `lvl-creative-analyzer`

### Passo 2: Subir para o GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `lvl-creative-analyzer`
3. Deixe como **Público**
4. Clique em **"Create repository"**

5. No seu computador, abra o terminal/cmd na pasta do projeto e execute:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/lvl-creative-analyzer.git
git push -u origin main
```

(Substitua `SEU-USUARIO` pelo seu usuário do GitHub)

### Passo 3: Deploy na Vercel

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione o repositório `lvl-creative-analyzer`
4. Clique em **"Import"**

5. **Configure a variável de ambiente:**
   - Em "Environment Variables"
   - Nome: `ANTHROPIC_API_KEY`
   - Valor: Cole sua API Key (começa com `sk-ant-...`)
   - Clique em **"Add"**

6. Clique em **"Deploy"**

7. **Aguarde 2-3 minutos** ⏳

8. **Pronto!** 🎉 Seu app está no ar!

## 🧪 Testar Localmente (Opcional)

Se quiser testar no seu computador antes de fazer deploy:

```bash
# Instalar dependências
npm install

# Criar arquivo .env.local
echo "ANTHROPIC_API_KEY=sua-chave-aqui" > .env.local

# Rodar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 📖 Como Usar

1. **Faça upload** de uma imagem do criativo
2. **Ou insira** informações textuais (copy, headline, CTA)
3. Clique em **"Analisar Criativo"**
4. Aguarde a análise (5-10 segundos)
5. Veja o **relatório completo** com:
   - Scores por canal (Meta, Instagram, TikTok)
   - Pontos fortes e riscos
   - Gargalos principais
   - Sugestões de otimização

## 💰 Custos

- **Vercel:** Grátis (até 100GB de bandwidth/mês)
- **Claude API:** 
  - $5 grátis para começar
  - ~$0.01-0.03 por análise
  - ~200-500 análises com $5

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Claude Sonnet 4** - IA para análise
- **Lucide Icons** - Ícones
- **Vercel** - Hospedagem

## 📁 Estrutura do Projeto

```
lvl-creative-analyzer/
├── pages/
│   ├── api/
│   │   └── analyze.ts       # API route (backend)
│   ├── _app.tsx             # App wrapper
│   └── index.tsx            # Página principal
├── styles/
│   └── globals.css          # Estilos globais
├── public/                  # Assets estáticos
├── package.json             # Dependências
├── tsconfig.json            # Config TypeScript
├── tailwind.config.js       # Config Tailwind
└── next.config.js           # Config Next.js
```

## 🔒 Segurança

- ✅ API Key nunca é exposta no frontend
- ✅ Todas as chamadas passam pelo backend
- ✅ Validação de inputs
- ✅ Rate limiting automático pela Vercel

## 🐛 Problemas Comuns

### "API key not configured"
- Verifique se adicionou `ANTHROPIC_API_KEY` nas variáveis de ambiente da Vercel
- Refaça o deploy após adicionar

### "Failed to analyze creative"
- Verifique se sua API key é válida
- Confirme que tem créditos disponíveis
- Tente com uma imagem menor (<5MB)

### Build Error no Vercel
- Verifique se todos os arquivos foram commitados
- Confirme que o `package.json` está correto

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs da Vercel
2. Teste localmente primeiro
3. Confirme que sua API key está ativa

## 📜 Licença

Este projeto é proprietário e confidencial.

---

**Desenvolvido com ❤️ usando Claude AI**
