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
        await fetchAllDetails(data.results);
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
        const details = await fetchDetails(results[i].url);
        if (details) {
            loadedPokemon.push(details);
        }
    }
}

async function fetchDetails(url) {
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
