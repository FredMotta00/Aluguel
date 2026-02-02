# 🔒 Análise de Segurança e Proteção de Dados - EXS Locações

## 📊 Status Atual da Segurança

| Camada | Status | Nível |
|--------|--------|-------|
| Autenticação | ✅ Implementada | **FORTE** |
| Autorização | ✅ Implementada | **FORTE** |
| Firestore Rules | ✅ Implementada | **FORTE** |
| API Keys | ✅ Protegidas | **FORTE** |
| Senhas | ✅ Criptografadas | **FORTE** |
| Dados Sensíveis | ⚠️ Parcial | **MÉDIO** |
| Auditoria | ❌ Não implementada | **FRACO** |
| Criptografia E2E | ❌ Não implementada | **AUSENTE** |
| Backup Seguro | ⚠️ Parcial | **MÉDIO** |

---

## 🏗️ Arquitetura Atual do Backend

```
┌─────────────────────────────────────────────────┐
│              FIREBASE CLOUD                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────┐    ┌─────────────────┐   │
│  │ Firebase Auth    │    │ Cloud Functions │   │
│  │ • Passwords: ✅  │    │ • HTTPS only    │   │
│  │ • Bcrypt hash    │───▶│ • Secrets: ✅   │   │
│  │ • Sessions       │    │ • Validation    │   │
│  └──────────────────┘    └─────────┬───────┘   │
│                                    │            │
│  ┌───────────────────────────────┐ │            │
│  │     Firestore Database        │◄┘            │
│  │  ┌─────────────────────────┐  │             │
│  │  │ customers (❗)          │  │             │
│  │  │ • email                  │  │             │
│  │  │ • name                   │  │             │
│  │  │ • phone                  │  │             │
│  │  │ • cpfCnpj (⚠️ TEXTO)    │  │  ⚠️ RISCO  │
│  │  └─────────────────────────┘  │             │
│  │                                │             │
│  │  ┌─────────────────────────┐  │             │
│  │  │ orders                   │  │             │
│  │  │ • userId                 │  │             │
│  │  │ • payment data           │  │             │
│  │  │ • asaasId                │  │             │
│  │  └─────────────────────────┘  │             │
│  │                                │             │
│  │  ┌─────────────────────────┐  │             │
│  │  │ wallet_transactions      │  │             │
│  │  │ • user_id                │  │             │
│  │  │ • amount                 │  │             │
│  │  └─────────────────────────┘  │             │
│  └───────────────────────────────┘             │
│                                                  │
│  ┌──────────────────────────────┐               │
│  │ Security Rules               │               │
│  │ • Authentication: ✅         │               │
│  │ • Authorization: ✅          │               │
│  │ • Ownership: ✅              │               │
│  └──────────────────────────────┘               │
└─────────────────────────────────────────────────┘
                │
                ▼
        ┌──────────────┐
        │ External APIs│
        │ • Asaas      │
        │ • CNPJA      │
        └──────────────┘
```

---

## ⚠️ DADOS SENSÍVEIS IDENTIFICADOS

### 🔴 CRÍTICO - Dados Pessoais (LGPD)

| Campo | Localização | Proteção Atual | Risco |
|-------|-------------|----------------|-------|
| **CPF/CNPJ** | `customers.cpfCnpj` | Texto plano ❌ | **ALTO** |
| **Nome completo** | `customers.name` | Texto plano ⚠️ | **MÉDIO** |
| **Email** | `customers.email` | Texto plano ⚠️ | **MÉDIO** |
| **Telefone** | `customers.phone` | Texto plano ⚠️ | **MÉDIO** |
| **Senha** | Firebase Auth | Hash bcrypt ✅ | **BAIXO** |
| **ID da transação** | `orders.asaasId` | Texto plano ⚠️ | **MÉDIO** |
| **Valor de transação** | `wallet_transactions.amount` | Texto plano ⚠️ | **BAIXO** |

### 🛡️ O Que Está Protegido

✅ **Senhas:**
- Gerenciadas pelo Firebase Authentication
- Nunca armazenadas em texto plano
- Hash bcrypt automático
- Nunca expostas via API

