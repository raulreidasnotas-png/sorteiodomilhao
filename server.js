import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Rota para criar pagamento PIX
app.post("/api/create-pix", async (req, res) => {
  try {
    const { name, email, amount, quantity, utms } = req.body;

    // 🔐 Usa sua chave SPEDPAY guardada no .env
    const response = await fetch("https://api.spedpay.online/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SPEDPAY_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: {
          name,
          email,
        },
        items: [
          {
            name: "Compra de Títulos",
            quantity,
            value: amount,
          },
        ],
        metadata: utms, // Passa as UTMs junto
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Erro ao criar pagamento:", err);
    res.status(500).json({ error: "Erro ao criar pagamento PIX" });
  }
});

// 🔹 Rota para verificar status de pagamento
app.get("/api/check-payment", async (req, res) => {
  try {
    const { transactionId } = req.query;

    const response = await fetch(
      `https://api.spedpay.online/v1/payments/${transactionId}`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.SPEDPAY_SECRET}`,
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Erro ao verificar pagamento:", err);
    res.status(500).json({ error: "Erro ao verificar status" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`));
