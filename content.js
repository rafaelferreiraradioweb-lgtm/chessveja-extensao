// Escuta os pedidos do painel lateral e devolve a URL atual da partida
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.acao === "obterURL") {
        sendResponse({ url: window.location.href });
    }
});