✅ **API Keys:**
- `ASAAS_API_KEY` armazenada como Firebase Secret
- Nunca exposta no código fonte
- Acessível apenas nas Cloud Functions

✅ **Tokens de Autenticação:**
- JWT gerenciados pelo Firebase
- Expiração automática
- Refresh tokens seguros

---

## 🚨 VULNERABILIDADES IDENTIFICADAS

### 1. CPF/CNPJ em Texto Plano 🔴 CRÍTICO

**Localização:**
- `customers` collection: campo `cpfCnpj`
- Enviado para Asaas sem criptografia

**Risco:**
- Vazamento de dados pessoais (LGPD Art. 46)
- Multa até R$ 50 milhões
- Roubo de identidade

**Recomendação:**
```typescript
// IMPLEMENTAR: Criptografia de CPF/CNPJ
import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes

function encryptCPF(cpf: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', 
        Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(cpf, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
}

function decryptCPF(encryptedCPF: string): string {
    const parts = encryptedCPF.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}
```

### 2. Logs Podem Expor Dados Sensíveis ⚠️ MÉDIO

**Localização:**
- Cloud Functions logs
- Console.log no frontend

**Risco:**
- CPF/CNPJ podem aparecer em logs de erro
- Dados pessoais visíveis para desenvolvedores

**Recomendação:**
```typescript
// IMPLEMENTAR: Log sanitization
function sanitizeForLog(data: any) {
    const sanitized = { ...data };
    
    // Mascarar CPF: 123.456.789-01 → 123.***.***-01
    if (sanitized.cpfCnpj) {
        sanitized.cpfCnpj = sanitized.cpfCnpj.replace(
            /(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/,
            '$1.***.***-$4'
        );
    }
    
    // Mascarar email: user@example.com → u***@example.com
    if (sanitized.email) {
        sanitized.email = sanitized.email.replace(
            /^(.)(.*)(@.*)$/,
            '$1***$3'
        );
    }
    
    return sanitized;
}

// Usar em logs
logger.info('User created:', sanitizeForLog(customerData));
```

### 3. Ausência de Auditoria ⚠️ MÉDIO

**Problema:**
- Não há registro de quem acessou dados sensíveis
- Impossível rastrear vazamentos
- Não conformidade com LGPD Art. 37

**Recomendação:**
```typescript
// IMPLEMENTAR: Audit log
async function logDataAccess(
    userId: string,
    action: string,
    resource: string,
    dataOwnerId: string
) {
    await getDb().collection('audit_logs').add({
        userId,
        action, // 'READ', 'CREATE', 'UPDATE', 'DELETE'
        resource, // 'customers', 'orders', etc.
        dataOwnerId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ip: context.rawRequest.ip,
        userAgent: context.rawRequest.headers['user-agent']
    });
}
```

### 4. Integração com API Externa (Asaas) ⚠️ MÉDIO

**Risco:**
- CPF/CNPJ enviado para terceiros
- Dados em trânsito podem ser interceptados

**Status Atual:**
✅ Usa HTTPS (SSL/TLS)
❌ CPF não criptografado before sending

### 5. Backup Não Criptografado ⚠️ BAIXO

**Problema:**
- Firestore backups contêm dados em texto plano
- Se bucket vazado, dados expostos

**Recomendação:**
- Ativar criptografia GCP para backups
- Restringir acesso ao bucket de backup

---

## 🛡️ PROTEÇÕES JÁ IMPLEMENTADAS

### ✅ 1. Firestore Security Rules
```javascript
// Exemplo: Apenas dono pode ler seus dados
match /customers/{customerId} {
  allow read: if isAdmin() || isOwner(customerId);
  allow write: if isAdmin() || isOwner(customerId);
}
```

**Proteção:**
- Usuário A não pode ler dados de Usuário B
- Apenas admins podem ver todos os dados

### ✅ 2. Autenticação Forte
- Firebase Authentication (padrão da indústria)
- Senhas hasheadas com bcrypt
- Tokens JWT com expiração

### ✅ 3. Isolamento de Dados
- Cada usuário vê apenas seus próprios:
  - Pedidos (`orders`)
  - Reservas (`reservas`)
  - Transações (`wallet_transactions`)

