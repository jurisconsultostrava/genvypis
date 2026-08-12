import express from 'express';

const app = express();
app.use(express.json());

// 1. BACKEND: Bezpečné volání API
app.post('/api/generate-statement', async (req, res) => {
  try {
    const { user_id, date_from, date_to } = req.body;
    
    const response = await fetch('https://gold-bankcz.base44.app/api/functions/generateAccountStatement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.BASE44_API_KEY || "eaa91acb148040a3bf601bac6860fad1",
        // Zde je to správné appId!
        'appId': "69518883abb88815c54af5a9",
        'app_id': "69518883abb88815c54af5a9"
      },
      body: JSON.stringify({ user_id, date_from, date_to })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'API vrátilo neočekávanou chybu');
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. FRONTEND: Servírovaný přímo, žádné složky navíc
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generátor Výpisů | Gold Bank</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f4f4f5; padding: 2rem; }
        .console { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; font-weight: bold; margin-bottom: 0.5rem; }
        input { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { background: #000; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; }
        button:hover { background: #333; }
        pre { background: #18181b; color: #10b981; padding: 1rem; border-radius: 4px; overflow-x: auto; margin-top: 1rem; white-space: pre-wrap; word-wrap: break-word; }
        .loader { display: none; margin-top: 1rem; text-align: center; color: #666; font-weight: bold; }
    </style>
</head>
<body>
    <div class="console">
        <h2>Konzole pro generování výpisů</h2>
        <div class="form-group">
            <label for="userId">ID Uživatele (user_id):</label>
            <input type="text" id="userId" placeholder="např. 60d5ecb8b392..." required>
        </div>
        <div class="form-group">
            <label for="dateFrom">Datum od:</label>
            <input type="date" id="dateFrom" required>
        </div>
        <div class="form-group">
            <label for="dateTo">Datum do:</label>
            <input type="date" id="dateTo" required>
        </div>
        <button onclick="generateStatement()">Vygenerovat výpis</button>
        <div id="loader" class="loader">Zpracovávám požadavek a volám Gold Bank API...</div>
        <h3 style="margin-top: 2rem;">Výstup z API:</h3>
        <pre id="output">// Zde se zobrazí odpověď ze serveru...</pre>
    </div>
    <script>
        async function generateStatement() {
            const userId = document.getElementById('userId').value;
            const dateFrom = document.getElementById('dateFrom').value;
            const dateTo = document.getElementById('dateTo').value;
            const output = document.getElementById('output');
            const loader = document.getElementById('loader');

            if (!userId || !dateFrom || !dateTo) return alert('Vyplňte prosím všechna pole');

            output.textContent = '';
            loader.style.display = 'block';

            try {
                const response = await fetch('/api/generate-statement', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, date_from: dateFrom, date_to: dateTo })
                });
                const data = await response.json();
                output.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                output.textContent = 'Kritická chyba: ' + error.message;
            } finally {
                loader.style.display = 'none';
            }
        }
    </script>
</body>
</html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Konzole běží na portu: ${PORT} (prijima externi spojeni)`);
});
