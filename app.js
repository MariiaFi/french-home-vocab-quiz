/**
 * Изучение французского — Предметы дома
 * Чистый JS, офлайн-режим, темы, поиск, квиз с тремя режимами.
 */

// ========== СЛОВАРЬ (VOCAB) — 30+ предметов дома ==========
const VOCAB = [
    { fr: "chaise", ipa: "[ʃɛz]", ru: "стул" },
    { fr: "table", ipa: "[tabl]", ru: "стол" },
    { fr: "lit", ipa: "[li]", ru: "кровать" },
    { fr: "armoire", ipa: "[aʁmwaʁ]", ru: "шкаф" },
    { fr: "canapé", ipa: "[kanape]", ru: "диван" },
    { fr: "lampe", ipa: "[lɑ̃p]", ru: "лампа" },
    { fr: "tapis", ipa: "[tapi]", ru: "ковер" },
    { fr: "rideau", ipa: "[ʁido]", ru: "штора" },
    { fr: "coussin", ipa: "[kusɛ̃]", ru: "подушка" },
    { fr: "miroir", ipa: "[miʁwaʁ]", ru: "зеркало" },
    { fr: "étagère", ipa: "[etaʒɛʁ]", ru: "полка" },
    { fr: "bureau", ipa: "[byʁo]", ru: "письменный стол" },
    { fr: "fauteuil", ipa: "[fotœj]", ru: "кресло" },
    { fr: "plante", ipa: "[plɑ̃t]", ru: "растение" },
    { fr: "horloge", ipa: "[ɔʁlɔʒ]", ru: "часы" },
    { fr: "télévision", ipa: "[televizjɔ̃]", ru: "телевизор" },
    { fr: "réfrigérateur", ipa: "[ʁefʁiʒeʁatœʁ]", ru: "холодильник" },
    { fr: "four", ipa: "[fuʁ]", ru: "духовка" },
    { fr: "évier", ipa: "[evje]", ru: "раковина" },
    { fr: "bol", ipa: "[bɔl]", ru: "миска" },
    { fr: "assiette", ipa: "[asjɛt]", ru: "тарелка" },
    { fr: "verre", ipa: "[vɛʁ]", ru: "стакан" },
    { fr: "fourchette", ipa: "[fuʁʃɛt]", ru: "вилка" },
    { fr: "couteau", ipa: "[kuto]", ru: "нож" },
    { fr: "cuillère", ipa: "[kɥijɛʁ]", ru: "ложка" },
    { fr: "poêle", ipa: "[pwɑl]", ru: "сковорода" },
    { fr: "casserole", ipa: "[kasʁɔl]", ru: "кастрюля" },
    { fr: "machine à laver", ipa: "[maʃin a lave]", ru: "стиральная машина" },
    { fr: "aspirateur", ipa: "[aspiʁatœʁ]", ru: "пылесос" },
    { fr: "fer à repasser", ipa: "[fɛʁ a ʁəpase]", ru: "утюг" }
];

// ========== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ==========
let currentScreen = 'dict'; // 'dict' или 'quiz'
let quizMode = 'ru2fr'; // ru2fr, fr2ru, mixed
let currentQuestions = []; // массив вопросов для квиза
let currentQuestionIndex = 0;
let score = 0;
let mistakesIds = []; // индексы слов (в VOCAB), на которые ошиблись
let quizActive = true;
let totalQuestions = 0;

// DOM элементы
const appContent = document.getElementById('appContent');
const themeToggle = document.getElementById('themeToggle');
const backToDictBtn = document.getElementById('backToDictBtn');

// Шаблоны
const dictTemplate = document.getElementById('dict-screen-template');
const quizTemplate = document.getElementById('quiz-screen-template');

// ========== ИНИЦИАЛИЗАЦИЯ ==========
function initApp() {
    // Загружаем тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }

    // Рендер стартового экрана (словарь)
    renderDictScreen();

    // События навбара
    themeToggle.addEventListener('click', toggleTheme);
    backToDictBtn.addEventListener('click', () => {
        if (currentScreen !== 'dict') {
            renderDictScreen();
        }
    });
}

