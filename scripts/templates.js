function getSmallCardHTML(index, id, name, img, typeClass, typesHTML) {
    return `
    <div class="pokemon-card ${typeClass}" onclick="openOverlay(${index})">
        <div class="card-header">
            <h3>${name}</h3>
            <span>#${id}</span>
        </div>
        <img src="${img}" alt="${name}">
        <div class="type-container">
            ${typesHTML}
        </div>
    </div>
    `;
}

function getTypeBadgeHTML(typeName) {
    return `<span class="type-badge badge-${typeName}">${typeName}</span>`;
}

function getLargeCardHTML(index, name, img, bgClass) {
    return `
    <div class="large-card ${bgClass}" onclick="event.stopPropagation()">
        <div class="large-card-header">
            <button class="close-btn" onclick="closeOverlay()">X</button>
            <h2>${name}</h2>
        </div>
        <div class="large-card-image">
            <button class="nav-btn prev" onclick="prevPokemon(${index})">&lt;</button>
            <img src="${img}" alt="${name}">
            <button class="nav-btn next" onclick="nextPokemon(${index})">&gt;</button>
        </div>
        <div class="large-card-tabs">
            <button onclick="renderMainTab(${index})">Main</button>
            <button onclick="renderStatsTab(${index})">Stats</button>
            <button onclick="renderEvoTab(${index})">Evo Chain</button>
        </div>
        <div id="overlay_content"></div>
    </div>
    `;
}

function getStatsTabHTML(statsHTML) {
    return `
    <div class="stats-tab">
        ${statsHTML}
    </div>
    `;
}

function getMainTabHTML(height, weight, baseExp) {
    return `
    <div class="main-tab">
        <p><strong>Height:</strong> ${height}</p>
        <p><strong>Weight:</strong> ${weight}</p>
        <p><strong>Base Exp:</strong> ${baseExp}</p>
    </div>
    `;
}

function getEvoChainHTML(evoArray) {
    if (!evoArray || evoArray.length === 0) {
        return `<div class="evo-tab"><p>No evolution chain available.</p></div>`;
    }

    let html = `<div class="evo-tab"><div class="evo-chain-container">`;
    for (let i = 0; i < evoArray.length; i++) {
        html += `
            <div class="evo-item">
                <img src="${evoArray[i].img}" alt="${evoArray[i].name}">
                <span>${evoArray[i].name}</span>
            </div>
        `;
        if (i < evoArray.length - 1) {
            html += `<div class="evo-arrow">&raquo;</div>`;
        }
    }
    html += `</div></div>`;
    return html;
}
