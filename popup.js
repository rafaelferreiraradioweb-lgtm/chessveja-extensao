document.getElementById('btn-analisar').addEventListener('click', () => {
    const divResultado = document.getElementById('resultado');
    const textoAnalise = document.getElementById('texto-analise');
    const spanGenial = document.getElementById('qtd-genial');
    const spanCapivarada = document.getElementById('qtd-capivarada'); // ID do HTML permanece o mesmo, mas o rótulo muda
    
    divResultado.style.display = 'block';
    textoAnalise.innerHTML = 'O mestre Chessveja está analisando sua partida... ⏳';
    spanGenial.innerText = '-';
    spanCapivarada.innerText = '-';

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

                    // Pesca os números e as seções (atualizado para CAPIVARADAS)
                    const geniais = texto.match(/GENIAIS:\s*(\d+)/i);
                    const capivaradas = texto.match(/CAPIVARADAS:\s*(\d+)/i);
                    
                    // Pega tudo que vem depois de "CAPIVARADAS: X"
                    const analiseCompleta = texto.split(/CAPIVARADAS:\s*\d+/i)[1] || texto;

                    spanGenial.innerText = geniais ? geniais[1] : '0';
                    spanCapivara.innerText = capivaradas ? capivaradas[1] : '0';
                    
                    // Exibe a análise com formatação bonita
                    textoAnalise.innerHTML = analiseCompleta
                        .trim()
                        .replace(/\n/g, '<br>')
                        .replace(/(TEORIA E ABERTURA:|ANÁLISE LANCE A LANCE:|PLANOS ESTRATÉGICOS:|CONCLUSÃO:)/g, '<strong>$1</strong>');

                } else {
                    textoAnalise.innerHTML = 'Erro na análise.';
                }
            } catch (e) {
                textoAnalise.innerHTML = 'Erro de conexão com o servidor.';
            }
        }
    });
});
