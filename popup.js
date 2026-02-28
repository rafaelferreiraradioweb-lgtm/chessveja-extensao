document.getElementById('btn-analisar').addEventListener('click', () => {
    const divResultado = document.getElementById('resultado');
    const textoAnalise = document.getElementById('texto-analise');
    
    divResultado.style.display = 'block';
    textoAnalise.innerHTML = 'Mestre Chessveja lendo os lances... ⏳';

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
                    // Exibe a análise rápida + Chamada para o WhatsApp
                    textoAnalise.innerHTML = `
                        <div style="margin-bottom: 15px;">${data.resultado.replace(/\n/g, '<br>')}</div>
                        <hr style="border: 0; border-top: 1px solid #444;">
                        <p style="font-weight: bold; color: #ffcc00; margin-top: 10px;">
                            🚀 Quer uma análise robusta com teoria e planos avançados?
                        </p>
                        <a href="https://wa.me/5582996535079" target="_blank" style="display: block; background: #25d366; color: white; text-align: center; padding: 10px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                            CHAMAR NO WHATSAPP
                        </a>
                    `;
                } else {
                    textoAnalise.innerHTML = 'Erro ao carregar lances.';
                }
            } catch (e) {
                textoAnalise.innerHTML = 'Erro de conexão.';
            }
        }
    });
});
