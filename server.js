import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Statické soubory (složka public)
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate-statement', async (req, res) => {
  try {
    const { user_id, date_from, date_to } = req.body;
    
    // Přímé HTTP volání API (obchází NPM SDK balíček)
    const response = await fetch('https://gold-bankcz.base44.app/api/functions/generateAccountStatement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Tady si API bere klíč přímo z proměnných na Railway
        'api_key': process.env.BASE44_API_KEY 
      },
      body: JSON.stringify({
        user_id,
        date_from,
        date_to
      })
    });

    // Zpracování odpovědi od Base44 API
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'API vrátilo neočekávanou chybu');
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Chyba při generování výpisu:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Hlavní stránka (fallback, pokud statický routing selže)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Konzole běží na portu: ${PORT}`);
});
