document.getElementById('btn-analisar').addEventListener('click', async () => {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "Iniciando diagnóstico... ⏳";

    try {
        // Busca a aba atual de forma 100% segura para Painéis Laterais
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        
        if (!tab || !tab.url || !tab.url.includes("lichess.org")) {
            resultDiv.innerHTML = "<strong>Aviso:</strong> Deixe a aba do Lichess aberta e ativa enquanto clica em Analisar.";
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
            let textoFormatado = data.analysis;
            
            // 1. Converte as quebras de linha
            textoFormatado = textoFormatado.replace(/\n/g, '<br>');
            
            // 2. Converte o texto em negrito
            textoFormatado = textoFormatado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // 3. Converte o link do WhatsApp num botão verde premium estilizado
            textoFormatado = textoFormatado.replace(/\[(.*?)\]\((.*?)\)/g, '<br><br><a href="$2" target="_blank" style="display: inline-block; background-color: #25D366; color: white; padding: 12px 15px; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">📱 $1</a><br>');
            
            resultDiv.innerHTML = textoFormatado;
        } else {
            resultDiv.innerHTML = "<strong>Erro:</strong> A IA não enviou o texto do diagnóstico.";
        }
    } catch (err) {
        resultDiv.innerHTML = `<strong>Falha Detetada:</strong> ${err.message}`;
    }
});
