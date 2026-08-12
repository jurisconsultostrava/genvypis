import express from 'express';
import { createClient } from '@base44/sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Pokusí se naservírovat statické soubory
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

// NEPRŮSTŘELNÁ HLAVNÍ STRÁNKA S DIAGNOSTIKOU
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // Pokud soubor neexistuje, vypíšeme co na serveru skutečně je
        const filesRoot = fs.readdirSync(__dirname).join('<br>');
        let filesPublic = 'Složka public neexistuje';
        
        if (fs.existsSync(path.join(__dirname, 'public'))) {
            filesPublic = fs.readdirSync(path.join(__dirname, 'public')).join('<br>');
        }

        res.status(404).send(`
            <h2>Soubor index.html nebyl nalezen!</h2>
            <p>Railway se snaží načíst HTML, ale soubor tam není. Zde je obsah vašeho serveru:</p>
            <h3>Hlavní složka projektu:</h3>
            <code>${filesRoot}</code>
            <h3>Složka public:</h3>
            <code>${filesPublic}</code>
        `);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Konzole běží na portu: ${PORT}`);
});
