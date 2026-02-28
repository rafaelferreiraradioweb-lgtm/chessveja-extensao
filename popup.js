document.getElementById('btn-analisar').addEventListener('click', () => {
    const divResultado = document.getElementById('resultado');
    const textoAnalise = document.getElementById('texto-analise');
    const spanGenial = document.getElementById('qtd-genial');
    const spanCapivarda = document.getElementById('qtd-capivarda');
    const contador = document.getElementById('contador-analises');
    
    divResultado.style.display = 'block';
    textoAnalise.innerHTML = 'Conectando ao servidor seguro do Chessveja... ⏳<br><br>Isso leva alguns segundos.';
    spanGenial.innerText = '-';
    spanCapivarda.innerText = '-';

    chrome.runtime.sendMessage({ action: "obterPGN" }, async (response) => {
        if (response && response.pgn) {
            const pgn = response.pgn;

            try {
                // ======== CONEXÃO COM SEU SERVIDOR SEGURO NA VERCEL ========
                // Link OFICIAL e permanente do seu servidor
                const API_URL = 'https://chessveja-api.vercel.app/api';
                
                const iaResponse = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ pgn: pgn })
                });

                const data = await iaResponse.json();

                if (data.resultado) {
                    const respostaTexto = data.resultado;

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

                    contador.innerText = "2/3";

                } else {
                    textoAnalise.innerHTML = '<span style="color: #ff4444;">' + (data.erro || 'Erro ao analisar a partida.') + '</span>';
                }

            } catch (error) {
                textoAnalise.innerHTML = '<span style="color: #ff4444;">Erro de conexão com o servidor do Chessveja. O link ou as permissões foram bloqueadas.</span>';
            }

        } else {
            textoAnalise.innerHTML = '<span style="color: #ff4444;">Nenhuma partida encontrada. Abra uma partida finalizada no Lichess e clique no botão verde na tela.</span>';
        }
    });
});

document.getElementById('btn-upgrade').addEventListener('click', () => {
    alert('👑 PLANO VIP (R$ 14,90 / mês)\n\n• 1º Mês: 60 análises (sem limite diário)\n• Recompensa de Fidelidade: A partir da 2ª assinatura, recebe 100 análises por mês pelo mesmo valor!\n\n(O sistema de pagamento do Mercado Pago será ativado na Fase 2)');
});

document.getElementById('btn-exportar').addEventListener('click', () => {
    alert('Em breve: Gerando imagem bonita para postar no Instagram!');
});
