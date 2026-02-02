# Guia de Administração - EXS Locações

## Como Adicionar um Novo Administrador

### Método 1: Via Firebase Console (Recomendado)

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto (`comexs-r1g97`)
3. Navegue até **Firestore Database**
4. Vá para a collection **`admins`**
5. Clique em **"Add document"** ou **"Adicionar documento"**
6. Configure o documento:
   - **Document ID**: Use o `uid` do usuário (copie do Firebase Authentication)
   - **Fields**: Adicione os seguintes campos:
     ```
     email: string (e-mail do admin)
     displayName: string (nome do admin)
     createdAt: timestamp (data atual)
     active: boolean (true)
     ```
7. Clique em **Save**

### Método 2: Via Script (Alternativo)

**⚠️ ATENÇÃO:** O script `addAdmin.ts` está no `.gitignore` por conter lógica sensível. 

Para criar o script:

```typescript
// scripts/addAdmin.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Configure Firebase
const firebaseConfig = {
    apiKey: "SEU_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    // ... outros campos
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addAdmin(uid: string, email: string, displayName: string) {
    try {
        await setDoc(doc(db, 'admins', uid), {
            email,
            displayName,
            createdAt: new Date(),
            active: true
        });
        console.log(`✅ Admin adicionado: ${email}`);
    } catch (error) {
        console.error('❌ Erro ao adicionar admin:', error);
    }
}

// Exemplo de uso:
// addAdmin('USER_UID_AQUI', 'admin@example.com', 'Nome do Admin');
```

### Método 3: Via Cloud Function (Mais Seguro)

Crie uma Cloud Function protegida que só pode ser executada uma vez:

```typescript
// functions/src/index.ts
export const setupFirstAdmin = onCall(async (request) => {
    const { setupKey, email, uid } = request.data;
    
    // Usar uma chave secreta armazenada no Firebase Secrets
    if (setupKey !== process.env.SETUP_KEY) {
        throw new HttpsError('permission-denied', 'Invalid setup key');
    }
    
    await getDb().collection('admins').doc(uid).set({
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true
    });
    
    return { success: true };
});
```

## Estrutura do Documento Admin

```typescript
interface AdminDocument {
    email: string;           // E-mail do admin
    displayName?: string;    // Nome de exibição (opcional)
    createdAt: Timestamp;    // Data de criação
    active: boolean;         // Se o admin está ativo
    permissions?: string[];  // Permissões específicas (futuro)
}
```

## Como Verificar se um Usuário é Admin

### No Frontend (React)

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
    const { isAdmin, adminLoading } = useAuth();
    
    if (adminLoading) return <div>Verificando permissões...</div>;
    
    if (!isAdmin) return <div>Acesso negado</div>;
    
    return <div>Área de Admin</div>;
}
```

### Nas Cloud Functions

```typescript
async function isUserAdmin(uid: string): Promise<boolean> {
    const adminDoc = await getDb().collection('admins').doc(uid).get();
    return adminDoc.exists;
}
```

## Segurança

🔒 **Proteções Implementadas:**

1. ✅ Collection `admins` é **read-only** via Firestore Security Rules
2. ✅ Apenas usuários autenticados podem ler seu próprio status de admin
3. ✅ Admins existentes podem ler a lista completa de admins
4. ✅ **NINGUÉM** pode escrever via cliente - apenas via Console ou script server-side
5. ✅ Rotas `/admin/*` protegidas com `AdminRoute`
6. ✅ Cloud Functions verificam se usuário é admin antes de executar ações sensíveis

## Removendo um Admin

Para remover permissões de admin:

1. Vá ao Firebase Console → Firestore → Collection `admins`
2. Encontre o documento com o UID do usuário
3. **Opção A:** Altere o campo `active` para `false` (desativa temporariamente)
4. **Opção B:** Delete o documento completamente (remove permanentemente)

## Primeiro Admin

Se você ainda não tem nenhum admin no sistema:

1. Crie uma conta normal via `/auth`
2. Copie o `uid` do usuário em **Firebase Console → Authentication**
3. Use o **Método 1** (Firebase Console) para criar o primeiro admin
4. Faça logout e login novamente para as permissões serem aplicadas

---

**Última atualização:** 2026-01-26
