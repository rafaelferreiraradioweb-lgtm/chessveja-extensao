chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "login") {
    // Tenta obter o token de forma interativa
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        console.error("Erro de Identidade:", chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      
      // Busca os dados do usuário
      fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
        .then(res => res.json())
        .then(user => {
          sendResponse({ success: true, user: user });
        })
        .catch(err => {
          sendResponse({ success: false, error: "Erro ao conectar com Google API" });
        });
    });
    return true; 
  }
});
