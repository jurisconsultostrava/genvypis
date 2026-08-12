import express from 'express';
import { createClient } from '@base44/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

// Nastavení absolutních cest pro ES moduly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// TADY JE TA HLAVNÍ ZMĚNA - Absolutní cesta do složky public
app.use(express.static(path.join(__dirname, 'public')));

const base44 = createClient({
  appId: process.env.BASE44_APP_ID || "686dc5869b4a83e17e2d8b3d",
  headers: {
    "api_key": process.env.BASE44_API_KEY
  }
});

app.post('/api/generate-statement', async (req, res) => {
  try {
    const { user_id, date_from, date_to } = req.body;
    const result = await base44.functions.generateAccountStatement({
      user_id,
      date_from,
      date_to
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Chyba při generování výpisu:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Konzole běží na portu: ${PORT}`);
  console.log(`Hledám statické soubory ve složce: ${path.join(__dirname, 'public')}`);
});
