let pgnSalvo = "";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "salvarPGN") {
        pgnSalvo = request.pgn;
        sendResponse({ sucesso: true });
    } else if (request.action === "obterPGN") {
        sendResponse({ pgn: pgnSalvo });
    }
    return true; 
});
