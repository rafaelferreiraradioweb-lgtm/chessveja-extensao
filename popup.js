// CONFIGURAÇÕES DO PROJETO CHESSVEJA
const firebaseConfig = {
  apiKey: "AIzaSyAKD4gb70dBxNjUjYNiKp5Mj2A0wO0yFyE",
  authDomain: "chessveja-extensao.firebaseapp.com",
  projectId: "chessveja-extensao",
  appId: "1:165782355017:web:a939fe873a05e622349398"
};

const API_URL = 'https://chessveja-api.vercel.app/api';
let usuarioLogado = null;

// AO ABRIR A EXTENSÃO
document.addEventListener('DOMContentLoaded', () => {
    verificarLimite();
});

// LOGIN COM GOOGLE
document.getElementById('btn-login').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "login" }, (response) => {
        if (response && response.success) {
            usuarioLogado = response.user;
            document.getElementById('btn-login').style.display = 'none';
            document.getElementById('user-info').style.display = 'block';
            document.getElementById('user-info').innerText = `Olá, ${usuarioLogado.given_name}! 👋`;
            verificarLimite();
        } else {
            alert("Erro ao entrar com o Google. Certifique-se de que você é um usuário de teste no Console Google.");
        }
    });
});

// CONTROLE DO LIMITE DIÁRIO (3 ANÁLISES)
function verificarLimite() {
    chrome.storage.local.get(['analises_hoje', 'data_ultimo_uso'], (result) => {
        const hoje = new Date().toLocaleDateString();
        let contagem = (result.data_ultimo_uso === hoje) ? result.analises_hoje : 0;
        
        const restantes = 3 - contagem;
        document.getElementById('contador-analises').innerText = `${restantes >= 0 ? restantes : 0}/3`;
        
        if (contagem >= 3) {
            const btn = document.getElementById('btn-analisar');
            btn.disabled = true;
            btn.innerText = "Limite diário atingido 🛑";
            btn.style.background = "#444";
        }
    });
}

// BOTÃO ANALISAR
document.getElementById('btn-analisar').addEventListener('click', () => {
    if (!usuarioLogado) {
        alert("Faça login com o Google para analisar!");
        return;
    }

    const textoAnalise = document.getElementById('texto-analise');
    document.getElementById('resultado').style.display = 'block';
    textoAnalise.innerHTML = 'Mestre Chessveja analisando seus lances... ⏳';

    chrome.runtime.sendMessage({ action: "obterPGN" }, async (response) => {
        if (response && response.pgn) {
            try {
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
                    
                    document.getElementById('qtd-genial').innerText = geniais ? geniais[1] : '0';
                    document.getElementById('qtd-capivarda').innerText = capivaras ? capivaras[1] : '0';

                    const analiseLimpa = texto.replace(/GENIAIS: \d+/i, '').replace(/CAPIVARAS: \d+/i, '').trim();
                    
                    textoAnalise.innerHTML = `
                        <div style="margin-bottom: 15px;">${analiseLimpa.replace(/\n/g, '<br>')}</div>
                        <hr style="border-top: 1px solid #444;">
                        <p style="font-weight: bold; color: #ffcc00;">🚀 Quer análise robusta e planos avançados?</p>
                        <a href="https://wa.me/5582996535079" target="_blank" style="display: block; background: #25d366; color: white; text-align: center; padding: 10px; border-radius: 5px; text-decoration: none; font-weight: bold;">CHAMAR NO WHATSAPP</a>
                    `;

                    // CONTABILIZAR USO
                    chrome.storage.local.get(['analises_hoje', 'data_ultimo_uso'], (result) => {
                        const hoje = new Date().toLocaleDateString();
                        let novaContagem = (result.data_ultimo_uso === hoje) ? result.analises_hoje + 1 : 1;
                        chrome.storage.local.set({ analises_hoje: novaContagem, data_ultimo_uso: hoje }, verificarLimite);
                    });
                }
            } catch (e) {
                textoAnalise.innerHTML = 'Erro de conexão.';
            }
        }
    });
});
