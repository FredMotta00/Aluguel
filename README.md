# EXS Locação

Plataforma de aluguel de equipamentos de teste e proteção de alta performance.

## Sobre

EXS Locação é uma plataforma moderna para locação de equipamentos profissionais de teste de relés de proteção, desenvolvida com React, TypeScript e Firebase.

## Tecnologias

- **Frontend**: React 18 + Vite + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions, Storage)
- **Hospedagem**: Vercel / Firebase Hosting

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente do Firebase
3. Deploy automático a cada push

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── contexts/       # Contextos React (Auth, Cart)
├── lib/            # Utilitários e configurações
└── integrations/   # Integrações (Firebase)
```

## Licença

© 2026 EXS Locação. Todos os direitos reservados.
