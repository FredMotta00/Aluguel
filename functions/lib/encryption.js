"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENCRYPTION_KEY = void 0;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.maskCPF = maskCPF;
exports.isEncrypted = isEncrypted;
const crypto = require("crypto");
const params_1 = require("firebase-functions/params");
// Firebase Secret para armazenar chave de criptografia
exports.ENCRYPTION_KEY = (0, params_1.defineSecret)('ENCRYPTION_KEY');
/**
 * Converte a chave base64 armazenada no Firebase Secret para Buffer
 * @returns Buffer de 32 bytes para AES-256
 */
function getKeyBuffer() {
    const keyBase64 = exports.ENCRYPTION_KEY.value();
    return Buffer.from(keyBase64, 'base64');
}
/**
 * Criptografa um texto usando AES-256-CBC
 * @param text - Texto plano (ex: CPF/CNPJ)
 * @returns String no formato "iv:encrypted" onde iv é o vetor de inicialização
 *
 * @example
 * const encryptedCPF = encrypt("12345678901");
 * // Retorna: "a3f5e7c9d1b3....:8d4f2a1b3c5e..."
 */
function encrypt(text) {
    if (!text)
        return '';
    try {
        const key = getKeyBuffer();
        const iv = crypto.randomBytes(16); // Vetor de inicialização aleatório
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // Retorna IV:encrypted para poder decifrar depois
        return iv.toString('hex') + ':' + encrypted;
    }
    catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}
/**
 * Descriptografa um valor previamente criptografado
 * @param encryptedText - String no formato "iv:encrypted"
 * @returns Texto plano original
 *
 * @example
 * const cpf = decrypt("a3f5e7c9d1b3....:8d4f2a1b3c5e...");
 * // Retorna: "12345678901"
 */
function decrypt(encryptedText) {
    if (!encryptedText)
        return '';
    // Se não contém ':', assume que é texto plano (dados antigos não criptografados)
    if (!encryptedText.includes(':')) {
        return encryptedText;
    }
    try {
        const key = getKeyBuffer();
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}
/**
 * Mascara CPF/CNPJ para uso em logs (LGPD compliance)
 * @param cpf - CPF ou CNPJ (com ou sem formatação)
 * @returns CPF/CNPJ mascarado
 */
function maskCPF(cpf) {
    if (!cpf)
        return '';
    // Remove caracteres não numéricos
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
        // CPF: 123.***.***-01
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
    }
    else if (cleaned.length === 14) {
        // CNPJ: 12.***.***/****-90
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.***.***/****-$5');
    }
    // Se não for CPF nem CNPJ, retorna mascarado genérico
    return '***';
}
/**
 * Verifica se um valor está criptografado
 * @param value - Valor a verificar
 * @returns true se estiver criptografado (contém ':')
 */
function isEncrypted(value) {
    return !!(value && value.includes(':'));
}
//# sourceMappingURL=encryption.js.map