### ✅ 4. HTTPS Obrigatório
- Todas as comunicações criptografadas em trânsito
- TLS 1.2+ (padrão Firebase)

### ✅ 5. Rate Limiting (Parcial)
- Firebase tem proteção DDoS nativa
- Limite de requisições por IP

---

## 📋 PLANO DE PROTEÇÃO COMPLETO

### Nível 1: URGENTE (Implementar AGORA)

#### 1.1 Criptografar CPF/CNPJ
**Prioridade:** 🔴 CRÍTICA

**Implementação:**
1. Criar Cloud Function para criptografia
2. Migrar dados existentes
3. Atualizar regras de validação

**Arquivos afetados:**
- `functions/src/encryption.ts` (novo)
- `functions/src/index.ts` (modificar)
- `src/pages/Auth.tsx` (modificar)


#### 1.2 Implementar Audit Logging
**Prioridade:** 🟠 ALTA

**Collection:** `audit_logs`
```typescript
{
  userId: string,
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE',
  resource: string,
  timestamp: Timestamp,
  ip: string,
  success: boolean
}
```

#### 1.3 Sanitizar Logs
**Prioridade:** 🟠 ALTA

Criar helper `sanitizeForLog()` e aplicar em todas as Cloud Functions.

### Nível 2: IMPORTANTE (Próximos 30 dias)

#### 2.1 Implementar LGPD Compliance

**Direitos do Titular (LGPD Art. 18):**
- ✅ Confirmação de tratamento
- ❌ Acesso aos dados
- ❌ Correção de dados
- ❌ Anonimização
- ❌ Eliminação (direito ao esquecimento)
- ❌ Portabilidade

**Cloud Functions necessárias:**
```typescript
// Baixar todos os dados do usuário
export const downloadMyData = onCall(async (request) => {
    // Retornar JSON com TODOS os dados do usuário
});

// Deletar conta e dados
export const deleteMyAccount = onCall(async (request) => {
    // Anonimizar ou deletar dados
});

// Atualizar consentimento
export const updateConsent = onCall(async (request) => {
    // Registrar consentimento LGPD
});
```

#### 2.2 Backup Seguro e Disaster Recovery

**Implementar:**
- Backup automático diário do Firestore
- Criptografia dos backups
- Teste de restauração mensal
- Retention de 30 dias

**Firebase Console:**
```bash
# Configurar backup automático
gcloud firestore backups schedules create \
  --database='(default)' \
  --recurrence=daily \
  --retention=30d
```

#### 2.3 Monitoramento de Segurança

**Alertas a configurar:**
- Múltiplas tentativas de login falhadas
- Acesso de IPs suspeitos
- Mudanças em Security Rules
- Acessos de admin
- Exportação de dados em massa

### Nível 3: MELHORIA CONTÍNUA (Ongoing)

#### 3.1 Penetration Testing
- Contratar pentest externo anualmente
- Testar vulnerabilidades OWASP Top 10

#### 3.2 Security Headers
```typescript
// Cloud Functions: adicionar headers de segurança
export const myFunction = onRequest((req, res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Strict-Transport-Security', 'max-age=31536000');
    // ... lógica
});
```

#### 3.3 Treinamento da Equipe
- LGPD awareness
- Secure coding practices
- Incident response

---

## 🚨 PLANO DE RESPOSTA A INCIDENTES

### Fase 1: DETECÇÃO (0-1h)

1. **Identificar o incidente:**
   - Monitorar alertas do Firebase
   - Revisar audit logs
   - Verificar relatórios de usuários

2. **Ativar equipe de resposta:**
   - DPO (Data Protection Officer)
   - CTO/Tech Lead
   - Jurídico

### Fase 2: CONTENÇÃO (1-4h)

1. **Isolar o problema:**
   ```bash
   # Desativar funções comprometidas
   firebase functions:delete functionName
   
   # Revogar tokens
   firebase auth:export users.json
   # Forçar re-login de todos
   ```

2. **Preservar evidências:**
   - Exportar logs
   - Snapshot do banco de dados
   - Capturar tráfego de rede

### Fase 3: ERRADICAÇÃO (4-24h)

