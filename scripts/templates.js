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
