// --- ESTADO DE DATOS (POOLS) ---
const DEFAULT_CATEGORIES = ["Países", "Comida", "Películas", "Animales", "Famosos", "Lugares"];
const wordPools = {}; 
// Inicializar pools vacíos para categorías por defecto
DEFAULT_CATEGORIES.forEach(cat => wordPools[cat] = []);

let totalPlayers = 5;
let currentPlayer = 0;
let impostorIndex = 0;
let secretWord = "";
let selectedCategory = "";
let timerInterval = null;
let timeLeft = 300;

const EAK = "JTwWCTxOc1RJLC8jI15QRyIzD1xaBHN4FTsIIF1QAgcdA0E/XHsD"; 
const PASSPHRASE = "dulho777"; 



// --- UTILIDAD DE LIMPIEZA ---
function cleanWord(word) {
    // Elimina cualquier cosa entre paréntesis y espacios extra
    return word.replace(/\s*\(.*?\)\s*/g, '').trim();
}


async function fetchGemini(prompt) {
    let apiKey = EAK.trim();

    apiKey = decrypt(apiKey, PASSPHRASE);

    try {
        console.log("Conectando con Gemini..."); 

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            console.error(`Error API: ${response.status}`);
            if (response.status === 400) alert("Error 400: API Key inválida.");
            if (response.status === 404) alert("Error 404: Servicio no encontrado.");
            return null;
        }

        const data = await response.json();

        if (!data.candidates?.[0]?.content) {
            console.error("Respuesta vacía:", data);
            return null;
        }

        const text = data.candidates[0].content.parts[0].text;
        
        // Buscar JSON válido ignorando texto introductorio
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        
        if (!jsonMatch) {
             console.error("No se encontró JSON válido en la respuesta.");
             return null;
        }

        return JSON.parse(jsonMatch[0]);

    } catch (error) {
        console.error("Error en fetchGemini:", error);
        return null;
    }
}

function decrypt(encryptedBase64, secret) {
    try {
        const text = atob(encryptedBase64);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
        }
        return result.trim();
    } catch (e) {
        console.error("Fallo en desencriptación:", e);
        return "";
    }
}

// --- GESTIÓN DE DATOS ---

// -- Initial Load --
async function initialLoad() {
    if (EAK.includes("PEGA_TU")) return;

    // Prompt ajustado: Sin "Aleatorio" mezclado, y exigiendo limpieza
    const prompt = `
        Genera un objeto JSON estricto donde las claves sean: ${DEFAULT_CATEGORIES.join(", ")}.
        Para cada clave, el valor debe ser un array de 20 strings.
        REGLAS CRÍTICAS:
        1. Devuelve NOMBRES ESPECÍFICOS (ej: "Tokio", no "Capital").
        2. NO incluyas explicaciones ni paréntesis (ej: MAL: "China (País)", BIEN: "China").
        3. Responde SOLO con el JSON.
    `;

    const data = await fetchGemini(prompt);
    
    if (data) {
        Object.keys(data).forEach(key => {
            // Aseguramos limpieza extra al recibir los datos
            if (wordPools[key] !== undefined && Array.isArray(data[key])) {
                const cleanedWords = data[key].map(cleanWord);
                wordPools[key].push(...cleanedWords);
            }
        });
        
        document.getElementById('loading-overlay').classList.add('hidden-screen');
        showScreen('screen-menu');
        renderCategories();
    } else {
        const loadingText = document.getElementById('loading-text');
        if(loadingText) {
            loadingText.innerText = "Error de conexión con IA.";
            loadingText.classList.add('text-red-500', 'font-bold');
        }
    }
}

// 2. Recarga Inteligente
async function refillCategory(category) {
    console.log(`Recargando: ${category}...`);
    const prompt = `
        Genera un array JSON de 20 palabras nuevas para la categoría "${category}".
        REGLAS: Nombres específicos, SIN paréntesis, SIN explicaciones. Solo el array JSON.
    `;
    const newWords = await fetchGemini(prompt);
    
    if (newWords && Array.isArray(newWords)) {
        if (!wordPools[category]) wordPools[category] = [];
        wordPools[category].push(...newWords.map(cleanWord));
        console.log(`Recarga OK. Total ${category}: ${wordPools[category].length}`);
    }
}

// 3. Crear Categoría Custom
async function handleCustomCategory() {
    const topic = document.getElementById('custom-topic').value.trim();
    if (!topic) return;

    document.getElementById('loading-overlay').classList.remove('hidden-screen');
    document.getElementById('loading-text').innerText = `Creando: ${topic}...`;

    // Prompt ajustado para especificidad
    const prompt = `
        Genera un array JSON de 20 elementos para la categoría "${topic}".
        REGLAS:
        1. Sé ESPECÍFICO: Si es "Marvel", dame "Iron Man", no "Superhéroe". Si es "Marcas", dame "Nike", no "Zapatilla".
        2. NO uses paréntesis ni descripciones.
        3. Solo devuelve el JSON.
    `;
    const words = await fetchGemini(prompt);

    if (words && Array.isArray(words)) {
        wordPools[topic] = words.map(cleanWord);
        startGame(topic); // Inicia directamente con la nueva categoría
    } else {
        alert("Error al generar categoría.");
        showScreen('screen-menu');
    }
    document.getElementById('loading-overlay').classList.add('hidden-screen');
}