// ========== ТЕМА ==========
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ========== SPEECH SYNTHESIS (ОЗВУЧКА) ==========
function speakFrench(text) {
    if (!window.speechSynthesis) {
        alert('Web Speech API не поддерживается в вашем браузере.');
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9; // комфортная скорость
    window.speechSynthesis.cancel(); // отмена предыдущей речи
    window.speechSynthesis.speak(utterance);
}

// ========== РЕНДЕР СЛОВАРЯ ==========
function renderDictScreen() {
    currentScreen = 'dict';
    const clone = dictTemplate.content.cloneNode(true);
    appContent.innerHTML = '';
    appContent.appendChild(clone);

    const vocabGrid = document.getElementById('vocabGrid');
    const searchInput = document.getElementById('searchInput');
    const sortAz = document.getElementById('sortAzBtn');
    const sortRandom = document.getElementById('sortRandomBtn');
    const startQuizBtn = document.getElementById('startQuizFromDict');

    let currentVocab = [...VOCAB];

    function displayVocab(array) {
        vocabGrid.innerHTML = '';
        array.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'vocab-card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="fr-word">${item.fr}</div>
                <div class="ipa">${item.ipa}</div>
                <div class="ru-word">${item.ru}</div>
                <button class="speak-btn" data-fr="${item.fr}">🔊 Озвучить</button>
            `;
            vocabGrid.appendChild(card);
        });

        // Обработчики озвучки
        document.querySelectorAll('.speak-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const frWord = btn.dataset.fr;
                speakFrench(frWord);
            });
        });
    }

    displayVocab(currentVocab);

    // Поиск
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = VOCAB.filter(item => 
            item.fr.toLowerCase().includes(query) || 
            item.ru.toLowerCase().includes(query)
        );
        displayVocab(filtered);
    });

    // Сортировка A-Z
    sortAz.addEventListener('click', () => {
        const sorted = [...currentVocab].sort((a, b) => a.fr.localeCompare(b.fr));
        displayVocab(sorted);
    });

    // Случайная сортировка
    sortRandom.addEventListener('click', () => {
        const shuffled = [...currentVocab].sort(() => Math.random() - 0.5);
        displayVocab(shuffled);
    });

    // Переход в квиз
    startQuizBtn.addEventListener('click', () => {
        renderQuizScreen('ru2fr'); // По умолчанию рус->франц
    });
}

// ========== ГЕНЕРАЦИЯ ВОПРОСОВ ДЛЯ КВИЗА ==========
function generateQuizQuestions(mode) {
    const questions = [];
    const usedIndices = new Set();

    // Делаем 10 вопросов (или сколько поместится)
    const questionCount = Math.min(10, VOCAB.length);
    
    while (questions.length < questionCount) {
        let randomIndex = Math.floor(Math.random() * VOCAB.length);
        if (usedIndices.has(randomIndex)) continue;
        usedIndices.add(randomIndex);

        const word = VOCAB[randomIndex];
        let questionType = mode;
        if (mode === 'mixed') {
            questionType = Math.random() < 0.5 ? 'ru2fr' : 'fr2ru';
        }

        const isRu2Fr = (questionType === 'ru2fr');
        
        // Формируем варианты
        let correctAnswer, questionText, options;
        if (isRu2Fr) {
            questionText = word.ru;
            correctAnswer = word.fr;
            // Собираем 3 случайных французских слова (не равных правильному)
            let otherOptions = [];
            while (otherOptions.length < 3) {
                let rand = VOCAB[Math.floor(Math.random() * VOCAB.length)];
                if (rand.fr !== correctAnswer && !otherOptions.includes(rand.fr)) {
                    otherOptions.push(rand.fr);
                }
            }
            options = [correctAnswer, ...otherOptions];
        } else {
            questionText = word.fr;
            correctAnswer = word.ru;
            let otherOptions = [];
            while (otherOptions.length < 3) {
                let rand = VOCAB[Math.floor(Math.random() * VOCAB.length)];
                if (rand.ru !== correctAnswer && !otherOptions.includes(rand.ru)) {
                    otherOptions.push(rand.ru);
                }
            }
            options = [correctAnswer, ...otherOptions];
        }

        // Перемешиваем варианты
        options = shuffleArray(options);

        questions.push({
            vocabIndex: randomIndex,
            questionText,
            correctAnswer,
            options,
            type: isRu2Fr ? 'ru2fr' : 'fr2ru'
        });
    }
    return questions;
}

// Утилита перемешивания
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ========== РЕНДЕР КВИЗА ==========
function renderQuizScreen(mode = 'ru2fr') {
    currentScreen = 'quiz';
    quizMode = mode;
    currentQuestions = generateQuizQuestions(quizMode);
    currentQuestionIndex = 0;
    score = 0;
    mistakesIds = [];
    quizActive = true;
    totalQuestions = currentQuestions.length;

    const clone = quizTemplate.content.cloneNode(true);
    appContent.innerHTML = '';
    appContent.appendChild(clone);

    // Обновляем заголовок
    const modeTitle = document.getElementById('quizModeTitle');
    const modeNames = {
        'ru2fr': 'Русский → Французский',
        'fr2ru': 'Французский → Русский',
        'mixed': 'Смешанный'
    };
    modeTitle.textContent = `Квиз: ${modeNames[quizMode]}`;

    // Кнопки назад
    document.getElementById('backToDictFromQuiz').addEventListener('click', renderDictScreen);
    document.getElementById('backToDictFromResult').addEventListener('click', renderDictScreen);
    
    // Инициализация прогресс-бара и счёта
    updateProgressAndScore();

    // Рендерим первый вопрос
    renderQuestion(currentQuestionIndex);

    // Обработчик "Дальше"
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion(currentQuestionIndex);
        } else {
            // Квиз завершен, показываем результат
            showQuizResult();
        }
        updateProgressAndScore();
    });

    // Кнопки на экране результата
    document.getElementById('retryMistakesBtn')?.addEventListener('click', retryMistakes);
    document.getElementById('playAgainBtn')?.addEventListener('click', () => renderQuizScreen(quizMode));
}

// Обновление прогресс-бара и счётчика
function updateProgressAndScore() {
    const progressBar = document.getElementById('progressBar');
    const scoreCounter = document.getElementById('scoreCounter');
    if (progressBar) {
        const percent = ((currentQuestionIndex) / totalQuestions) * 100;
        progressBar.style.width = `${percent}%`;
    }
    if (scoreCounter) {
        scoreCounter.textContent = `Правильно: ${score} / ${totalQuestions}`;
    }
}

// Рендер вопроса по индексу
function renderQuestion(index) {
    const q = currentQuestions[index];
    if (!q) return;

    const questionWordEl = document.getElementById('questionWord');
    const optionsContainer = document.getElementById('optionsContainer');
    const nextBtn = document.getElementById('nextBtn');

    // Текст вопроса
    questionWordEl.textContent = q.questionText;
    if (q.type === 'fr2ru') {
        // добавление транскрипции для французского вопроса (необязательно, но улучшает UX)
        const wordData = VOCAB[q.vocabIndex];
        if (wordData) {
            questionWordEl.innerHTML = `${wordData.fr} <span style="font-size: 1rem; color: var(--text-secondary);">${wordData.ipa}</span>`;
        }
    }

    // Создаем опции
    optionsContainer.innerHTML = '';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', (e) => handleAnswer(e, q.correctAnswer, q.vocabIndex));
        optionsContainer.appendChild(btn);
    });

    // Деактивируем кнопку "Дальше"
    nextBtn.disabled = true;
}

// Обработка ответа
function handleAnswer(event, correctAnswer, vocabIndex) {
    const selectedBtn = event.target;
    const allOptions = document.querySelectorAll('.option-btn');
    const nextBtn = document.getElementById('nextBtn');

    // Блокируем все опции
    allOptions.forEach(btn => btn.disabled = true);

    const isCorrect = (selectedBtn.textContent === correctAnswer);
    
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score++;
    } else {
        selectedBtn.classList.add('wrong');
        // Подсвечиваем правильный ответ
        allOptions.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
        // Запоминаем ошибку, если ещё не записана
        if (!mistakesIds.includes(vocabIndex)) {
            mistakesIds.push(vocabIndex);
        }
    }

    // Обновляем счет
    updateProgressAndScore();
    
    // Активируем кнопку "Дальше"
    nextBtn.disabled = false;
}

// Показать экран результата
function showQuizResult() {
    document.querySelector('.quiz-card').classList.add('hidden');
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.classList.remove('hidden');
    
    const resultStats = document.getElementById('resultStats');
    const percent = Math.round((score / totalQuestions) * 100);
    resultStats.innerHTML = `✅ ${score} / ${totalQuestions} (${percent}%)`;
}

// Повторить ошибочные
function retryMistakes() {
    if (mistakesIds.length === 0) {
        alert('Нет ошибок! Отличный результат!');
        renderQuizScreen(quizMode);
        return;
    }
    // Создаём новый квиз только из слов, где были ошибки
    const mistakeWords = mistakesIds.map(id => VOCAB[id]);
    // Подменяем глобальный массив вопросов вручную
    const mistakeQuestions = [];
    mistakeWords.forEach((word, idx) => {
        // Упрощённо: создаём ru2fr вопрос, можно расширить
        let otherOptions = [];
        while (otherOptions.length < 3) {
            let rand = VOCAB[Math.floor(Math.random() * VOCAB.length)];
            if (rand.fr !== word.fr && !otherOptions.includes(rand.fr)) {
                otherOptions.push(rand.fr);
            }
        }
        let options = [word.fr, ...otherOptions];
        options = shuffleArray(options);
        mistakeQuestions.push({
            vocabIndex: mistakesIds[idx],
            questionText: word.ru,
            correctAnswer: word.fr,
            options,
            type: 'ru2fr'
        });
    });

    // Перезапускаем квиз с этими вопросами
    currentQuestions = mistakeQuestions;
    currentQuestionIndex = 0;
    score = 0;
    mistakesIds = []; // сброс
    totalQuestions = currentQuestions.length;
    quizActive = true;
    
    // Скрыть результат, показать карточку
    document.querySelector('.quiz-card').classList.remove('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    renderQuestion(0);
    updateProgressAndScore();

    // Подправить заголовок
    document.getElementById('quizModeTitle').textContent = 'Квиз: Повтор ошибок';
}

// ========== СТАРТ ==========
document.addEventListener('DOMContentLoaded', initApp);
