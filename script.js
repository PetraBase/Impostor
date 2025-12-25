// --- BASE DE DATOS EXTENDIDA (50 items por categoría) ---
const GAME_DATA = {
    "Países": [
        "Argentina", "México", "España", "Brasil", "Japón", "Francia", "Italia", "EEUU", "China", "Egipto",
        "Alemania", "Australia", "Canadá", "Perú", "Colombia", "Chile", "Rusia", "India", "Sudáfrica", "Turquía",
        "Grecia", "Portugal", "Tailandia", "Corea del Sur", "Vietnam", "Marruecos", "Cuba", "Nueva Zelanda", "Suecia", "Noruega",
        "Suiza", "Bélgica", "Países Bajos", "Irlanda", "Polonia", "Ucrania", "Israel", "Arabia Saudita", "Emiratos Árabes", "Singapur",
        "Indonesia", "Filipinas", "Malasia", "Kenia", "Nigeria", "Costa Rica", "Panamá", "Uruguay", "Bolivia", "Ecuador"
    ],
    "Comida": [
        "Pizza", "Sushi", "Tacos", "Hamburguesa", "Paella", "Asado", "Helado", "Pollo Frito", "Pasta", "Empanadas",
        "Ceviche", "Hot Dog", "Chocolate", "Queso", "Ensalada", "Sopa", "Arroz", "Pescado", "Mariscos", "Burrito",
        "Lasagna", "Ravioles", "Milanesa", "Churros", "Donas", "Pastel", "Fruta", "Pan", "Huevo", "Tocino",
        "Papas Fritas", "Nachos", "Guacamole", "Arepas", "Tamales", "Pozole", "Curry", "Ramen", "Falafel", "Kebab",
        "Tarta", "Galletas", "Brownie", "Mousse", "Yogurt", "Cereal", "Sandwich", "Bagel", "Croissant", "Tostada"
    ],
    "Películas": [
        "Titanic", "Avatar", "Star Wars", "Harry Potter", "El Padrino", "Avengers", "Shrek", "Matrix", "Frozen", "Joker",
        "Coco", "Spiderman", "Batman", "Jurassic Park", "El Rey León", "Toy Story", "Buscando a Nemo", "Los Increíbles", "Gladiador", "Forrest Gump",
        "Volver al Futuro", "Indiana Jones", "Rocky", "Terminator", "Alien", "Pulp Fiction", "El Señor de los Anillos", "Piratas del Caribe", "Iron Man", "Capitán América",
        "Thor", "Black Panther", "Wonder Woman", "Superman", "La La Land", "Interstellar", "Inception", "El Resplandor", "Psicosis", "Tiburón",
        "ET", "Grease", "Mamma Mia", "Barbie", "Oppenheimer", "Dune", "Top Gun", "Misión Imposible", "Rápidos y Furiosos", "Mi Villano Favorito"
    ],
    "Animales": [
        "Perro", "Gato", "León", "Elefante", "Tiburón", "Águila", "Pingüino", "Mono", "Tigre", "Lobo",
        "Oso", "Jirafa", "Cebra", "Hipopótamo", "Rinoceronte", "Cocodrilo", "Serpiente", "Tortuga", "Ballena", "Delfín",
        "Caballo", "Vaca", "Cerdo", "Oveja", "Cabra", "Gallina", "Pato", "Conejo", "Ratón", "Hámster",
        "Loro", "Búho", "Cuervo", "Colibrí", "Avestruz", "Canguro", "Koala", "Panda", "Mapache", "Zorro",
        "Ciervo", "Alce", "Camello", "Llama", "Murciélago", "Araña", "Escorpión", "Abeja", "Mariposa", "Hormiga"
    ],
    "Famosos": [
        "Lionel Messi", "Shakira", "Cristiano Ronaldo", "Michael Jackson", "Brad Pitt", "Taylor Swift", "The Rock", "Elon Musk", "Will Smith", "Beyoncé",
        "Tom Cruise", "Marilyn Monroe", "Einstein", "Frida Kahlo", "Bad Bunny", "Rihanna", "Justin Bieber", "Selena Gomez", "Ariana Grande", "Katy Perry",
        "Lady Gaga", "Madonna", "Elvis Presley", "Freddie Mercury", "John Lennon", "Paul McCartney", "David Bowie", "Prince", "Eminem", "Snoop Dogg",
        "Jennifer Lopez", "Kim Kardashian", "Kylie Jenner", "Zendaya", "Tom Holland", "Leonardo DiCaprio", "Johnny Depp", "Angelina Jolie", "Scarlett Johansson", "Robert Downey Jr",
        "Chris Hemsworth", "Chris Evans", "Mark Zuckerberg", "Bill Gates", "Steve Jobs", "Barack Obama", "Donald Trump", "Papa Francisco", "Reina Isabel II", "Diego Maradona"
    ],
    "Lugares": [
        "Escuela", "Hospital", "Playa", "Cine", "Supermercado", "Aeropuerto", "Gimnasio", "Biblioteca", "Zoológico", "Estadio",
        "Iglesia", "Banco", "Restaurante", "Parque", "Hotel", "Museo", "Teatro", "Circo", "Farmacia", "Gasolinera",
        "Estación de Tren", "Puerto", "Fábrica", "Oficina", "Comisaría", "Bomberos", "Correo", "Ayuntamiento", "Universidad", "Cementerio",
        "Montaña", "Bosque", "Selva", "Desierto", "Isla", "Cueva", "Volcán", "Cascada", "Lago", "Río",
        "Piscina", "Spa", "Peluquería", "Tienda de Ropa", "Zapatería", "Juguetería", "Librería", "Cafetería", "Bar", "Discoteca"
    ]
};

