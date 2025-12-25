// --- DATOS ---
const GAME_DATA = {
    "Países": ["Argentina", "México", "España", "Brasil", "Japón", "Francia", "Italia", "EEUU", "China", "Egipto", "Alemania", "Australia", "Canadá", "Perú", "Colombia"],
    "Comida": ["Pizza", "Sushi", "Tacos", "Hamburguesa", "Paella", "Asado", "Helado", "Ensalada", "Pollo Frito", "Spaghetti", "Empanadas", "Ceviche", "Hot Dog", "Chocolate", "Queso"],
    "Películas": ["Titanic", "Avatar", "Star Wars", "Harry Potter", "El Padrino", "Avengers", "Jurassic Park", "El Rey León", "Matrix", "Frozen", "Joker", "Coco", "Spiderman", "Batman", "Shrek"],
    "Famosos": ["Lionel Messi", "Shakira", "Cristiano Ronaldo", "Michael Jackson", "Brad Pitt", "Taylor Swift", "The Rock", "Elon Musk", "Will Smith", "Beyoncé", "Tom Cruise", "Marilyn Monroe", "Einstein"],
    "Lugares": ["Escuela", "Hospital", "Playa", "Cine", "Supermercado", "Aeropuerto", "Gimnasio", "Biblioteca", "Zoológico", "Estadio", "Iglesia", "Banco", "Restaurante", "Parque", "Hotel"],
    "Animales": ["Perro", "Gato", "León", "Elefante", "Tiburón", "Águila", "Pingüino", "Serpiente", "Caballo", "Mono", "Delfín", "Jirafa", "Oso", "Tigre", "Lobo"]
};

// --- ESTADO ---
let totalPlayers = 5;
let currentPlayer = 0;
let impostorIndex = 0;
let secretWord = "";
let selectedCategory = "";
let timerInterval = null;
let timeLeft = 300;

// --- INICIALIZACIÓN ---
function init() {
    renderCategories();
    // Lucide necesita buscar los iconos cuando el script carga
    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderCategories() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.keys(GAME_DATA).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = "bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-xl transition-all font-medium text-sm border border-transparent hover:border-purple-500/50 hover:text-white";
        btn.innerText = cat;
        btn.onclick = () => startGame(cat);
        grid.appendChild(btn);
    });
}

// --- NAVEGACIÓN ---
function showScreen(screenId) {
    // Ocultar todas las pantallas
    ['screen-menu', 'screen-turn-start', 'screen-reveal', 'screen-playing', 'screen-finished'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden-screen');
    });
    // Mostrar la deseada
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden-screen');
    
    // Refrescar iconos en la nueva pantalla
    if (window.lucide) lucide.createIcons();
}

// --- LÓGICA DE JUGADORES ---
function adjustPlayers(amount) {
    totalPlayers += amount;
    if (totalPlayers < 3) totalPlayers = 3;
    if (totalPlayers > 15) totalPlayers = 15;
    const display = document.getElementById('player-count-display');
    if (display) display.innerText = totalPlayers;
}

// --- EMPEZAR JUEGO ---
function startGame(cat) {
    if (!cat) {
        const keys = Object.keys(GAME_DATA);
        cat = keys[Math.floor(Math.random() * keys.length)];
    }
    selectedCategory = cat;
    
    const words = GAME_DATA[cat];
    secretWord = words[Math.floor(Math.random() * words.length)];
    impostorIndex = Math.floor(Math.random() * totalPlayers);
    currentPlayer = 0;

    prepareTurnScreen();
    showScreen('screen-turn-start');
}

// --- TURNOS ---
function prepareTurnScreen() {
    const el = document.getElementById('turn-player-name');
    if (el) el.innerText = `Jugador ${currentPlayer + 1}`;
}

function showRole() {
    const isImpostor = (currentPlayer === impostorIndex);
    const card = document.getElementById('role-card');
    const content = document.getElementById('role-content');
    const nextBtnText = document.getElementById('next-btn-text');

    // Resetear estilos
    card.classList.remove('bg-red-950/40', 'border-red-500/50', 'bg-gray-800', 'border-gray-700');
    
    if (isImpostor) {
        card.classList.add('bg-red-950/40', 'border-red-500/50');
        content.innerHTML = `
            <i data-lucide="skull" class="text-red-500 w-20 h-20 mb-4 mx-auto animate-pulse"></i>
            <h1 class="text-4xl font-black text-red-500 uppercase tracking-tighter mb-2">Impostor</h1>
            <p class="text-red-200/80 text-sm max-w-[200px] mx-auto mb-4">Tu objetivo: Engañar a todos y adivinar la palabra.</p>
            <div class="mt-2 p-3 bg-gray-900/80 rounded-xl w-full border border-red-500/20">
                 <p class="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Categoría</p>
                 <p class="text-white font-bold text-lg">${selectedCategory}</p>
            </div>
        `;
    } else {
        card.classList.add('bg-gray-800', 'border-gray-700');
        content.innerHTML = `
            <i data-lucide="check-circle" class="text-green-500 w-20 h-20 mb-4 mx-auto"></i>
            <p class="text-green-400 font-medium text-sm mb-1 uppercase tracking-wider">Palabra Secreta</p>
            <h1 class="text-4xl font-black text-white uppercase tracking-tight mb-6">${secretWord}</h1>
            <div class="mt-2 p-3 bg-gray-900/50 rounded-lg w-full">
                 <p class="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Categoría</p>
                 <p class="text-gray-300 font-medium">${selectedCategory}</p>
            </div>
        `;
    }

    // Configurar botón siguiente
    if (currentPlayer < totalPlayers - 1) {
        nextBtnText.innerText = "Ocultar y Pasar";
    } else {
        nextBtnText.innerText = "Empezar Juego";
    }

    showScreen('screen-reveal');
}

function nextPlayer() {
    if (currentPlayer < totalPlayers - 1) {
        currentPlayer++;
        prepareTurnScreen();
        showScreen('screen-turn-start');
    } else {
        startPlaying();
    }
}

// --- FASE DE JUEGO ---
function startPlaying() {
    timeLeft = 300; // 5 minutos
    document.getElementById('playing-category').innerText = selectedCategory;
    updateTimerDisplay();
    showScreen('screen-playing');
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const display = document.getElementById('timer-display');
    if (!display) return;
    
    display.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    if (timeLeft < 60) {
        display.classList.add('text-red-500', 'animate-pulse');
        display.classList.remove('text-white');
    } else {
        display.classList.add('text-white');
        display.classList.remove('text-red-500', 'animate-pulse');
    }
}

// --- FINALIZAR ---
function finishGame() {
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('result-impostor').innerText = `Jugador ${impostorIndex + 1}`;
    document.getElementById('result-word').innerText = secretWord;
    showScreen('screen-finished');
}

function resetGame() {
    if (timerInterval) clearInterval(timerInterval);
    showScreen('screen-menu');
}

// Arrancar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);