document.getElementById('btn-analisar').addEventListener('click', () => {
    const divResultado = document.getElementById('resultado');
    const textoAnalise = document.getElementById('texto-analise');
    
    divResultado.style.display = 'block';
    textoAnalise.innerHTML = 'Buscando partida no Lichess... ⏳';

    // Pede ao background para checar se temos um PGN salvo
    chrome.runtime.sendMessage({ action: "obterPGN" }, (response) => {
        if (response && response.pgn) {
            textoAnalise.innerHTML = '<span style="color: #4CAF50;">Partida encontrada!</span><br><br>Em breve, a IA do Chessveja fará a leitura detalhada aqui.';
            // Exemplo visual do termômetro
            document.getElementById('qtd-genial').innerText = '1';
            document.getElementById('qtd-capivarda').innerText = '2';
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
