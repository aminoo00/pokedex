let allPokemonList = [];
let loadedPokemon = [];
let searchResults = [];
let currentOffset = 0;
const limit = 20;
let isLoading = false;
let paginatedCount = 0;

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
        paginatedCount = loadedPokemon.length;
        renderList(startIndex);
        currentOffset += limit;
    } catch (e) {
        console.error("Error", e);
    }
}

function setLoadingState(loading) {
    isLoading = loading;
    if (loading) showLoadingState();
    else hideLoadingState();
}

function showLoadingState() {
    const btn = document.getElementById('load-more');
    const globalOverlay = document.getElementById('global-loading-overlay');
    const inlineSpinner = document.getElementById('loading-spinner');
    // determine if this is the initial load
    const isInitialLoad = loadedPokemon.length === 0;

    if (isInitialLoad && globalOverlay) {
        globalOverlay.classList.remove('d_none');
    } else {
        if (btn) btn.style.display = 'none';
        if (inlineSpinner) inlineSpinner.classList.remove('d_none');
    }
}

function hideLoadingState() {
    const btn = document.getElementById('load-more');
    const globalOverlay = document.getElementById('global-loading-overlay');
    const inlineSpinner = document.getElementById('loading-spinner');
    if (globalOverlay) globalOverlay.classList.add('d_none');
    if (inlineSpinner) inlineSpinner.classList.add('d_none');
    if (btn) btn.style.display = 'block';
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
    const hidePrev = index === 0;
    const hideNext = index + 1 >= loadedPokemon.length;
    overlay.innerHTML = getLargeCardHTML(index, name, pokemon.image, bgClass, hidePrev, hideNext);
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
        const chainData = await fetchChainData(name);
        const evoNames = parseEvoChainNames(chainData);
        return await fetchEvoDetails(evoNames);
    } catch (e) { return null; }
}

async function fetchChainData(name) {
    const sRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
    const sData = await sRes.json();
    const eRes = await fetch(sData.evolution_chain.url);
    const eData = await eRes.json();
    return eData.chain;
}

async function fetchEvoDetails(evoNames) {
    const evoDetails = [];
    for (let i = 0; i < evoNames.length; i++) {
        const pRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoNames[i].toLowerCase()}`);
        const pData = await pRes.json();
        evoDetails.push({
            name: capitalizeFirstLetter(pData.name),
            img: pData.sprites.other['official-artwork'].front_default
        });
    }
    return evoDetails;
}

function parseEvoChainNames(chain) {
    let evoNodes = [];
    evoNodes.push(chain.species.name);
    if (chain.evolves_to.length > 0) {
        evoNodes.push(chain.evolves_to[0].species.name);
        if (chain.evolves_to[0].evolves_to.length > 0) {
            evoNodes.push(chain.evolves_to[0].evolves_to[0].species.name);
        }
    }
    return evoNodes;
}

function getStatsHTML(stats) {
    let html = '';
    for (let i = 0; i < stats.length; i++) {
        html += `<p><strong>${stats[i].stat.name}:</strong> ${stats[i].base_stat}</p>`;
    }
    return html;
}

async function searchPokemon() {
    const inputEl = document.querySelector('header input');
    if (!inputEl) return;
    const input = inputEl.value.trim().toLowerCase();
    if (input.length > 0 && input.length < 3) return;
    handleSearchState(input);
}

async function handleSearchState(input) {
    const container = document.getElementById('pokedex_list');
    const loadBtn = document.getElementById('load-more') || document.querySelector('main > button');
    container.innerHTML = '';

    if (input.length === 0) {
        loadedPokemon.length = paginatedCount;
        searchResults = [];
        if (loadBtn) loadBtn.style.display = 'block';
        return renderList(0);
    }
    if (loadBtn) loadBtn.style.display = 'none';
    await initGlobalSearch(input, container);
}

async function initGlobalSearch(input, container) {
    setLoadingState(true);
    if (allPokemonList.length === 0) {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const data = await res.json();
        allPokemonList = data.results;
    }
    const matches = getGlobalMatches(input);
    if (matches.length === 0) container.innerHTML = "<p>No match found.</p>";
    else await renderGlobalMatches(matches, container);
    setLoadingState(false);
}

function getGlobalMatches(input) {
    const matches = [];
    for (let i = 0; i < allPokemonList.length; i++) {
        if (allPokemonList[i].name.includes(input)) {
            matches.push(allPokemonList[i]);
        }
    }
    return matches;
}

async function renderGlobalMatches(matches, container) {
    searchResults = [];
    const max = matches.length > 20 ? 20 : matches.length;
    for (let i = 0; i < max; i++) {
        await new Promise(r => setTimeout(r, 50));
        const p = await fetchPokemonDetails(matches[i].url);
        if (p) {
            searchResults.push(p);
            const searchIdx = paginatedCount + searchResults.length - 1;
            loadedPokemon[searchIdx] = p;
            const typeClass = `bg-${p.types[0].type.name}`;
            container.innerHTML += getSmallCardHTML(searchIdx, p.id, capitalizeFirstLetter(p.name), p.image, typeClass, getTypesHTML(p.types));
        }
    }
}

loadPokemon();
