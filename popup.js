document.getElementById('btn-analisar').addEventListener('click', async () => {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "Gerando o diagnóstico... ⏳";

    try {
        // Busca a aba atual de forma 100% segura para Painéis Laterais
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        
        if (!tab || !tab.url || !tab.url.includes("lichess.org")) {
            resultDiv.innerHTML = "<strong>Erro:</strong> Você precisa estar na aba do Lichess.";
            return;
        }

        // Lê links do Lichess que tenham entre 8 e 12 letras/números
        const urlMatch = tab.url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/);
        const palavrasInvalidas = ['analysis', 'training', 'practice', 'study'];
        
        let gameId = null;
        if (urlMatch && !palavrasInvalidas.includes(urlMatch[1])) {
            // O Lichess só precisa das 8 primeiras letras para puxar a partida
            gameId = urlMatch[1].substring(0, 8); 
        }

        if (!gameId) {
            resultDiv.innerHTML = "<strong>Erro:</strong> Por favor, abra uma partida finalizada no Lichess.";
            return;
        }

        const pgnRes = await fetch(`https://lichess.org/game/export/${gameId}`);
        if (!pgnRes.ok) throw new Error("Partida não encontrada");
        const pgn = await pgnRes.text();

        const apiRes = await fetch('https://chessveja-site.vercel.app/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pgn, level: document.getElementById('level').value, type: 'summary' })
        });

        const data = await apiRes.json();
        
        if (data.analysis) {
            resultDiv.innerHTML = data.analysis.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        } else {
            resultDiv.innerHTML = "Erro na análise.";
        }
    } catch (err) {
        resultDiv.innerHTML = "<strong>Erro de conexão.</strong>";
    }
});
