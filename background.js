// Ouvinte de mensagens da extensão
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  // Ação de Login com Google
  if (request.action === "login") {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError || !token) {
        console.error("Erro de Identidade:", chrome.runtime.lastError);
        sendResponse({ success: false, error: "Não foi possível obter o token de acesso." });
        return;
      }
      
      // Busca os dados básicos do perfil do usuário (Nome, Foto, Email)
      fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
        .then(res => res.json())
        .then(user => {
          sendResponse({ success: true, user: user });
        })
        .catch(err => {
          console.error("Erro ao buscar perfil:", err);
          sendResponse({ success: false, error: "Erro ao conectar com a API do Google." });
        });
    });
    return true; // Mantém o canal aberto para resposta assíncrona
  }
});
