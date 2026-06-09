document.getElementById('btn-analisar').addEventListener('click', async () => {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "Iniciando diagnóstico... ⏳";

    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        
        if (!tab || !tab.url || !tab.url.includes("lichess.org")) {
            resultDiv.innerHTML = "<strong>Aviso:</strong> Deixe a aba do Lichess aberta e ativa enquanto clica em Analisar.";
            return;
        }

        const urlMatch = tab.url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/);
        const palavrasInvalidas = ['analysis', 'training', 'practice', 'study'];
        
        let gameId = null;
        if (urlMatch && !palavrasInvalidas.includes(urlMatch[1])) {
            gameId = urlMatch[1].substring(0, 8); 
        }

        if (!gameId) {
            resultDiv.innerHTML = "<strong>Erro:</strong> Por favor, abra uma partida finalizada no Lichess.";
            return;
        }

        resultDiv.innerHTML = "Passo 1: Baixando partida do Lichess... 📥";
        const pgnRes = await fetch(`https://lichess.org/game/export/${gameId}?clocks=false&evals=false`);
        if (!pgnRes.ok) throw new Error("O Lichess bloqueou o download da partida.");
        
        const pgn = await pgnRes.text();

        resultDiv.innerHTML = "Passo 2: IA Analisando lances (Pode levar de 10 a 20 segundos)... 🧠⏳";
        const apiRes = await fetch('https://chessveja-site.vercel.app/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pgn, level: document.getElementById('level').value, type: 'summary' })
        });

        if (!apiRes.ok) throw new Error(`O servidor da IA falhou (Erro ${apiRes.status}).`);

        const data = await apiRes.json();
        
        if (data.analysis) {
            resultDiv.innerHTML = data.analysis.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        } else {
            resultDiv.innerHTML = "<strong>Erro:</strong> A IA não enviou o texto do diagnóstico.";
        }
    } catch (err) {
        resultDiv.innerHTML = `<strong>Falha Detetada:</strong> ${err.message}`;
    }
});
