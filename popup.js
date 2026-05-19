document.getElementById('btn-analisar').addEventListener('click', async () => {
    const resultDiv = document.getElementById('result');
    // Mudamos para innerHTML para suportar formatação e cores
    resultDiv.innerHTML = "Analisando a partida no nível Grande Mestre... ⏳<br><small>Aguarde, extraindo momentos críticos.</small>";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: "getGameInfo" }, async (response) => {
        if (!response || !response.success) {
            resultDiv.innerHTML = "<strong>Erro:</strong> Por favor, abra uma partida finalizada no Lichess.";
            return;
        }

        try {
            const pgnRes = await fetch(`https://lichess.org/game/export/${response.gameId}`);
            const pgn = await pgnRes.text();

            const apiRes = await fetch('https://chessveja-site.vercel.app/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    pgn, 
                    level: document.getElementById('level').value,
                    type: 'summary' // Aciona a análise de 3 fases que criamos
                })
            });

            const data = await apiRes.json();
            
            if (data.analysis) {
                // Prepara o texto recebido da Inteligência Artificial para ficar bonito no popup
                let textoFormatado = data.analysis;
                
                // 1. Converte quebras de linha para o formato HTML
                textoFormatado = textoFormatado.replace(/\n/g, '<br>');
                
                // 2. Transforma o negrito do markdown (**texto**) em negrito HTML
                textoFormatado = textoFormatado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                // 3. Transforma o link do WhatsApp para ser clicável
                textoFormatado = textoFormatado.replace(/\[(.*?)\]\((.*?)\)/g, '<br><br><a href="$2" target="_blank" style="display: inline-block; background-color: #2ecc71; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box;">📱 $1</a>');
                
                resultDiv.innerHTML = textoFormatado;
            } else {
                resultDiv.innerHTML = "Erro na análise. Tente novamente.";
            }
        } catch (err) {
            resultDiv.innerHTML = "<strong>Erro de conexão.</strong> Verifique sua internet ou tente mais tarde.";
        }
    });
});
