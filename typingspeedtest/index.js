const wordPool =["the","be","to","of","and","a","in","that","have","I","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us"];
let testDuration = 30;
let timeRemaining = testDuration;
let timerInterval = null;
let isRunning = false;
let isFinished = false;
let currentWordIdx = 0;
let currentCharIdx = 0;

let correctStrokes = 0;
let incorrectStrokes = 0;
const wordsContainer = document.getElementById("words-container");
const caretEl = document.getElementById("caret");
const timerEl = document.getElementById("timer");
const focusWarning = document.getElementById("focus-warning");
const mtTheme = new ECTheme({
    primary: "#2b9055",
    background: "#ffffff",
    text: "#333333",
    textMuted: "#888888",
    border: "#e5e5e5"
});
let resultModal;
let restartBtn;
let timeButtons =[];
window.addEventListener("DOMContentLoaded", () => {
    initUI();
    resetTest();
    window.addEventListener("resize", () => {
        if (!isFinished) updateCaret();
    });
    window.addEventListener("blur", () => {
        if (!isFinished) {
            focusWarning.classList.replace("display-none", "display-flex");
        }
    });
    window.addEventListener("focus", () => {
        focusWarning.classList.replace("display-flex", "display-none");
    });
    focusWarning.addEventListener("click", () => {
        focusWarning.classList.replace("display-flex", "display-none");
    });
    document.addEventListener("keydown", handleKeydown);
});
function initUI() {
    const timeOptions =[15, 30, 60, 120];
    const controlsDiv = document.getElementById("controls");
    
    timeOptions.forEach(t => {
        const btn = new ECButton(`@ ${t}s`, { variant: t === testDuration ? "filled" : "outline" });
        btn.setTheme(mtTheme);
        btn.element.classList.add("fontSize-12px", "padding-4px_10px", "borderRadius-6px");
        btn.onClick(() => {
            testDuration = t;
            timeButtons.forEach(b => {
                b.element.classList.replace("background-var(--ec-accent,_#2b9055)", "background-transparent");
                b.element.classList.replace("color-#ffffff", "color-var(--ec-accent,_#2b9055)");
            });
            btn.element.classList.replace("background-transparent", "background-var(--ec-accent,_#2b9055)");
            btn.element.classList.replace("color-var(--ec-accent,_#2b9055)", "color-#ffffff");
            
            document.activeElement.blur();
            resetTest();
        });
        timeButtons.push(btn);
        controlsDiv.appendChild(btn.element);
    });
    restartBtn = new ECButton("Restart Test", { variant: "outline" });
    restartBtn.setTheme(mtTheme);
    restartBtn.onClick(() => {
        document.activeElement.blur();
        resetTest();
    });
    
    const btnWrap = document.createElement("div");
    new ECTooltip(btnWrap, "Press Tab + Enter to restart quickly");
    btnWrap.appendChild(restartBtn.element);
    document.getElementById("restart-btn-container").appendChild(btnWrap);
    resultModal = new ECModal("Test Results");
    resultModal.setTheme(mtTheme);
    resultModal.addFooterButton("Next Test", () => {
        resetTest();
        resultModal.close();
    });
    document.body.appendChild(resultModal.element);
}
function generateWords(count) {
    wordsContainer.innerHTML = "";
    wordsContainer.appendChild(caretEl);
    for (let i = 0; i < count; i++) {
        const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
        const wordEl = document.createElement("div");
        wordEl.className = "word display-flex margin-0_4px";
        
        for (let char of randomWord) {
            const charEl = document.createElement("span");
            charEl.className = "letter color-#a3a3a3";
            charEl.dataset.char = char;
            charEl.textContent = char;
            wordEl.appendChild(charEl);
        }
        wordsContainer.appendChild(wordEl);
    }
}
function resetTest() {
    clearInterval(timerInterval);
    isRunning = false;
    isFinished = false;
    currentWordIdx = 0;
    currentCharIdx = 0;
    correctStrokes = 0;
    incorrectStrokes = 0;
    timeRemaining = testDuration;
    timerEl.textContent = timeRemaining;
    timerEl.classList.replace("opacity-1", "opacity-0");
    
    generateWords(150);
    
    wordsContainer.scrollTo({ top: 0, behavior: "auto" });
    
    requestAnimationFrame(() => {
        updateCaret();
        caretEl.classList.add("caret-blink");
    });
}
function startTest() {
    if (isRunning) return;
    isRunning = true;
    timerEl.classList.replace("opacity-0", "opacity-1");
    
    new ECToast(`Test Started: ${testDuration} Seconds`, { type: "info", duration: 2000 })
        .setTheme(mtTheme).show();
    timerInterval = setInterval(() => {
        timeRemaining--;
        timerEl.textContent = timeRemaining;
        if (timeRemaining <= 0) {
            endTest();
        }
    }, 1000);
}
function endTest() {
    clearInterval(timerInterval);
    isRunning = false;
    isFinished = true;
    
    const timeMinutes = testDuration / 60;
    const netWpm = Math.max(0, Math.round((correctStrokes / 5) / timeMinutes));
    const totalStrokes = correctStrokes + incorrectStrokes;
    const accuracy = totalStrokes > 0 ? Math.round((correctStrokes / totalStrokes) * 100) : 0;
    resultModal.setContent(`
        <div class="display-flex flexDirection-column gap-16px textAlign-center padding-12px">
            <div class="fontSize-56px fontWeight-700 color-var(--ec-accent,_#2b9055) lineHeight-1">
                ${netWpm} <span class="fontSize-24px fontWeight-500">WPM</span>
            </div>
            <div class="fontSize-24px color-#333333">
                ${accuracy}% <span class="fontSize-16px color-#888888">Accuracy</span>
            </div>
            <div class="marginTop-16px borderTop-1px_solid_var(--ec-border,_#e5e5e5) paddingTop-16px display-flex justifyContent-space-around">
                <div>
                    <div class="fontSize-24px color-#333333">${correctStrokes}</div>
                    <div class="fontSize-12px color-#888888 textTransform-uppercase letterSpacing-0.05em">Correct</div>
                </div>
                <div>
                    <div class="fontSize-24px color-#ef4444">${incorrectStrokes}</div>
                    <div class="fontSize-12px color-#888888 textTransform-uppercase letterSpacing-0.05em">Errors</div>
                </div>
            </div>
        </div>
    `);
    resultModal.open();
}
function updateCaret() {
    const wordNodes = Array.from(wordsContainer.querySelectorAll(".word"));
    const currentWordEl = wordNodes[currentWordIdx];
    if (!currentWordEl) return;
    let targetEl;
    let isAtEnd = false;
    if (currentCharIdx < currentWordEl.children.length) {
        targetEl = currentWordEl.children[currentCharIdx];
    } else {
        targetEl = currentWordEl.children[currentWordEl.children.length - 1];
        isAtEnd = true;
    }
    let left = targetEl.offsetLeft;
    let top = targetEl.offsetTop;
    if (isAtEnd) {
        left += targetEl.offsetWidth;
    }
    caretEl.style.transform = `translate(${left}px, ${top}px)`;
    
    const scrollTarget = currentWordEl.offsetTop;
    if (scrollTarget - wordsContainer.scrollTop > 50) {
        wordsContainer.scrollTo({ top: scrollTarget - 48, behavior: "smooth" });
    } else if (scrollTarget < wordsContainer.scrollTop) {
        wordsContainer.scrollTo({ top: scrollTarget, behavior: "smooth" });
    }
}
function handleKeydown(e) {
    if (isFinished) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.activeElement.tagName === "BUTTON" && e.key !== "Tab" && e.key !== "Enter") {
        document.activeElement.blur();
    }
    const isChar = e.key.length === 1;
    const isBackspace = e.key === "Backspace";
    const isSpace = e.key === " ";
    if (!isChar && !isBackspace) return;
    if (!isRunning && (isChar || isBackspace)) {
        startTest();
    }
    const wordNodes = Array.from(wordsContainer.querySelectorAll(".word"));
    const currentWordEl = wordNodes[currentWordIdx];
    caretEl.classList.remove("caret-blink");
    if (isSpace) {
        e.preventDefault();
        
        if (currentCharIdx > 0 || currentWordIdx > 0) {
            currentWordIdx++;
            currentCharIdx = 0;
            updateCaret();
        }
    } else if (isBackspace) {
        e.preventDefault();
        
        if (currentCharIdx > 0) {
            currentCharIdx--;
            const charEl = currentWordEl.children[currentCharIdx];
            if (charEl.classList.contains("extra")) {
                charEl.remove();
                incorrectStrokes--;
            } else {
                charEl.className = "letter color-#a3a3a3";
            }
        } else if (currentWordIdx > 0) {
            currentWordIdx--;
            const prevWordEl = wordNodes[currentWordIdx];
            currentCharIdx = prevWordEl.children.length;
        }
        updateCaret();
    } else if (isChar) {
        e.preventDefault();
        
        if (currentCharIdx < currentWordEl.children.length) {
            const charEl = currentWordEl.children[currentCharIdx];
            
            if (!charEl.classList.contains("extra")) {
                const expected = charEl.dataset.char;
                if (e.key === expected) {
                    charEl.className = "letter correct";
                    correctStrokes++;
                } else {
                    charEl.className = "letter error";
                    incorrectStrokes++;
                }
            }
            currentCharIdx++;
        } else {
            if (currentCharIdx < currentWordEl.children.length + 8) { // max 8 extra letters
                const extraSpan = document.createElement("span");
                extraSpan.className = "letter extra";
                extraSpan.textContent = e.key;
                currentWordEl.appendChild(extraSpan);
                currentCharIdx++;
                incorrectStrokes++;
            }
        }
        updateCaret();
    }
    
    clearTimeout(window.blinkTimeout);
    window.blinkTimeout = setTimeout(() => {
        if (!isFinished) caretEl.classList.add("caret-blink");
    }, 1000);
}