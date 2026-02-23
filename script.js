let loadedPokemon = [];
let currentOffset = 0;
const limit = 20;
let isLoading = false;

async function loadPokemon() {
    if (isLoading) return;
    setLoadingState(true);
    await fetchAndRenderData();
    setLoadingState(false);
}

async function fetchAndRenderData() {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();
        const startIndex = loadedPokemon.length;
        await fetchAllDetails(data.results);
        renderList(startIndex);
        currentOffset += limit;
    } catch (e) {
        console.error("Error", e);
    }
}

function setLoadingState(loading) {
    isLoading = loading;
    const btn = document.getElementById('load-more');
    if (btn) btn.disabled = loading;
}

async function fetchAllDetails(results) {
    for (let i = 0; i < results.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        const details = await fetchPokemonDetails(results[i].url);
        if (details) {
            loadedPokemon.push(details);
        }
    }
}

async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return extractData(data);
    } catch (error) {
        console.error("Error fetching detail", error);
        return null;
    }
}

function extractData(data) {
    return {
        id: data.id,
        name: data.name,
        image: data.sprites.other['official-artwork'].front_default,
        types: data.types,
        height: data.height,
        weight: data.weight,
        stats: data.stats,
        baseExp: data.base_experience
    };
}

function renderList(newPokemonStartIndex) {
    const container = document.getElementById('pokedex_list');
    for (let i = newPokemonStartIndex; i < loadedPokemon.length; i++) {
        const pokemon = loadedPokemon[i];
        const name = capitalizeFirstLetter(pokemon.name);
        const typesHTML = getTypesHTML(pokemon.types);
        const typeClass = `bg-${pokemon.types[0].type.name}`;
        container.innerHTML += getSmallCardHTML(
            i, pokemon.id, name, pokemon.image, typeClass, typesHTML
        );
    }
}

function getTypesHTML(types) {
    let html = '';
    for (let i = 0; i < types.length; i++) {
        html += getTypeBadgeHTML(types[i].type.name);
    }
    return html;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function openOverlay(index) {
    const pokemon = loadedPokemon[index];
    const name = capitalizeFirstLetter(pokemon.name);
    const bgClass = `bg-${pokemon.types[0].type.name}`;
    const overlay = document.getElementById('overlay');
    overlay.innerHTML = getLargeCardHTML(index, name, pokemon.image, bgClass);
    overlay.classList.remove('d_none');
    document.body.classList.add('no_scroll');
    renderMainTab(index);
}

function closeOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.add('d_none');
    document.body.classList.remove('no_scroll');
}

function nextPokemon(index) {
    if (index + 1 < loadedPokemon.length) {
        openOverlay(index + 1);
    }
}

function prevPokemon(index) {
    if (index - 1 >= 0) {
        openOverlay(index - 1);
    }
}

function renderMainTab(index) {
    const pokemon = loadedPokemon[index];
    const content = document.getElementById('overlay_content');
    content.innerHTML = getMainTabHTML(pokemon.height, pokemon.weight, pokemon.baseExp);
}

function renderStatsTab(index) {
    const pokemon = loadedPokemon[index];
    const content = document.getElementById('overlay_content');
    content.innerHTML = getStatsTabHTML(getStatsHTML(pokemon.stats));
}

async function renderEvoTab(index) {
    const pokemon = loadedPokemon[index];
    const content = document.getElementById('overlay_content');
    content.innerHTML = "<p>Loading...</p>";
    if (!pokemon.evoChain) {
        pokemon.evoChain = await fetchEvoChain(pokemon.name);
    }
    content.innerHTML = getEvoChainHTML(pokemon.evoChain);
}

async function fetchEvoChain(name) {
    try {
        const sRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
        const sData = await sRes.json();
        const eRes = await fetch(sData.evolution_chain.url);
        const eData = await eRes.json();
        return parseEvoChain(eData.chain);
    } catch (e) { return "Error loading evolution"; }
}

function parseEvoChain(chain) {
    let evoStr = capitalizeFirstLetter(chain.species.name);
    if (chain.evolves_to.length > 0) {
        evoStr += getNextEvo(chain.evolves_to[0]);
    }
    return evoStr;
}

function getNextEvo(evoNode) {
    let str = " -> " + capitalizeFirstLetter(evoNode.species.name);
    if (evoNode.evolves_to.length > 0) {
        str += " -> " + capitalizeFirstLetter(evoNode.evolves_to[0].species.name);
    }
    return str;
}

function getStatsHTML(stats) {
    let html = '';
    for (let i = 0; i < stats.length; i++) {
        html += `<p><strong>${stats[i].stat.name}:</strong> ${stats[i].base_stat}</p>`;
    }
    return html;
}

function searchPokemon() {
    const input = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('pokedex_list');
    if (input.length > 0 && input.length < 3) return;
    container.innerHTML = '';
    if (input.length === 0) return renderList(0);
    fetchAndRenderSingleSearch(input, container);
}

async function fetchAndRenderSingleSearch(input, container) {
    setLoadingState(true);
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${input}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        const p = extractData(data);
        loadedPokemon.push(p);
        const idx = loadedPokemon.length - 1;
        const typeClass = `bg-${p.types[0].type.name}`;
        container.innerHTML = getSmallCardHTML(
            idx, p.id, capitalizeFirstLetter(p.name), p.image, typeClass, getTypesHTML(p.types)
        );
    } catch (e) {
        container.innerHTML = "<p>No Pokémon found</p>";
    }
    setLoadingState(false);
}

loadPokemon();
