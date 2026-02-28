document.getElementById('btn-analisar').addEventListener('click', () => {
    const divResultado = document.getElementById('resultado');
    const textoAnalise = document.getElementById('texto-analise');
    const spanGenial = document.getElementById('qtd-genial');
    const spanCapivara = document.getElementById('qtd-capivarda');
    
    divResultado.style.display = 'block';
    textoAnalise.innerHTML = 'Mestre Chessveja localizando erros... ⏳';
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
                    
                    // Pega o conteúdo após a contagem de capivaras
                    const analiseCompleta = texto.split(/CAPIVARAS:\s*\d+/i)[1] || texto;

                    spanGenial.innerText = geniais ? geniais[1] : '0';
                    spanCapivarda.innerText = capivaras ? capivaras[1] : '0';
                    
                    // Formatação bonita dos títulos
                    textoAnalise.innerHTML = analiseCompleta
                        .trim()
                        .replace(/\n/g, '<br>')
                        .replace(/(3 PIORES LANCES:|PLANOS GERAIS:)/g, '<strong>$1</strong>');

                    document.getElementById('contador-analises').innerText = "2/3";

                } else {
                    textoAnalise.innerHTML = 'Erro na resposta do servidor.';
                }
            } catch (e) {
                textoAnalise.innerHTML = 'Erro de conexão.';
            }
        }
    });
});