// --- LOGICA DEL JUEGO ---

async function getWordAndMaintainPool(category) {
    // Asegurar que el pool existe
    if (!wordPools[category]) wordPools[category] = [];
    
    // Recarga preventiva
    if (wordPools[category].length < 5) {
        refillCategory(category); 
    }

    // Recarga obligatoria si está vacío
    if (wordPools[category].length === 0) {
        document.getElementById('loading-overlay').classList.remove('hidden-screen');
        document.getElementById('loading-text').innerText = "Recargando palabras...";
        await refillCategory(category);
        document.getElementById('loading-overlay').classList.add('hidden-screen');
    }

    if (wordPools[category].length === 0) {
        alert("No hay palabras disponibles.");
        return "Error";
    }

    const randomIndex = Math.floor(Math.random() * wordPools[category].length);
    const word = wordPools[category].splice(randomIndex, 1)[0];
    return word;
}

async function startGame(categoryInput) {
    let targetCategory = categoryInput;

    // Lógica para "Aleatorio": Elige una de las categorías por defecto existentes
    if (targetCategory === 'Aleatorio') {
        const randomIndex = Math.floor(Math.random() * DEFAULT_CATEGORIES.length);
        targetCategory = DEFAULT_CATEGORIES[randomIndex];
    }

    selectedCategory = targetCategory;
    secretWord = await getWordAndMaintainPool(targetCategory); 
    if (secretWord === "Error") return;

    impostorIndex = Math.floor(Math.random() * totalPlayers);
    currentPlayer = 0;

    document.getElementById('turn-player-name').innerText = `Jugador 1`;
    showScreen('screen-turn-start');
}

// --- INTERFAZ & UTILIDADES ---

function init() {
    if (window.lucide) lucide.createIcons();
    initialLoad(); 
}

function showScreen(id) {
    document.querySelectorAll('[id^="screen-"]').forEach(el => el.classList.add('hidden-screen'));
    document.getElementById(id).classList.remove('hidden-screen');
    if (window.lucide) lucide.createIcons();
}

function adjustPlayers(n) {
    totalPlayers = Math.max(3, Math.min(15, totalPlayers + n));
    document.getElementById('player-count-display').innerText = totalPlayers;
}

function renderCategories() {
    const grid = document.getElementById('category-grid');
    grid.innerHTML = '';
    // Solo mostramos las categorías por defecto como botones fijos
    DEFAULT_CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = "bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-xl text-sm font-medium border border-transparent hover:border-purple-500/50 transition-all";
        btn.innerText = cat;
        btn.onclick = () => startGame(cat);
        grid.appendChild(btn);
    });
}

function showCustomInput() {
    showScreen('screen-custom');
}

// --- FLUJO DE TURNOS ---
function showRole() {
    const isImp = currentPlayer === impostorIndex;
    const content = document.getElementById('role-content');
    const card = document.getElementById('role-card');

    card.className = `p-8 rounded-3xl w-full shadow-2xl border relative overflow-hidden transition-colors duration-500 ${isImp ? 'bg-red-950/40 border-red-500/50' : 'bg-gray-800 border-gray-700'}`;

    if (isImp) {
        content.innerHTML = `<i data-lucide="skull" class="text-red-500 w-20 h-20 mb-4 animate-pulse"></i><h1 class="text-4xl font-black text-red-500 uppercase tracking-tighter mb-2">IMPOSTOR</h1><p class="text-red-200 text-sm">Engaña a todos.</p><div class="mt-4 p-2 bg-gray-900 rounded border border-red-500/30 text-xs text-gray-400">Categoría: <span class="text-white font-bold block text-base">${selectedCategory}</span></div>`;
    } else {
        content.innerHTML = `<i data-lucide="check-circle" class="text-green-500 w-20 h-20 mb-4"></i><p class="text-green-400 text-sm uppercase tracking-wider">Palabra Secreta</p><h1 class="text-3xl font-black text-white mt-1 mb-4">${secretWord}</h1><div class="mt-2 text-xs text-gray-500">Categoría: ${selectedCategory}</div>`;
    }

    document.getElementById('next-btn-text').innerText = (currentPlayer < totalPlayers - 1) ? "Ocultar y Pasar" : "Empezar Juego";
    showScreen('screen-reveal');
}

function nextPlayer() {
    if (currentPlayer < totalPlayers - 1) {
        currentPlayer++;
        document.getElementById('turn-player-name').innerText = `Jugador ${currentPlayer + 1}`;
        showScreen('screen-turn-start');
    } else {
        startPlaying();
    }
}

function startPlaying() {
    timeLeft = 300;
    document.getElementById('playing-category').innerText = selectedCategory;
    updateTimer();
    showScreen('screen-playing');
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) clearInterval(timerInterval);
    }, 1000);
}

function updateTimer() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const display = document.getElementById('timer-display');
    display.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    display.className = `text-7xl font-black font-mono tracking-tighter transition-colors ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`;
}

function finishGame() {
    clearInterval(timerInterval);
    document.getElementById('result-impostor').innerText = `Jugador ${impostorIndex + 1}`;
    document.getElementById('result-word').innerText = secretWord;
    showScreen('screen-finished');
}

function resetGame() {
    showScreen('screen-menu');
}

document.addEventListener('DOMContentLoaded', init);