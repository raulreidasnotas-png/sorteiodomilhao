// =========================================
// 🚀 Servidor backend para integração SPEDPAY
// =========================================

// Importações
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";

// Carrega variáveis do .env
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// =========================================
// 🔐 Variáveis de ambiente
// =========================================
const SPEDPAY_BASE_URL = process.env.https://api.spedpay.online/integration/docs/api;
const SPEDPAY_API_SECRET = process.env.sk_7a6a42897e843bbfe7fb839fab28ddf0deca91e9109873957c6ef1dca581ef69706d695cfeb1b1f4b654a251f6b0516fe8959fda85ad29ce83fd0e0f64539ef7;
const SPEDPAY_RECIPIENT_ID = process.env.rcpt_8c4f470a-7a76-4cfd-920c-8ae9025e4f6d;
const PORT = process.env.PORT || 3000;

// =========================================
// 🧩 Rota para criar pagamento
// =========================================
app.post("/api/payment", async (req, res) => {
  try {
    const { name, email, amount, utms } = req.body;

    // Validação básica
    if (!name || !email || !amount) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    // Monta o corpo da requisição conforme API da SpedPay
    const body = {
      amount: Number(amount),
      payer: {
        name,
        email,
      },
      split: [
        {
          recipient_id: SPEDPAY_RECIPIENT_ID,
          percentage: 100, // envia 100% pro recebedor principal
        },
      ],
      metadata: {
        source: "Meta Ads",
        utms, // salva UTMs junto à transação
      },
    };

    // Envia a requisição para a API da SpedPay
    const response = await fetch(`${SPEDPAY_BASE_URL}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SPEDPAY_API_SECRET}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro da SpedPay:", data);
      return res.status(500).json({ error: "Erro ao criar pagamento.", details: data });
    }

    console.log("Pagamento criado com sucesso:", data);
    res.json(data);
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// =========================================
// 🌐 Rota para capturar UTMs do front-end
// =========================================
app.post("/api/utms", (req, res) => {
  const { utm_source, utm_medium, utm_campaign, utm_content, utm_term } = req.body;

  console.log("📊 UTMs recebidas:", { utm_source, utm_medium, utm_campaign, utm_content, utm_term });
  res.json({ message: "UTMs recebidas com sucesso" });
});

// =========================================
// ▶️ Inicializa o servidor
// =========================================
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
