document.getElementById('btn-analisar').addEventListener('click', async () => {
    const resultDiv = document.getElementById('result');
    resultDiv.innerText = "Analisando... ⏳";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: "getGameInfo" }, async (response) => {
        if (!response || !response.success) {
            resultDiv.innerText = "Erro: Abra uma partida no Lichess.";
            return;
        }

        try {
            const pgnRes = await fetch(`https://lichess.org/game/export/${response.gameId}`);
            const pgn = await pgnRes.text();

            const apiRes = await fetch('https://chessveja-site.vercel.app/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pgn, level: document.getElementById('level').value })
            });

            const data = await apiRes.json();
            resultDiv.innerText = data.analysis || "Erro na análise.";
        } catch (err) {
            resultDiv.innerText = "Erro de conexão.";
        }
    });
});
