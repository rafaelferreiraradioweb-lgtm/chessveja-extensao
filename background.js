chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "login") {
    // Tenta pegar o token do Google de forma interativa
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError || !token) {
        sendResponse({ success: false, error: chrome.runtime.lastError });
        return;
      }
      
      // Com o token, buscamos o nome e e-mail do usuário
      fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
        .then(res => res.json())
        .then(user => {
          sendResponse({ success: true, user: user });
        })
        .catch(err => sendResponse({ success: false, error: err }));
    });
    return true; // Mantém o canal de resposta aberto
  }
});