// --- SISTEMA DE CONTROL DE REPETIDOS ---
// Aquí guardaremos las palabras que ya salieron: { "Países": ["Chile", "Perú"], ... }
const usedWords = {};

// Inicializar el tracker de palabras usadas
Object.keys(GAME_DATA).forEach(cat => {
    usedWords[cat] = [];
});

// --- ESTADO DEL JUEGO ---
let totalPlayers = 5;
let currentPlayer = 0;
let impostorIndex = 0;
let secretWord = "";
let selectedCategory = "";
let timerInterval = null;
let timeLeft = 300;

// --- INICIO ---
function init() {
    renderCategories();
    // Lucide necesita buscar los iconos cuando el script carga
    if (window.lucide) {
        lucide.createIcons();
    }
}

// --- GESTIÓN DE PANTALLAS ---
function showScreen(id) {
    document.querySelectorAll('[id^="screen-"]').forEach(el => el.classList.add('hidden-screen'));
    document.getElementById(id).classList.remove('hidden-screen');
    if (window.lucide) lucide.createIcons();
}

// --- LÓGICA DE JUGADORES ---
function adjustPlayers(n) {
    totalPlayers = Math.max(3, Math.min(15, totalPlayers + n));
    document.getElementById('player-count-display').innerText = totalPlayers;
}

function renderCategories() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.keys(GAME_DATA).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = "bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-xl text-sm font-medium border border-transparent hover:border-purple-500/50";
        btn.innerText = cat;
        btn.onclick = () => startGame(cat);
        grid.appendChild(btn);
    });
}

// --- SELECCIÓN DE PALABRA (Con lógica de descarte) ---
function getUniqueWord(category) {
    const allWords = GAME_DATA[category];
    const used = usedWords[category];

    // Filtrar palabras que NO están en la lista de usadas
    const availableWords = allWords.filter(word => !used.includes(word));

    if (availableWords.length === 0) {
        // Si ya se usaron todas, reiniciamos la lista de usadas para esa categoría
        usedWords[category] = [];
        // Notificar al usuario (opcional, visualmente sutil)
        const msg = document.getElementById('reset-msg');
        if (msg) {
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        }
        
        // Volvemos a intentar (ahora están todas disponibles)
        return getUniqueWord(category);
    }

    // Elegir una al azar de las disponibles
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // Marcarla como usada
    usedWords[category].push(randomWord);
    
    return randomWord;
}

// --- JUEGO CORE ---
function startGame(catName) {
    // Si es aleatorio, elegimos categoría al azar
    if (!catName) {
        const keys = Object.keys(GAME_DATA);
        catName = keys[Math.floor(Math.random() * keys.length)];
    }
    
    selectedCategory = catName;
    secretWord = getUniqueWord(catName); // Usamos la nueva función inteligente
    impostorIndex = Math.floor(Math.random() * totalPlayers);
    currentPlayer = 0;
    
    document.getElementById('turn-player-name').innerText = `Jugador 1`;
    showScreen('screen-turn-start');
}

function showRole() {
    const isImp = currentPlayer === impostorIndex;
    const card = document.getElementById('role-card');
    const content = document.getElementById('role-content');
    
    card.className = `p-8 rounded-3xl w-full shadow-2xl border relative overflow-hidden transition-colors duration-500 ${isImp ? 'bg-red-950/40 border-red-500/50' : 'bg-gray-800 border-gray-700'}`;
    
    if(isImp) {
        content.innerHTML = `<i data-lucide="skull" class="text-red-500 w-20 h-20 mb-4 animate-pulse"></i><h1 class="text-4xl font-black text-red-500 uppercase tracking-tighter mb-2">IMPOSTOR</h1><p class="text-red-200 text-sm">Engaña a todos.</p><div class="mt-4 p-2 bg-gray-900 rounded border border-red-500/30 text-xs text-gray-400">Categoría: <span class="text-white font-bold block text-base">${selectedCategory}</span></div>`;
    } else {
        content.innerHTML = `<i data-lucide="check-circle" class="text-green-500 w-20 h-20 mb-4"></i><p class="text-green-400 text-sm uppercase tracking-wider">Palabra Secreta</p><h1 class="text-3xl font-black text-white mt-1 mb-4">${secretWord}</h1><div class="mt-2 text-xs text-gray-500">Categoría: ${selectedCategory}</div>`;
    }
    
    const nextBtnText = document.getElementById('next-btn-text');
    nextBtnText.innerText = (currentPlayer < totalPlayers - 1) ? "Ocultar y Pasar" : "Empezar Juego";
    showScreen('screen-reveal');
}

function nextPlayer() {
    if(currentPlayer < totalPlayers - 1) {
        currentPlayer++;
        document.getElementById('turn-player-name').innerText = `Jugador ${currentPlayer + 1}`;
        showScreen('screen-turn-start');
    } else {
        startTimer();
        document.getElementById('playing-category').innerText = selectedCategory;
        showScreen('screen-playing');
    }
}

function startTimer() {
    timeLeft = 300;
    updateTimer();
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        if(timeLeft <= 0) clearInterval(timerInterval);
    }, 1000);
}

function updateTimer() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const display = document.getElementById('timer-display');
    if (!display) return;

    display.innerText = `${m}:${s<10?'0':''}${s}`;
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

// Arrancar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);