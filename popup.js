document.getElementById('btn-analisar').addEventListener('click', () => {
    const divResultado = document.getElementById('resultado');
    const textoAnalise = document.getElementById('texto-analise');
    const spanGenial = document.getElementById('qtd-genial');
    const spanCapivara = document.getElementById('qtd-capivarda');
    
    divResultado.style.display = 'block';
    textoAnalise.innerHTML = 'O mestre Chessveja está analisando os momentos críticos... ⏳';
    spanGenial.innerText = '-';
    spanCapivarda.innerText = '-';

    chrome.runtime.sendMessage({ action: "obterPGN" }, async (response) => {
        if (response && response.pgn) {
            try {
                const API_URL = 'https://chessveja-api.vercel.app/api';
                const iaResponse = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pgn: response.pgn })
                });

                const data = await iaResponse.json();

                if (data.resultado) {
                    const texto = data.resultado;

                    const geniais = texto.match(/GENIAIS:\s*(\d+)/i);
                    const capivaras = texto.match(/CAPIVARAS:\s*(\d+)/i);
                    
                    // Pega o texto após o número de capivaras
                    const analiseCompleta = texto.split(/CAPIVARAS:\s*\d+/i)[1] || texto;

                    spanGenial.innerText = geniais ? geniais[1] : '0';
                    spanCapivarda.innerText = capivaras ? capivaras[1] : '0';
                    
                    // Formata os títulos em negrito
                    textoAnalise.innerHTML = analiseCompleta
                        .trim()
                        .replace(/\n/g, '<br>')
                        .replace(/(3 MOMENTOS CRÍTICOS:|PLANOS ESTRATÉGICOS:|CONCLUSÃO:)/g, '<strong>$1</strong>');

                    // Ativa o contador visual temporário
                    document.getElementById('contador-analises').innerText = "2/3";

                } else {
                    textoAnalise.innerHTML = 'Erro ao processar análise.';
                }
            } catch (e) {
                textoAnalise.innerHTML = 'Erro de conexão com o servidor.';
            }
        }
    });
});

document.getElementById('btn-upgrade').addEventListener('click', () => {
    alert('👑 PLANO VIP (R$ 14,90 / mês)\n\n• 60 análises no 1º mês\n• 100 análises na renovação!');
});
