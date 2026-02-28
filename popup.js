// 1. Configuração do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAKD4gb70dBxNjUjYNiKp5Mj2A0wO0yFyE",
  authDomain: "chessveja-extensao.firebaseapp.com",
  projectId: "chessveja-extensao",
  appId: "1:165782355017:web:a939fe873a05e622349398"
};

let usuarioLogado = null;
const API_URL = 'https://chessveja-api.vercel.app/api';

// 2. Lógica ao abrir a extensão: Verificar se já está logado e ver o limite
document.addEventListener('DOMContentLoaded', () => {
    verificarLimite();
});

// 3. Botão de Login com o Google
document.getElementById('btn-login').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "login" }, (response) => {
        if (response && response.success) {
            usuarioLogado = response.user;
            document.getElementById('btn-login').style.display = 'none';
            document.getElementById('user-info').style.display = 'block';
            document.getElementById('user-info').innerText = `Olá, ${usuarioLogado.given_name}! 👋`;
            verificarLimite();
        } else {
            alert("Erro ao entrar com o Google. Verifique sua conexão.");
        }
    });
});

// 4. Função que controla o "Cadeado" de 3 análises
async function verificarLimite() {
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

// 5. Botão de Analisar Partida
document.getElementById('btn-analisar').addEventListener('click', () => {
    if (!usuarioLogado) {
        alert("Por favor, clique em 'Entrar com Google' para começar!");
        return;
    }

    const divResultado = document.getElementById('resultado');
    const textoAnalise = document.getElementById('texto-analise');
    const spanGenial = document.getElementById('qtd-genial');
    const spanCapivara = document.getElementById('qtd-capivarda');
    
    divResultado.style.display = 'block';
    textoAnalise.innerHTML = 'Mestre Chessveja analisando seus lances... ⏳';
    spanGenial.innerText = '-';
    spanCapivara.innerText = '-';

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
                    
                    spanGenial.innerText = geniais ? geniais[1] : '0';
                    spanCapivara.innerText = capivaras ? capivaras[1] : '0';

                    // Limpa o texto da IA e adiciona o botão do WhatsApp
                    const analiseLimpa = texto.replace(/GENIAIS: \d+/i, '').replace(/CAPIVARAS: \d+/i, '').trim();
                    
                    textoAnalise.innerHTML = `
                        <div style="margin-bottom: 15px;">${analiseLimpa.replace(/\n/g, '<br>')}</div>
                        <hr style="border: 0; border-top: 1px solid #444;">
                        <p style="font-weight: bold; color: #ffcc00; margin-top: 10px;">🚀 Quer uma análise robusta com teoria e planos avançados?</p>
                        <a href="https://wa.me/5582996535079" target="_blank" style="display: block; background: #25d366; color: white; text-align: center; padding: 10px; border-radius: 5px; text-decoration: none; font-weight: bold;">CHAMAR NO WHATSAPP</a>
                    `;

                    // 6. Registra o uso no banco de dados local
                    chrome.storage.local.get(['analises_hoje', 'data_ultimo_uso'], (result) => {
                        const hoje = new Date().toLocaleDateString();
                        let novaContagem = (result.data_ultimo_uso === hoje) ? result.analises_hoje + 1 : 1;
                        chrome.storage.local.set({ analises_hoje: novaContagem, data_ultimo_uso: hoje }, () => {
                            verificarLimite();
                        });
                    });

                } else {
                    textoAnalise.innerHTML = 'Erro na análise da IA.';
                }
            } catch (e) {
                textoAnalise.innerHTML = 'Erro de conexão com o servidor Chessveja.';
            }
        } else {
            textoAnalise.innerHTML = 'Nenhuma partida encontrada no Lichess.';
        }
    });
});

// Botões Extras
document.getElementById('btn-upgrade').addEventListener('click', () => {
    alert('👑 PLANO VIP (R$ 14,90 / mês)\n\n• Análises ilimitadas\n• Relatórios em PDF\n• Suporte prioritário via WhatsApp!');
});

document.getElementById('btn-exportar').addEventListener('click', () => {
    alert('Função de exportar imagem disponível na versão final da Web Store!');
});
