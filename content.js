chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getGameInfo") {
        const urlMatch = window.location.pathname.match(/^\/([a-zA-Z0-9]{8})/);
        if (urlMatch) {
            sendResponse({ success: true, gameId: urlMatch[1] });
        } else {
            sendResponse({ success: false, error: "Abra uma partida no Lichess." });
        }
    }
});
