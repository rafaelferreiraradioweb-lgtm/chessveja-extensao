const btnChessveja = document.createElement('button');
btnChessveja.innerText = '♟️ Analisar com IA do Chessveja';

btnChessveja.style.position = 'fixed';
btnChessveja.style.bottom = '30px';
btnChessveja.style.right = '30px';
btnChessveja.style.zIndex = '999999';
btnChessveja.style.padding = '12px 24px';
btnChessveja.style.backgroundColor = '#4CAF50';
btnChessveja.style.color = '#ffffff';
btnChessveja.style.border = '2px solid #2e7d32';
btnChessveja.style.borderRadius = '8px';
btnChessveja.style.fontWeight = 'bold';
btnChessveja.style.fontSize = '16px';
btnChessveja.style.cursor = 'pointer';
btnChessveja.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';

document.body.appendChild(btnChessveja);

function obterIdDaPartida() {
    const partes = window.location.pathname.split('/');
    if (partes[1] && partes[1].length >= 8) {
        return partes[1].substring(0, 8); 
    }
    return null;
}

btnChessveja.addEventListener('click', async () => {
    const gameId = obterIdDaPartida();
    
    if (!gameId) {
        alert('⚠️ Chessveja: Entre em uma partida finalizada para analisar.');
        return;
    }

    btnChessveja.innerText = '⏳ Baixando PGN...';
    
    try {
        const resposta = await fetch(`https://lichess.org/game/export/${gameId}`);
        if (!resposta.ok) throw new Error('Falha ao baixar PGN');
        
        const pgnText = await resposta.text();
        
        chrome.runtime.sendMessage({ action: "salvarPGN", pgn: pgnText }, (response) => {
            btnChessveja.innerText = '♟️ Analisar com IA do Chessveja';
            alert('✅ Partida capturada! Clique no ícone da extensão do Chessveja no topo do navegador para ver o resultado.');
        });
    } catch (erro) {
        btnChessveja.innerText = '♟️ Analisar com IA do Chessveja';
        alert('❌ Erro ao capturar a partida.');
    }
});
