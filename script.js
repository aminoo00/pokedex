let loadedPokemon = [];
let currentOffset = 0;
const limit = 20;
let isLoading = false;

async function loadPokemon() {
    if (isLoading) return;
    setLoadingState(true);
    try {
        const url = `https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();
        const startIndex = loadedPokemon.length;
        await fetchAllDetails(data.results);
        renderList(startIndex);
        currentOffset += limit;
    } catch (error) {
        console.error("Error loading pokemon list", error);
    }
    setLoadingState(false);
}

function setLoadingState(loading) {
    isLoading = loading;
    const btn = document.getElementById('load-more');
    if (btn) btn.disabled = loading;
}

async function fetchAllDetails(results) {
    for (let i = 0; i < results.length; i++) {
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
        stats: data.stats
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

