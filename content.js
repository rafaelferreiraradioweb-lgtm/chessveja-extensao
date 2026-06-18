const sidebar = document.createElement('div');
sidebar.id = 'chessveja-sidebar';
sidebar.innerHTML = `
    <div id="chessveja-header"><h3>Chessveja AI</h3></div>
    <div id="chessveja-content">
        <p>Clique abaixo para analisar:</p>
        <button id="btn-analisar">Analisar Partida</button>
        <div id="resultado"></div>
    </div>
`;

function injetarSidebar() {
    const roundApp = document.querySelector('.round__app');
    if (roundApp && !document.getElementById('chessveja-sidebar')) {
        roundApp.appendChild(sidebar);
    }
}

// Observa o site para garantir que a sidebar apareça
const observer = new MutationObserver(injetarSidebar);
observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-analisar') {
        document.getElementById('resultado').innerText = "Analisando...";
        // Aqui você chamará a lógica da sua API
    }
});
