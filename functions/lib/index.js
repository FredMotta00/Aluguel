"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarCobrancaAsaas = exports.validateReservation = exports.validateReservationOnCreate = void 0;
const logger = require("firebase-functions/logger");
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const axios_1 = require("axios");
const params_1 = require("firebase-functions/params");
// Configurações do Asaas
const ASAAS_API_KEY = (0, params_1.defineSecret)("ASAAS_API_KEY");
const ASAAS_URL = "https://sandbox.asaas.com/api/v3";
admin.initializeApp();
/**
 * Helper para obter instância do Firestore de forma lazy
 * Evita timeouts durante o deploy/inicialização do módulo
 */
const getDb = () => admin.firestore();
/**
 * Valida se uma nova reserva tem conflito de datas
 * Trigger: Quando uma nova reserva é criada
 */
exports.validateReservationOnCreate = (0, firestore_1.onDocumentCreated)("reservas/{reservaId}", async (event) => {
    const snap = event.data;
    if (!snap) {
        return;
    }
    const newReservation = snap.data();
    const reservaId = event.params.reservaId;
    try {
        const db = getDb();
        logger.info(`🔍 Validando reserva ${reservaId} para produto ${newReservation.produto_id}`);
        // Ignorar se já foi processada
        if (newReservation.validated === true) {
            logger.info("✅ Reserva já validada anteriormente");
            return;
        }
        // Buscar outras reservas ATIVAS do mesmo produto
        const conflictingReservations = await db
            .collection("reservas")
            .where("produto_id", "==", newReservation.produto_id)
            .where("status", "in", [
            "pending",
            "pending_approval",
            "confirmed",
            "confirmada",
            "approved",
            "rented",
        ])
            .get();
        // Verificar conflitos de data
        const newStart = new Date(newReservation.data_inicio);
        const newEnd = new Date(newReservation.data_fim);
        let hasConflict = false;
        let conflictingReservaId = null;
        for (const doc of conflictingReservations.docs) {
            // Ignorar a própria reserva
            if (doc.id === reservaId)
                continue;
            const data = doc.data();
            const existingStart = new Date(data.data_inicio);
            const existingEnd = new Date(data.data_fim);
            // Lógica de sobreposição: (StartA <= EndB) AND (EndA >= StartB)
            if (newStart <= existingEnd && newEnd >= existingStart) {
                hasConflict = true;
                conflictingReservaId = doc.id;
                logger.info(`⚠️ Conflito detectado com reserva ${doc.id}`);
                break;
            }
        }
        if (hasConflict) {
            // 🚨 CONFLITO DETECTADO - Cancelar reserva
            await snap.ref.update({
                status: "rejected",
                rejection_reason: "conflict_dates",
                conflicting_reservation_id: conflictingReservaId,
                validated: true,
                validated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            logger.warn(`❌ Reserva ${reservaId} REJEITADA por conflito`);
            // Opcional: Cancelar a ordem associada
            if (newReservation.order_id) {
                await db.collection("orders").doc(newReservation.order_id).update({
                    status: "rejected",
                    rejection_reason: "reservation_conflict",
                });
            }
            return;
        }
        // ✅ SEM CONFLITO - Marcar como validada
        await snap.ref.update({
            validated: true,
            validated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger.info(`✅ Reserva ${reservaId} APROVADA (sem conflitos)`);
        return;
    }
    catch (error) {
        logger.error(`❌ Erro ao validar reserva ${reservaId}:`, error);
        // Marcar reserva com erro
        await snap.ref.update({
            validation_error: true,
            validation_error_message: String(error),
        });
        return;
    }
});
/**
 * Cloud Function HTTP para validar manualmente uma reserva
 * Útil para revalidações ou testes
 */
exports.validateReservation = (0, https_1.onCall)(async (request) => {
    // Verificar autenticação
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Usuário não autenticado");
    }
    const { reservaId } = request.data;
    if (!reservaId) {
        throw new https_1.HttpsError("invalid-argument", "reservaId é obrigatório");
    }
    try {
        const db = getDb();
        const reservaDoc = await db.collection("reservas").doc(reservaId).get();
        if (!reservaDoc.exists) {
            throw new https_1.HttpsError("not-found", "Reserva não encontrada");
        }
        const reserva = reservaDoc.data();
        // Buscar conflitos
        const conflictingReservations = await db
            .collection("reservas")
            .where("produto_id", "==", reserva.produto_id)
            .where("status", "in", [
            "pending",
            "pending_approval",
            "confirmed",
            "confirmada",
            "approved",
            "rented",
        ])
            .get();
        const newStart = new Date(reserva.data_inicio);
        const newEnd = new Date(reserva.data_fim);
        const conflicts = [];
        for (const doc of conflictingReservations.docs) {
            if (doc.id === reservaId)
                continue;
            const data = doc.data();
            const existingStart = new Date(data.data_inicio);
            const existingEnd = new Date(data.data_fim);
            if (newStart <= existingEnd && newEnd >= existingStart) {
                conflicts.push(doc.id);
            }
        }
        return {
            reservaId,
            hasConflict: conflicts.length > 0,
            conflicts,
            message: conflicts.length > 0
                ? `Encontrados ${conflicts.length} conflito(s)`
                : "Sem conflitos detectados",
        };
    }
    catch (error) {
        logger.error("Erro ao validar:", error);
        throw new https_1.HttpsError("internal", String(error));
    }
});
/**
 * Cloud Function para gerar cobranças no Asaas
 */
exports.criarCobrancaAsaas = (0, https_1.onCall)({
    secrets: [ASAAS_API_KEY]
}, async (request) => {
    var _a, _b, _c, _d, _e;
    // 1. Verificar autenticação
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Usuário não autenticado");
    }
    const { valor, cpfCnpj, nome, formaPagamento } = request.data;
    // Validação básica
    if (!valor || !cpfCnpj || !nome || !formaPagamento) {
        throw new https_1.HttpsError("invalid-argument", "Campos obrigatórios: valor, cpfCnpj, nome, formaPagamento");
    }
    try {
        const asaasHeaders = {
            "access_token": ASAAS_API_KEY.value(),
            "Content-Type": "application/json"
        };
        // PASSO A: Buscar ou Criar Cliente
        logger.info(`🔍 Buscando cliente no Asaas: ${cpfCnpj}`);
        const customerSearch = await axios_1.default.get(`${ASAAS_URL}/customers?cpfCnpj=${cpfCnpj}`, {
            headers: asaasHeaders
        });
        let customerId = "";
        if (customerSearch.data.data && customerSearch.data.data.length > 0) {
            customerId = customerSearch.data.data[0].id;
            logger.info(`✅ Cliente encontrado: ${customerId}`);
        }
        else {
            logger.info("🆕 Cliente não encontrado. Criando novo cliente...");
            const newCustomer = await axios_1.default.post(`${ASAAS_URL}/customers`, {
                name: nome,
                cpfCnpj: cpfCnpj
            }, { headers: asaasHeaders });
            customerId = newCustomer.data.id;
            logger.info(`✅ Cliente criado com ID: ${customerId}`);
        }
        // PASSO B: Gerar Cobrança
        // Definir data de vencimento para daqui a 3 dias
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);
        const dueDateString = dueDate.toISOString().split("T")[0];
        logger.info(`💸 Gerando cobrança de R$ ${valor} (${formaPagamento}) para customer ${customerId}`);
        const paymentResponse = await axios_1.default.post(`${ASAAS_URL}/payments`, {
            customer: customerId,
            billingType: formaPagamento, // PIX, BOLETO, CREDIT_CARD, etc
            value: valor,
            dueDate: dueDateString,
            description: "Locação de Equipamentos - EXS Solutions"
        }, { headers: asaasHeaders });
        logger.info("✅ Cobrança gerada com sucesso!");
        return {
            sucesso: true,
            id: paymentResponse.data.id,
            link: paymentResponse.data.invoiceUrl,
            pix: paymentResponse.data.bankSlipUrl
        };
    }
    catch (error) {
        logger.error("❌ Erro na integração com Asaas:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        // Extrair mensagem de erro original do Asaas se disponível
        const asaasErrorMessage = ((_e = (_d = (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.errors) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.description) || error.message;
        throw new https_1.HttpsError("internal", `Erro no Asaas: ${asaasErrorMessage}`);
    }
});
//# sourceMappingURL=index.js.map