document.getElementById('btn-analisar').addEventListener('click', () => {
    const divResultado = document.getElementById('resultado');
    const textoAnalise = document.getElementById('texto-analise');
    const spanGenial = document.getElementById('qtd-genial');
    const spanCapivarda = document.getElementById('qtd-capivarda');
    
    divResultado.style.display = 'block';
    textoAnalise.innerHTML = 'Conectando ao cérebro da OpenAI... ⏳<br><br>Isso leva alguns segundos.';
    spanGenial.innerText = '-';
    spanCapivarda.innerText = '-';

    chrome.runtime.sendMessage({ action: "obterPGN" }, async (response) => {
        if (response && response.pgn) {
            const pgn = response.pgn;

            // ============== CHAVE DA OPENAI ==============
            // APAGUE O TEXTO COLE_SUA_CHAVE_AQUI E COLE A SUA CHAVE DENTRO DAS ASPAS
            const OPENAI_API_KEY = "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"; 
            // =============================================

            const prompt = `Analise a seguinte partida de xadrez em PGN.
            Você deve responder EXATAMENTE neste formato:
            GENIAIS: [número de lances muito bons ou brilhantes]
            CAPIVARDAS: [número de erros graves ou blunders]
            ANÁLISE: [Sua análise detalhada, amigável e didática, explicando os momentos críticos, os erros e sugerindo lances melhores. Fale diretamente com o jogador em português].

            PGN da partida:
            ${pgn}`;

            try {
                const iaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo", 
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7
                    })
                });

                const data = await iaResponse.json();

                if (data.choices && data.choices.length > 0) {
                    const respostaTexto = data.choices[0].message.content;

                    const matchGeniais = respostaTexto.match(/GENIAIS:\s*(\d+)/i);
                    const matchCapivardas = respostaTexto.match(/CAPIVARDAS:\s*(\d+)/i);
                    const matchAnalise = respostaTexto.match(/ANÁLISE:\s*([\s\S]*)/i);

                    spanGenial.innerText = matchGeniais ? matchGeniais[1] : '0';
                    spanCapivarda.innerText = matchCapivardas ? matchCapivardas[1] : '0';
                    
                    if (matchAnalise) {
                        textoAnalise.innerHTML = matchAnalise[1].replace(/\n/g, '<br>');
                    } else {
                        textoAnalise.innerHTML = respostaTexto.replace(/\n/g, '<br>');
                    }

                } else {
                    textoAnalise.innerHTML = '<span style="color: #ff4444;">Erro ao analisar. Verifique se a chave da OpenAI está correta ou se tem saldo.</span>';
                }

            } catch (error) {
                textoAnalise.innerHTML = '<span style="color: #ff4444;">Erro de conexão com a OpenAI.</span>';
            }

        } else {
            textoAnalise.innerHTML = '<span style="color: #ff4444;">Nenhuma partida encontrada. Abra uma partida finalizada no Lichess e clique no botão verde na tela.</span>';
        }
    });
});

document.getElementById('btn-upgrade').addEventListener('click', () => {
    alert('Em breve: Redirecionando para o pagamento seguro do Mercado Pago...');
});

document.getElementById('btn-exportar').addEventListener('click', () => {
    alert('Em breve: Gerando imagem bonita para postar no Instagram!');
});