1. **Corrigir vulnerabilidade**
2. **Atualizar Security Rules**
3. **Rotacionar secrets**
4. **Deploy de correção**

### Fase 4: RECUPERAÇÃO (24-72h)

1. **Restaurar serviços**
2. **Monitorar anomalias**
3. **Validar integridade dos dados**

### Fase 5: NOTIFICAÇÃO LGPD

**PRAZO: 2 dias úteis** (LGPD Art. 48)

Se houver vazamento:
1. **Notificar ANPD** (Autoridade Nacional)
2. **Notificar usuários afetados**
3. **Publicar comunicado**

**Template de email:**
```
Assunto: IMPORTANTE - Notificação de Incidente de Segurança

Prezado(a) [NOME],

Informamos que em [DATA] identificamos um incidente de segurança
que pode ter afetado seus dados pessoais.

DADOS IMPACTADOS:
- [listar tipos de dados]

AÇÕES TOMADAS:
- [correções implementadas]

RECOMENDAÇÕES:
- Alterar sua senha
- Monitorar suas contas

Para mais informações: [email/telefone]

Atenciosamente,
EXS Locações
```

---

## 📊 CONFORMIDADE LGPD/GDPR

### Princípios LGPD

| Princípio | Status | Ação |
|-----------|--------|------|
| **Finalidade** | ⚠️ Parcial | Documentar uso de dados |
| **Adequação** | ✅ OK | Dados necessários para serviço |
| **Necessidade** | ⚠️ Parcial | Revisar campos obrigatórios |
| **Livre acesso** | ❌ Falta | Implementar download de dados |
| **Qualidade dos dados** | ✅ OK | Validação de CPF/CNPJ |
| **Transparência** | ⚠️ Parcial | Criar política de privacidade |
| **Segurança** | ⚠️ Parcial | Criptografar dados sensíveis |
| **Prevenção** | ✅ OK | Security Rules ativas |
| **Não discriminação** | ✅ OK | Não aplicável |
| **Responsabilização** | ⚠️ Parcial | Implementar audit logs |

### Documentos Necessários

1. **Política de Privacidade** ❌
2. **Termos de Uso** ❌
3. **Registro de Tratamento de Dados** ❌
4. **Análise de Impacto (RIPD)** ❌
5. **Contratos com Processadores** ⚠️ (Asaas)

---

## 🎯 RESUMO EXECUTIVO

### 🟢 Pontos Fortes

1. ✅ Autenticação robusta (Firebase Auth)
2. ✅ Autorização implementada (Security Rules)
3. ✅ API Keys protegidas (Secrets)
4. ✅ HTTPS obrigatório
5. ✅ Isolamento de dados por usuário

### 🔴 Pontos Críticos

1. ❌ CPF/CNPJ em texto plano
2. ❌ Falta de audit logs
3. ❌ Logs podem expor dados sensíveis
4. ❌ Não conformidade total LGPD
5. ❌ Ausência de plano de resposta documentado

### 📈 Próximos Passos (Prioridade)

| # | Ação | Prazo | Impacto |
|---|------|-------|---------|
| 1 | Criptografar CPF/CNPJ | **1 semana** | 🔴 Crítico |
| 2 | Implementar audit logs | **2 semanas** | 🟠 Alto |
| 3 | Sanitizar logs | **1 semana** | 🟠 Alto |
| 4 | Criar política LGPD | **2 semanas** | 🟡 Médio |
| 5 | Implementar download de dados | **3 semanas** | 🟡 Médio |
| 6 | Configurar backups criptografados | **1 semana** | 🟡 Médio |

---

## 💰 Estimativa de Custos

| Item | Custo Mensal | Único |
|------|--------------|-------|
| Firebase (atual) | R$ 5-50 | - |
| Backup automático | R$ 10-30 | - |
| Cloud KMS (criptografia) | R$ 5-15 | - |
| Pentest anual | - | R$ 3.000-10.000 |
| DPO externo | R$ 500-2.000 | - |
| **TOTAL** | **R$ 520-2.095/mês** | **R$ 3k-10k/ano** |

---

**Data:** 2026-01-26  
**Classificação:** CONFIDENCIAL  
**Próxima Revisão:** 2026-02-26
