# 🚀 Guia de Deploy - Manga Store

## 📋 Pré-requisitos

Antes de fazer o deploy, certifique-se de que:

- ✅ O projeto compila sem erros (`npm run build`)
- ✅ O linting passa sem warnings/errors (`npm run lint`)
- ✅ Todos os arquivos necessários estão commitados
- ✅ O `.env` não contém chaves reais (só placeholders)

## 📦 Passo 1: Preparar o Repositório

### 1.1 Verificar Status do Git
```bash
git status
```

### 1.2 Commitar todas as mudanças
```bash
git add .
git commit -m "feat: finalizar loja de mangá para produção"
```

### 1.3 Criar repositório no GitHub
1. Acesse [github.com](https://github.com) e crie um novo repositório
2. Nomeie como `manga-store` ou similar
3. **Não** inicialize com README (já temos um)

### 1.4 Fazer push para GitHub
```bash
# Adicionar remote (substitua <seu-usuario> e <nome-repo>)
git remote add origin https://github.com/<seu-usuario>/<nome-repo>.git

# Push para main
git branch -M main
git push -u origin main
```

## 🌐 Passo 2: Deploy no Netlify

### 2.1 Conectar conta
1. Acesse [netlify.com](https://app.netlify.com)
2. Faça login ou crie uma conta gratuita

### 2.2 Importar projeto
1. Clique em **"Add new site"** → **"Import an existing project"**
2. Conecte sua conta do GitHub
3. Selecione o repositório `manga-store`

### 2.3 Configurar build
O Netlify deve detectar automaticamente as configurações corretas:

- **Base directory**: (vazio)
- **Build command**: `npm run build`
- **Publish directory**: `.next` (ou será detectado automaticamente)

### 2.4 Deploy
1. Clique em **"Deploy site"**
2. Aguarde o build completar (cerca de 2-3 minutos)
3. Seu site estará disponível em uma URL como: `https://amazing-site-name.netlify.app`

## ⚙️ Passo 3: Configurações Avançadas (Opcional)

### 3.1 Domínio Personalizado
1. No painel do Netlify, vá para **"Site settings"** → **"Domain management"**
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruído

### 3.2 Variáveis de Ambiente
Se precisar adicionar variáveis de ambiente no futuro:
1. **Site settings** → **Environment variables**
2. Adicione as variáveis necessárias (Stripe, banco de dados, etc.)

## 🔍 Passo 4: Verificar Deploy

### 4.1 Testar funcionalidades
- ✅ Página inicial carrega
- ✅ Navegação entre páginas funciona
- ✅ Design responsivo em mobile/desktop
- ✅ Links internos funcionam corretamente

### 4.2 Verificar performance
- Use [Google PageSpeed Insights](https://pagespeed.web.dev)
- Use [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## 🐛 Troubleshooting

### Build falha no Netlify
- Verifique se `npm run build` funciona localmente
- Confirme que todas as dependências estão em `package.json`
- Verifique logs de build no Netlify

### Páginas não carregam
- Certifique-se de que as rotas estão corretas
- Verifique se os arquivos estão na estrutura `src/app/`
- Confirme que os links usam `<Link>` do Next.js

### Estilos não aplicam
- Verifique se Tailwind CSS está configurado
- Confirme que `globals.css` está importado no `layout.tsx`

## 📊 Monitoramento

### Netlify Analytics
- Acesse **"Site settings"** → **"Analytics"**
- Ative o analytics gratuito para monitorar tráfego

### Google Analytics (Opcional)
1. Crie uma propriedade no [Google Analytics](https://analytics.google.com)
2. Adicione o código de rastreamento no `layout.tsx`

## 🎉 Conclusão

Parabéns! Sua Manga Store está agora online e acessível para todos. 🎊

**URLs importantes:**
- 🌐 Site: `https://seu-site.netlify.app`
- 📊 Analytics: Painel do Netlify
- 🐙 Repositório: `https://github.com/seu-usuario/manga-store`

**Próximos passos sugeridos:**
- Adicionar mais mangás ao catálogo
- Implementar sistema de carrinho de compras
- Adicionar autenticação de usuários
- Integrar com gateways de pagamento

---

**Precisa de ajuda?** Consulte a [documentação do Next.js](https://nextjs.org/docs) ou [Netlify Docs](https://docs.netlify.com).