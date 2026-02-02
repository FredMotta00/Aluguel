/**
 * Script para criptografar CPFs/CNPJs existentes no Firestore
 * 
 * ⚠️ IMPORTANTE: Fazer backup do Firestore antes de executar!
 * 
 * Este script:
 * 1. Busca todos os documentos em 'customers'
 * 2. Verifica se o CPF já está criptografado
 * 3. Criptografa CPFs em texto plano
 * 4. Atualiza o documento com CPF criptografado
 * 
 * Uso:
 *   cd scripts
 *   ts-node encryptExistingCPF.ts
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';

// Inicializar Firebase Admin
initializeApp();
const db = getFirestore();

// Chave de criptografia (mesma configurada no Firebase Secret)
// ⚠️ SUBSTITUIR pela chave gerada anteriormente
const ENCRYPTION_KEY_BASE64 = 'SUA_CHAVE_AQUI'; // Colar a chave gerada com: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

function getKeyBuffer(): Buffer {
    return Buffer.from(ENCRYPTION_KEY_BASE64, 'base64');
}

/**
 * Criptografa um texto usando AES-256-CBC
 */
function encrypt(text: string): string {
    if (!text) return '';

    try {
        const key = getKeyBuffer();
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Verifica se um valor já está criptografado
 */
function isEncrypted(value: string): boolean {
    return value && value.includes(':');
}

/**
 * Mascara CPF para logs
 */
function maskCPF(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
    }
    return '***';
}

async function encryptAllCPFs() {
    console.log('🔐 Iniciando criptografia de CPFs existentes...\n');

    // Verificar se a chave foi configurada
    if (ENCRYPTION_KEY_BASE64 === 'SUA_CHAVE_AQUI') {
        console.error('❌ ERRO: Configure a ENCRYPTION_KEY_BASE64 no script!');
        console.error('   Execute: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
        process.exit(1);
    }

    const customersRef = db.collection('customers');

    try {
        const snapshot = await customersRef.get();

        if (snapshot.empty) {
            console.log('ℹ️  Nenhum cliente encontrado na collection customers');
            return;
        }

        console.log(`📊 Total de documentos: ${snapshot.size}\n`);

        let encrypted = 0;
        let skipped = 0;
        let errors = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const cpfCnpj = data.cpfCnpj;

            if (!cpfCnpj) {
                console.log(`⏭️  ${doc.id}: Sem CPF/CNPJ - pulando`);
                skipped++;
                continue;
            }

            // Verificar se já está criptografado
            if (isEncrypted(cpfCnpj)) {
                console.log(`✓  ${doc.id}: Já criptografado - pulando`);
                skipped++;
                continue;
            }

            try {
                // Criptografar CPF
                const encryptedCPF = encrypt(cpfCnpj);

                // Atualizar documento
                await doc.ref.update({
                    cpfCnpj: encryptedCPF,
                    cpfEncryptedAt: new Date(),
                    cpfEncryptedBy: 'migration-script'
                });

                encrypted++;
                console.log(`✅ ${doc.id}: ${maskCPF(cpfCnpj)} → [ENCRYPTED]`);

            } catch (error) {
                errors++;
                console.error(`❌ ${doc.id}: Erro ao criptografar - ${error}`);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 RESULTADOS DA MIGRAÇÃO');
        console.log('='.repeat(50));
        console.log(`✅ Criptografados: ${encrypted}`);
        console.log(`⏭️  Pulados: ${skipped}`);
        console.log(`❌ Erros: ${errors}`);
        console.log(`📝 Total: ${snapshot.size}`);
        console.log('='.repeat(50));

        if (encrypted > 0) {
            console.log('\n✨ Migração concluída com sucesso!');
            console.log('⚠️  IMPORTANTE: Configure o mesmo ENCRYPTION_KEY no Firebase Secret');
            console.log('   Comando: firebase functions:secrets:set ENCRYPTION_KEY');
        }

    } catch (error) {
        console.error('\n❌ ERRO FATAL:', error);
        process.exit(1);
    }
}

// Executar migração
console.log('\n' + '='.repeat(50));
console.log('🔐 SCRIPT DE CRIPTOGRAFIA DE CPF/CNPJ');
console.log('='.repeat(50) + '\n');

console.log('⚠️  ATENÇÃO: Este script irá modificar dados no Firestore!');
console.log('⚠️  Certifique-se de ter feito backup antes de continuar.\n');

// Aguardar 3 segundos para dar tempo de cancelar
console.log('Iniciando em 3 segundos... (Ctrl+C para cancelar)\n');

setTimeout(() => {
    encryptAllCPFs()
        .then(() => {
            console.log('\n👋 Finalizando script...');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Erro:', error);
            process.exit(1);
        });
}, 3000);
