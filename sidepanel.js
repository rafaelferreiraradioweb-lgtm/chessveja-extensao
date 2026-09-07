document.addEventListener('DOMContentLoaded', () => {
    const btnAnalisar = document.getElementById('btn-analisar');
    const btnWpp = document.getElementById('btn-wpp');
    const statusDiv = document.getElementById('status');
    const resultadoDiv = document.getElementById('resultado');
    const textoLaudo = document.getElementById('texto-laudo');
    const spinner = document.getElementById('loading-spinner');

    // Recupera o último laudo salvo na memória caso o usuário tenha fechado o painel
    chrome.storage.local.get(['ultimoLaudo'], (result) => {
        if (result.ultimoLaudo) {
            textoLaudo.innerHTML = result.ultimoLaudo;
            resultadoDiv.style.display = 'block';
        }
    });

    btnAnalisar.addEventListener('click', async () => {
        statusDiv.innerText = "Conectando ao Lichess...";
        spinner.style.display = 'block';
        resultadoDiv.style.display = 'none';

        // Pega a aba ativa
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.url.includes("lichess.org")) {
            statusDiv.innerText = "Erro: Você precisa estar em uma partida do Lichess.";
            spinner.style.display = 'none';
            return;
        }

        // Pede para o content.js a URL exata
        chrome.tabs.sendMessage(tab.id, { acao: "obterURL" }, async (response) => {
            if (!response || !response.url) {
                statusDiv.innerText = "Erro ao ler a página. Atualize o Lichess (F5) e tente novamente.";
                spinner.style.display = 'none';
                return;
            }

            const urlParts = response.url.split('/');
            const gameId = urlParts[3]; // Pega o ID da partida da URL

            if (!gameId || gameId.length < 8) {
                statusDiv.innerText = "Nenhuma partida detectada nesta página.";
                spinner.style.display = 'none';
                return;
            }

            statusDiv.innerText = "Baixando lances... Inteligência Artificial trabalhando (pode levar 30s) ⏳";

            try {
                // Baixa o PGN oficial do Lichess
                const lichessRes = await fetch(`https://lichess.org/game/export/${gameId}`);
                if (!lichessRes.ok) throw new Error("Não foi possível baixar os lances dessa partida.");
                const pgn = await lichessRes.text();

                // Envia para a sua API no Vercel (Substitua a URL abaixo pelo domínio real do seu Vercel)
                const apiRes = await fetch('https://chessveja-site.vercel.app/api/diagnose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        pgns: pgn, 
                        plataforma: 'extensao',
                        senhaAutenticacao: 'rafaelpro', // Sua senha do Vercel
                        instructions: "Estruture o laudo em 3 seções curtas (h3): 1. Pontos Fortes, 2. Fraquezas, 3. Plano de Ação."
                    })
                });

                const data = await apiRes.json();

                if (data.analysis) {
                    textoLaudo.innerHTML = data.analysis;
                    resultadoDiv.style.display = 'block';
                    statusDiv.innerText = "Laudo gerado!";
                    // Salva na memória
                    chrome.storage.local.set({ ultimoLaudo: data.analysis });
                } else {
                    throw new Error("Falha na geração do Laudo.");
                }

            } catch (error) {
                statusDiv.innerText = "Erro: " + error.message;
            } finally {
                spinner.style.display = 'none';
            }
        });
    });

    // Botão de WhatsApp
    btnWpp.addEventListener('click', () => {
        const mensagem = "Olá Mestre! Gere um diagnóstico na sua extensão e gostaria de marcar uma aula para corrigir meus erros.";
        const urlZap = `https://api.whatsapp.com/send?phone=5582996535079&text=${encodeURIComponent(mensagem)}`;
        window.open(urlZap, '_blank');
    });
});
