import { useState, useEffect, useCallback, useRef } from “react”;

const GAMES = {
HOME: “home”,
MATH_BLAST: “math_blast”,
WORD_SCRAMBLE: “word_scramble”,
QUIZ_QUEST: “quiz_quest”,
MEMORY_MATCH: “memory_match”,
FLAG_FINDER: “flag_finder”,
PATTERN_PUZZLE: “pattern_puzzle”,
SPEED_SPELLER: “speed_speller”,
SCIENCE_SORT: “science_sort”,
};

// ─── Confetti Component ───
function Confetti({ active }) {
if (!active) return null;
const colors = [”#FF6B6B”, “#4ECDC4”, “#FFE66D”, “#A855F7”, “#FF85A2”, “#45B7D1”, “#FFA07A”];
return (
<div style={{ position: “fixed”, inset: 0, pointerEvents: “none”, zIndex: 9999 }}>
{Array.from({ length: 50 }).map((_, i) => (
<div key={i} style={{
position: “absolute”, left: `${Math.random() * 100}%`, top: `-10px`,
width: `${8 + Math.random() * 8}px`, height: `${8 + Math.random() * 8}px`,
background: colors[Math.floor(Math.random() * colors.length)],
borderRadius: Math.random() > 0.5 ? “50%” : “2px”,
animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in forwards`,
animationDelay: `${Math.random() * 0.5}s`,
transform: `rotate(${Math.random() * 360}deg)`,
}} />
))}
</div>
);
}

// ─── MATH BLAST GAME ───
function MathBlast({ onBack }) {
const [score, setScore] = useState(0);
const [streak, setStreak] = useState(0);
const [timeLeft, setTimeLeft] = useState(60);
const [problem, setProblem] = useState(null);
const [options, setOptions] = useState([]);
const [feedback, setFeedback] = useState(null);
const [gameOver, setGameOver] = useState(false);
const [showConfetti, setShowConfetti] = useState(false);
const [answered, setAnswered] = useState(0);

const generateProblem = useCallback(() => {
const ops = [”+”, “-”, “×”, “÷”];
const op = ops[Math.floor(Math.random() * ops.length)];
let a, b, answer;
switch (op) {
case “+”: a = Math.floor(Math.random() * 200) + 50; b = Math.floor(Math.random() * 200) + 50; answer = a + b; break;
case “-”: a = Math.floor(Math.random() * 300) + 100; b = Math.floor(Math.random() * a); answer = a - b; break;
case “×”: a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; answer = a * b; break;
case “÷”: b = Math.floor(Math.random() * 11) + 2; answer = Math.floor(Math.random() * 12) + 1; a = b * answer; break;
}
const wrong = new Set();
while (wrong.size < 3) { const offset = Math.floor(Math.random() * 20) - 10; if (offset !== 0 && answer + offset > 0) wrong.add(answer + offset); }
const allOptions = [answer, …wrong];
for (let i = allOptions.length - 1; i > 0; i–) { const j = Math.floor(Math.random() * (i + 1)); [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]]; }
setProblem({ a, b, op, answer }); setOptions(allOptions); setFeedback(null);
}, []);

useEffect(() => { generateProblem(); }, [generateProblem]);
useEffect(() => {
if (gameOver) return;
const t = setInterval(() => { setTimeLeft((p) => { if (p <= 1) { clearInterval(t); setGameOver(true); return 0; } return p - 1; }); }, 1000);
return () => clearInterval(t);
}, [gameOver]);

const handleAnswer = (val) => {
if (feedback || gameOver) return;
setAnswered(a => a + 1);
if (val === problem.answer) { setScore((s) => s + 10 + streak * 2); setStreak((s) => s + 1); setFeedback(“correct”); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 1500); }
else { setStreak(0); setFeedback(“wrong”); }
setTimeout(() => generateProblem(), 800);
};

if (gameOver) return (
<GameResult emoji=“🏆” title=“Time’s Up, Ifra!” score={score} subtitle={`${answered} problems solved`}
gradient=“linear-gradient(135deg, #667eea 0%, #764ba2 100%)” onRetry={() => { setScore(0); setStreak(0); setTimeLeft(60); setGameOver(false); setAnswered(0); generateProblem(); }} onBack={onBack} showConfetti={score > 50} />
);

return (
<div style={styles.gameContainer}>
<Confetti active={showConfetti} />
<GameHeader onBack={onBack} stats={[{ icon: “⏱️”, val: `${timeLeft}s` }, { icon: “🔥”, val: streak }, { icon: “⭐”, val: score, highlight: true }]} />
<div style={{ …styles.timerBar, width: `${(timeLeft / 60) * 100}%`, background: timeLeft < 15 ? “#FF6B6B” : timeLeft < 30 ? “#FFE66D” : “#4ECDC4” }} />
<div style={styles.problemArea}>
<div style={styles.problemText}>
<span style={{ color: “#4ECDC4” }}>{problem?.a}</span>
<span style={{ color: “#FF85A2”, margin: “0 12px” }}>{problem?.op}</span>
<span style={{ color: “#A855F7” }}>{problem?.b}</span>
<span style={{ color: “#FFE66D”, margin: “0 12px” }}>=</span>
<span style={{ color: “#fff” }}>?</span>
</div>
</div>
<div style={styles.optionsGrid}>
{options.map((opt, i) => (
<button key={`${opt}-${i}`} onClick={() => handleAnswer(opt)} style={{
…styles.optionBtn,
background: feedback && opt === problem.answer ? “#4ECDC4” : feedback === “wrong” && opt !== problem.answer ? “rgba(255,255,255,0.05)” : “rgba(255,255,255,0.1)”,
transform: feedback && opt === problem.answer ? “scale(1.08)” : “scale(1)”,
borderColor: feedback && opt === problem.answer ? “#4ECDC4” : “rgba(255,255,255,0.15)”,
}}>{opt}</button>
))}
</div>
{feedback && <div style={{ textAlign: “center”, fontSize: “24px”, marginTop: “10px”, animation: “popIn 0.3s ease” }}>{feedback === “correct” ? “✨ Brilliant!” : `❌ It was ${problem.answer}`}</div>}
</div>
);
}

// ─── WORD SCRAMBLE GAME ───
const WORD_LIST = [
{ word: “ELEPHANT”, hint: “The largest land animal 🐘”, category: “Animals” },
{ word: “JUPITER”, hint: “The biggest planet 🪐”, category: “Space” },
{ word: “PYRAMID”, hint: “Ancient structure in Egypt 🏛️”, category: “History” },
{ word: “VOLCANO”, hint: “Erupts with lava 🌋”, category: “Geography” },
{ word: “DOLPHIN”, hint: “A smart marine mammal 🐬”, category: “Animals” },
{ word: “RAINBOW”, hint: “7 colours after rain 🌈”, category: “Nature” },
{ word: “GRAVITY”, hint: “Keeps us on Earth ⬇️”, category: “Science” },
{ word: “COMPASS”, hint: “Finds direction 🧭”, category: “Tools” },
{ word: “CRYSTAL”, hint: “Shiny transparent mineral 💎”, category: “Science” },
{ word: “PHOENIX”, hint: “Rises from ashes 🔥”, category: “Mythology” },
{ word: “GLACIER”, hint: “Slow-moving ice mass ❄️”, category: “Geography” },
{ word: “MERCURY”, hint: “Closest planet to Sun ☀️”, category: “Space” },
{ word: “ORIGAMI”, hint: “Japanese paper folding 📄”, category: “Art” },
{ word: “PENGUIN”, hint: “Bird that swims 🐧”, category: “Animals” },
{ word: “TORNADO”, hint: “Spinning wind storm 🌪️”, category: “Nature” },
];

function WordScramble({ onBack }) {
const [wordIndex, setWordIndex] = useState(0);
const [scrambled, setScrambled] = useState([]);
const [selected, setSelected] = useState([]);
const [score, setScore] = useState(0);
const [round, setRound] = useState(1);
const [feedback, setFeedback] = useState(null);
const [showConfetti, setShowConfetti] = useState(false);
const [hintUsed, setHintUsed] = useState(false);
const [showHint, setShowHint] = useState(false);
const [gameOver, setGameOver] = useState(false);
const totalRounds = 8;

const scrambleWord = useCallback((word) => {
const letters = word.split(””).map((l, i) => ({ letter: l, id: i }));
for (let i = letters.length - 1; i > 0; i–) { const j = Math.floor(Math.random() * (i + 1)); [letters[i], letters[j]] = [letters[j], letters[i]]; }
if (letters.map(l => l.letter).join(””) === word) [letters[0], letters[1]] = [letters[1], letters[0]];
return letters;
}, []);

const setupWord = useCallback(() => {
const idx = Math.floor(Math.random() * WORD_LIST.length);
setWordIndex(idx); setScrambled(scrambleWord(WORD_LIST[idx].word)); setSelected([]); setHintUsed(false); setShowHint(false); setFeedback(null);
}, [scrambleWord]);

useEffect(() => { setupWord(); }, [setupWord]);

const currentWord = WORD_LIST[wordIndex];

const handleLetterClick = (item) => { if (feedback) return; setSelected(p => […p, item]); setScrambled(p => p.filter(l => l.id !== item.id)); };
const handleSelectedClick = (item) => { if (feedback) return; setScrambled(p => […p, item]); setSelected(p => p.filter(l => l.id !== item.id)); };

useEffect(() => {
if (selected.length === currentWord?.word.length) {
const attempt = selected.map(s => s.letter).join(””);
if (attempt === currentWord.word) {
setScore(s => s + (hintUsed ? 8 : 15)); setFeedback(“correct”); setShowConfetti(true);
setTimeout(() => setShowConfetti(false), 1500);
setTimeout(() => { if (round >= totalRounds) setGameOver(true); else { setRound(r => r + 1); setupWord(); } }, 1200);
} else {
setFeedback(“wrong”);
setTimeout(() => { setScrambled([…selected, …scrambled].sort(() => Math.random() - 0.5)); setSelected([]); setFeedback(null); }, 800);
}
}
}, [selected]);

if (gameOver) return (
<GameResult emoji=“📝” title=“Word Wizard, Ifra!” score={score} subtitle={`${totalRounds} words unscrambled!`}
gradient=“linear-gradient(135deg, #f093fb 0%, #f5576c 100%)” onRetry={() => { setScore(0); setRound(1); setGameOver(false); setupWord(); }} onBack={onBack} />
);

return (
<div style={styles.gameContainer}>
<Confetti active={showConfetti} />
<GameHeader onBack={onBack} stats={[{ icon: “📖”, val: `${round}/${totalRounds}` }, { icon: “⭐”, val: score, highlight: true }]} />
<div style={{ textAlign: “center”, margin: “10px 0” }}>
<span style={{ background: “rgba(255,255,255,0.1)”, padding: “4px 14px”, borderRadius: “20px”, color: “#A855F7”, fontSize: “13px”, fontWeight: 600 }}>{currentWord?.category}</span>
</div>
{showHint ? (
<div style={{ textAlign: “center”, background: “rgba(78,205,196,0.15)”, padding: “10px 20px”, borderRadius: “12px”, margin: “8px 20px”, color: “#4ECDC4”, fontSize: “15px” }}>💡 {currentWord?.hint}</div>
) : (
<div style={{ textAlign: “center”, margin: “8px 0” }}>
<button onClick={() => { setShowHint(true); setHintUsed(true); }} style={{ background: “none”, border: “1px dashed rgba(255,255,255,0.3)”, color: “#FFE66D”, padding: “6px 16px”, borderRadius: “20px”, cursor: “pointer”, fontSize: “13px” }}>💡 Show Hint (-7 pts)</button>
</div>
)}
<div style={{ display: “flex”, justifyContent: “center”, gap: “6px”, margin: “20px 10px”, minHeight: “56px”, flexWrap: “wrap”, padding: “10px”, background: “rgba(255,255,255,0.05)”, borderRadius: “16px”, border: “2px dashed rgba(255,255,255,0.15)” }}>
{currentWord?.word.split(””).map((_, i) => {
const s = selected[i];
return (<div key={i} onClick={() => s && handleSelectedClick(s)} style={{ width: “44px”, height: “50px”, borderRadius: “10px”, background: s ? “linear-gradient(135deg, #A855F7, #6366F1)” : “rgba(255,255,255,0.05)”, border: s ? “none” : “2px solid rgba(255,255,255,0.1)”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: “22px”, fontWeight: 700, color: “#fff”, fontFamily: “‘Fredoka’, sans-serif”, cursor: s ? “pointer” : “default”, transition: “all 0.2s ease” }}>{s?.letter || “”}</div>);
})}
</div>
<div style={{ display: “flex”, justifyContent: “center”, gap: “8px”, flexWrap: “wrap”, margin: “10px 20px” }}>
{scrambled.map((item) => (
<button key={item.id} onClick={() => handleLetterClick(item)} style={{ width: “48px”, height: “54px”, borderRadius: “12px”, background: “linear-gradient(135deg, #4ECDC4, #45B7D1)”, border: “none”, fontSize: “22px”, fontWeight: 700, color: “#fff”, cursor: “pointer”, fontFamily: “‘Fredoka’, sans-serif”, boxShadow: “0 4px 12px rgba(78,205,196,0.3)” }}>{item.letter}</button>
))}
</div>
{feedback && <div style={{ textAlign: “center”, fontSize: “24px”, marginTop: “10px”, animation: “popIn 0.3s ease” }}>{feedback === “correct” ? “🎉 Perfect!” : “🔄 Try again!”}</div>}
</div>
);
}

// ─── QUIZ QUEST GAME ───
const QUIZ_QUESTIONS = [
{ q: “What is the largest organ of the human body?”, options: [“Heart”, “Skin”, “Liver”, “Brain”], answer: 1, fact: “Skin covers about 1.7 square metres!” },
{ q: “Which planet is known as the Red Planet?”, options: [“Venus”, “Jupiter”, “Mars”, “Saturn”], answer: 2, fact: “Mars looks red because of iron oxide (rust).” },
{ q: “What is the capital of Australia?”, options: [“Sydney”, “Melbourne”, “Canberra”, “Perth”], answer: 2, fact: “Many think it’s Sydney, but it’s Canberra!” },
{ q: “How many bones does an adult human have?”, options: [“106”, “206”, “306”, “186”], answer: 1, fact: “Babies have about 270 that fuse as they grow!” },
{ q: “Which gas do plants absorb from air?”, options: [“Oxygen”, “Nitrogen”, “Carbon Dioxide”, “Hydrogen”], answer: 2, fact: “Plants use CO₂ in photosynthesis.” },
{ q: “What is the hardest natural substance?”, options: [“Gold”, “Iron”, “Diamond”, “Platinum”], answer: 2, fact: “Diamonds are pure carbon under extreme pressure.” },
{ q: “Which ocean is the largest?”, options: [“Atlantic”, “Indian”, “Arctic”, “Pacific”], answer: 3, fact: “The Pacific covers more area than all land combined!” },
{ q: “What shape has 8 sides?”, options: [“Hexagon”, “Pentagon”, “Octagon”, “Decagon”], answer: 2, fact: “Stop signs are octagons!” },
{ q: “What is the longest river in the world?”, options: [“Amazon”, “Yangtze”, “Nile”, “Mississippi”], answer: 2, fact: “The Nile flows through 11 African countries.” },
{ q: “What is H₂O commonly known as?”, options: [“Salt”, “Water”, “Sugar”, “Oxygen”], answer: 1, fact: “H₂O = 2 hydrogen + 1 oxygen atom.” },
{ q: “What is the smallest prime number?”, options: [“0”, “1”, “2”, “3”], answer: 2, fact: “2 is the only even prime number!” },
{ q: “Which country has the Eiffel Tower?”, options: [“Italy”, “France”, “Spain”, “Germany”], answer: 1, fact: “Built in 1889, it’s 330m tall.” },
{ q: “What fraction equals 50%?”, options: [“1/3”, “1/4”, “1/2”, “2/3”], answer: 2, fact: “Percent means ‘per hundred’ — 50/100 = 1/2.” },
{ q: “How many continents are there?”, options: [“5”, “6”, “7”, “8”], answer: 2, fact: “Asia is the largest continent by area and population.” },
{ q: “What is the boiling point of water?”, options: [“90°C”, “100°C”, “110°C”, “120°C”], answer: 1, fact: “At sea level, water boils at exactly 100°C.” },
];

function QuizQuest({ onBack }) {
const [qIndex, setQIndex] = useState(0);
const [score, setScore] = useState(0);
const [selected, setSelected] = useState(null);
const [showFact, setShowFact] = useState(false);
const [gameOver, setGameOver] = useState(false);
const [showConfetti, setShowConfetti] = useState(false);
const [questions] = useState(() => QUIZ_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 10));

const handleSelect = (idx) => {
if (selected !== null) return; setSelected(idx);
if (idx === questions[qIndex].answer) { setScore(s => s + 10); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 1500); }
setShowFact(true);
};
const nextQuestion = () => { if (qIndex >= questions.length - 1) setGameOver(true); else { setQIndex(q => q + 1); setSelected(null); setShowFact(false); } };

if (gameOver) return (
<GameResult emoji={score >= 80 ? “🎓” : “📚”} title=“Quiz Complete, Ifra!” score={`${score}/${questions.length * 10}`}
subtitle={score >= 80 ? “Genius level! 🧠” : score >= 50 ? “Great effort!” : “You’re learning every day!”}
gradient=“linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)” darkText
onRetry={() => { setQIndex(0); setScore(0); setSelected(null); setShowFact(false); setGameOver(false); }} onBack={onBack} showConfetti={score >= 50} />
);

const q = questions[qIndex];
return (
<div style={styles.gameContainer}>
<Confetti active={showConfetti} />
<GameHeader onBack={onBack} stats={[{ icon: “❓”, val: `${qIndex + 1}/${questions.length}` }, { icon: “⭐”, val: score, highlight: true }]} />
<div style={{ display: “flex”, gap: “4px”, margin: “12px 20px” }}>
{questions.map((_, i) => (<div key={i} style={{ flex: 1, height: “4px”, borderRadius: “2px”, background: i < qIndex ? “#4ECDC4” : i === qIndex ? “#FFE66D” : “rgba(255,255,255,0.1)” }} />))}
</div>
<div style={{ padding: “0 20px”, marginTop: “15px” }}>
<h3 style={{ color: “#fff”, fontSize: “20px”, fontWeight: 600, lineHeight: 1.5, margin: “0 0 20px”, fontFamily: “‘Fredoka’, sans-serif” }}>{q.q}</h3>
<div style={{ display: “flex”, flexDirection: “column”, gap: “10px” }}>
{q.options.map((opt, i) => {
let bg = “rgba(255,255,255,0.08)”, border = “rgba(255,255,255,0.12)”;
if (selected !== null) { if (i === q.answer) { bg = “rgba(78,205,196,0.25)”; border = “#4ECDC4”; } else if (i === selected) { bg = “rgba(255,107,107,0.25)”; border = “#FF6B6B”; } }
return (
<button key={i} onClick={() => handleSelect(i)} style={{ background: bg, border: `2px solid ${border}`, borderRadius: “14px”, padding: “14px 18px”, color: “#fff”, fontSize: “16px”, textAlign: “left”, cursor: selected !== null ? “default” : “pointer”, transition: “all 0.2s”, fontFamily: “‘Nunito’, sans-serif”, display: “flex”, alignItems: “center”, gap: “12px” }}>
<span style={{ width: “30px”, height: “30px”, borderRadius: “50%”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: “14px”, fontWeight: 700, background: selected !== null && i === q.answer ? “#4ECDC4” : “rgba(255,255,255,0.1)”, color: selected !== null && i === q.answer ? “#1a3a2a” : “#aaa”, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
{opt}
</button>
);
})}
</div>
{showFact && (
<div style={{ marginTop: “16px”, background: “rgba(168,85,247,0.15)”, border: “1px solid rgba(168,85,247,0.3)”, borderRadius: “12px”, padding: “12px 16px”, animation: “popIn 0.3s ease” }}>
<div style={{ color: “#A855F7”, fontWeight: 700, fontSize: “13px”, marginBottom: “4px” }}>🧠 FUN FACT</div>
<div style={{ color: “#d4b5f7”, fontSize: “14px”, lineHeight: 1.5 }}>{q.fact}</div>
</div>
)}
{selected !== null && <button onClick={nextQuestion} style={{ …styles.playAgainBtn, margin: “16px auto 0”, display: “block”, width: “100%”, background: “rgba(255,255,255,0.9)”, color: “#333” }}>{qIndex >= questions.length - 1 ? “See Results” : “Next Question →”}</button>}
</div>
</div>
);
}

// ─── MEMORY MATCH GAME ───
const EMOJI_PAIRS = [“🦁”, “🌍”, “🔬”, “📐”, “🎨”, “🚀”, “🧬”, “🎵”, “🌸”, “⚡”, “🦋”, “🏔️”];

function MemoryMatch({ onBack }) {
const [cards, setCards] = useState([]);
const [flipped, setFlipped] = useState([]);
const [matched, setMatched] = useState(new Set());
const [moves, setMoves] = useState(0);
const [gameOver, setGameOver] = useState(false);
const [showConfetti, setShowConfetti] = useState(false);
const [timer, setTimer] = useState(0);
const timerRef = useRef(null);

const initGame = useCallback(() => {
const sel = […EMOJI_PAIRS].sort(() => Math.random() - 0.5).slice(0, 8);
const deck = […sel, …sel].sort(() => Math.random() - 0.5).map((emoji, i) => ({ emoji, id: i }));
setCards(deck); setFlipped([]); setMatched(new Set()); setMoves(0); setGameOver(false); setTimer(0);
if (timerRef.current) clearInterval(timerRef.current);
timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
}, []);

useEffect(() => { initGame(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [initGame]);
useEffect(() => { if (matched.size === cards.length && cards.length > 0) { clearInterval(timerRef.current); setShowConfetti(true); setTimeout(() => { setShowConfetti(false); setGameOver(true); }, 1500); } }, [matched, cards.length]);

const handleFlip = (id) => {
if (flipped.length >= 2 || flipped.includes(id) || matched.has(id)) return;
const nf = […flipped, id]; setFlipped(nf);
if (nf.length === 2) { setMoves(m => m + 1); const [a, b] = nf; if (cards[a].emoji === cards[b].emoji) { setMatched(prev => new Set([…prev, a, b])); setFlipped([]); } else setTimeout(() => setFlipped([]), 700); }
};

const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
if (gameOver) { const stars = moves <= 12 ? 3 : moves <= 18 ? 2 : 1; return <GameResult emoji={“⭐”.repeat(stars)} title=“Memory Master, Ifra!” score={`${moves} moves`} subtitle={fmt(timer)} gradient=“linear-gradient(135deg, #fa709a 0%, #fee140 100%)” darkText onRetry={initGame} onBack={onBack} />; }

return (
<div style={styles.gameContainer}>
<Confetti active={showConfetti} />
<GameHeader onBack={onBack} stats={[{ icon: “🃏”, val: moves }, { icon: “⏱️”, val: fmt(timer) }, { icon: “✅”, val: `${matched.size / 2}/8`, highlight: true }]} />
<div style={{ display: “grid”, gridTemplateColumns: “repeat(4, 1fr)”, gap: “8px”, padding: “12px 16px”, maxWidth: “400px”, margin: “20px auto 0” }}>
{cards.map((card, i) => {
const isFlipped = flipped.includes(i) || matched.has(i);
return (<div key={i} onClick={() => handleFlip(i)} style={{ aspectRatio: “1”, borderRadius: “14px”, background: matched.has(i) ? “linear-gradient(135deg, #4ECDC4, #45B7D1)” : isFlipped ? “linear-gradient(135deg, #A855F7, #6366F1)” : “linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))”, border: matched.has(i) ? “2px solid #4ECDC4” : “2px solid rgba(255,255,255,0.1)”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: “32px”, cursor: isFlipped ? “default” : “pointer”, transition: “all 0.3s ease”, boxShadow: isFlipped ? “0 4px 16px rgba(168,85,247,0.3)” : “none” }}>{isFlipped ? card.emoji : “❓”}</div>);
})}
</div>
</div>
);
}

// ─── FLAG FINDER GAME ───
const FLAG_DATA = [
{ country: “Japan”, flag: “🇯🇵”, capital: “Tokyo”, continent: “Asia”, funFact: “Japan has over 6,800 islands!” },
{ country: “Brazil”, flag: “🇧🇷”, capital: “Brasília”, continent: “South America”, funFact: “Brazil is the largest country in South America.” },
{ country: “France”, flag: “🇫🇷”, capital: “Paris”, continent: “Europe”, funFact: “France is the most visited country in the world.” },
{ country: “Egypt”, flag: “🇪🇬”, capital: “Cairo”, continent: “Africa”, funFact: “Egypt is home to the Great Pyramid of Giza.” },
{ country: “Canada”, flag: “🇨🇦”, capital: “Ottawa”, continent: “North America”, funFact: “Canada has the longest coastline in the world.” },
{ country: “India”, flag: “🇮🇳”, capital: “New Delhi”, continent: “Asia”, funFact: “India has the 2nd largest population on Earth.” },
{ country: “Australia”, flag: “🇦🇺”, capital: “Canberra”, continent: “Oceania”, funFact: “Australia is both a country and a continent!” },
{ country: “Germany”, flag: “🇩🇪”, capital: “Berlin”, continent: “Europe”, funFact: “Germany is famous for engineering and cars.” },
{ country: “South Korea”, flag: “🇰🇷”, capital: “Seoul”, continent: “Asia”, funFact: “South Korea invented the world’s fastest internet.” },
{ country: “Mexico”, flag: “🇲🇽”, capital: “Mexico City”, continent: “North America”, funFact: “Mexico introduced chocolate to the world!” },
{ country: “Italy”, flag: “🇮🇹”, capital: “Rome”, continent: “Europe”, funFact: “Italy is shaped like a boot!” },
{ country: “South Africa”, flag: “🇿🇦”, capital: “Pretoria”, continent: “Africa”, funFact: “South Africa has 3 capital cities!” },
{ country: “China”, flag: “🇨🇳”, capital: “Beijing”, continent: “Asia”, funFact: “The Great Wall of China is over 21,000 km long.” },
{ country: “United Kingdom”, flag: “🇬🇧”, capital: “London”, continent: “Europe”, funFact: “The UK includes England, Scotland, Wales & N. Ireland.” },
{ country: “Argentina”, flag: “🇦🇷”, capital: “Buenos Aires”, continent: “South America”, funFact: “Argentina is named after the Latin word for silver.” },
{ country: “Turkey”, flag: “🇹🇷”, capital: “Ankara”, continent: “Asia/Europe”, funFact: “Istanbul is on two continents!” },
{ country: “Saudi Arabia”, flag: “🇸🇦”, capital: “Riyadh”, continent: “Asia”, funFact: “Saudi Arabia has no rivers!” },
{ country: “Russia”, flag: “🇷🇺”, capital: “Moscow”, continent: “Europe/Asia”, funFact: “Russia is the largest country by area.” },
{ country: “New Zealand”, flag: “🇳🇿”, capital: “Wellington”, continent: “Oceania”, funFact: “New Zealand was the first to give women the vote.” },
{ country: “Spain”, flag: “🇪🇸”, capital: “Madrid”, continent: “Europe”, funFact: “Spain has a tomato-throwing festival!” },
];

function FlagFinder({ onBack }) {
const [round, setRound] = useState(0);
const [score, setScore] = useState(0);
const [selected, setSelected] = useState(null);
const [showFact, setShowFact] = useState(false);
const [showConfetti, setShowConfetti] = useState(false);
const [gameOver, setGameOver] = useState(false);
const totalRounds = 10;

const [rounds] = useState(() => {
const shuffled = […FLAG_DATA].sort(() => Math.random() - 0.5);
return shuffled.slice(0, totalRounds).map(correct => {
const others = FLAG_DATA.filter(f => f.country !== correct.country).sort(() => Math.random() - 0.5).slice(0, 3);
const options = [correct, …others].sort(() => Math.random() - 0.5);
const questionMode = Math.random() > 0.5 ? “flag” : “capital”;
return { correct, options, mode: questionMode };
});
});

const handleSelect = (country) => {
if (selected !== null) return;
setSelected(country);
if (country === rounds[round].correct.country) { setScore(s => s + 10); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 1500); }
setShowFact(true);
};

const nextRound = () => { if (round >= totalRounds - 1) setGameOver(true); else { setRound(r => r + 1); setSelected(null); setShowFact(false); } };

if (gameOver) return (
<GameResult emoji=“🌍” title=“World Explorer, Ifra!” score={`${score}/${totalRounds * 10}`}
subtitle={score >= 80 ? “Geography genius!” : “Keep exploring!”}
gradient=“linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)”
onRetry={() => window.location.reload()} onBack={onBack} showConfetti={score >= 60} />
);

const r = rounds[round];
return (
<div style={styles.gameContainer}>
<Confetti active={showConfetti} />
<GameHeader onBack={onBack} stats={[{ icon: “🌍”, val: `${round + 1}/${totalRounds}` }, { icon: “⭐”, val: score, highlight: true }]} />
<div style={{ display: “flex”, gap: “4px”, margin: “12px 20px” }}>
{rounds.map((_, i) => (<div key={i} style={{ flex: 1, height: “4px”, borderRadius: “2px”, background: i < round ? “#4ECDC4” : i === round ? “#FFE66D” : “rgba(255,255,255,0.1)” }} />))}
</div>
<div style={{ textAlign: “center”, padding: “20px” }}>
{r.mode === “flag” ? (
<>
<div style={{ fontSize: “80px”, marginBottom: “12px”, filter: “drop-shadow(0 4px 12px rgba(0,0,0,0.3))” }}>{r.correct.flag}</div>
<h3 style={{ color: “#FFE66D”, fontSize: “20px”, fontFamily: “‘Fredoka’, sans-serif”, margin: 0 }}>Which country’s flag is this?</h3>
</>
) : (
<>
<div style={{ fontSize: “16px”, color: “rgba(255,255,255,0.5)”, marginBottom: “6px” }}>The capital city is…</div>
<h3 style={{ color: “#FFE66D”, fontSize: “28px”, fontFamily: “‘Fredoka’, sans-serif”, margin: “0 0 6px” }}>{r.correct.capital}</h3>
<div style={{ fontSize: “16px”, color: “rgba(255,255,255,0.5)” }}>Which country is it?</div>
</>
)}
</div>
<div style={{ display: “flex”, flexDirection: “column”, gap: “10px”, padding: “0 20px” }}>
{r.options.map((opt, i) => {
let bg = “rgba(255,255,255,0.08)”, border = “rgba(255,255,255,0.12)”;
if (selected !== null) {
if (opt.country === r.correct.country) { bg = “rgba(78,205,196,0.25)”; border = “#4ECDC4”; }
else if (opt.country === selected) { bg = “rgba(255,107,107,0.25)”; border = “#FF6B6B”; }
}
return (
<button key={i} onClick={() => handleSelect(opt.country)} style={{ background: bg, border: `2px solid ${border}`, borderRadius: “14px”, padding: “14px 18px”, color: “#fff”, fontSize: “16px”, textAlign: “left”, cursor: selected ? “default” : “pointer”, transition: “all 0.2s”, fontFamily: “‘Nunito’, sans-serif”, display: “flex”, alignItems: “center”, gap: “12px” }}>
<span style={{ fontSize: “24px” }}>{opt.flag}</span> {opt.country}
</button>
);
})}
</div>
{showFact && (
<div style={{ margin: “16px 20px”, background: “rgba(0,147,233,0.15)”, border: “1px solid rgba(0,147,233,0.3)”, borderRadius: “12px”, padding: “12px 16px”, animation: “popIn 0.3s ease” }}>
<div style={{ color: “#80D0C7”, fontWeight: 700, fontSize: “13px”, marginBottom: “4px” }}>🌍 DID YOU KNOW?</div>
<div style={{ color: “#b0e0d8”, fontSize: “14px”, lineHeight: 1.5 }}>{r.correct.funFact}</div>
<div style={{ color: “rgba(255,255,255,0.4)”, fontSize: “12px”, marginTop: “4px” }}>Capital: {r.correct.capital} • Continent: {r.correct.continent}</div>
</div>
)}
{selected !== null && <button onClick={nextRound} style={{ …styles.playAgainBtn, margin: “12px 20px 0”, display: “block”, width: “calc(100% - 40px)”, background: “rgba(255,255,255,0.9)”, color: “#333” }}>{round >= totalRounds - 1 ? “See Results” : “Next →”}</button>}
</div>
);
}

// ─── PATTERN PUZZLE GAME ───
function generatePattern() {
const types = [“arithmetic”, “geometric”, “square”, “fibonacci_like”, “alternating”, “triangular”];
const type = types[Math.floor(Math.random() * types.length)];
let seq = [], answer, hint;

switch (type) {
case “arithmetic”: { const s = Math.floor(Math.random() * 20) + 1; const d = Math.floor(Math.random() * 8) + 2; seq = Array.from({ length: 5 }, (*, i) => s + d * i); answer = s + d * 5; hint = `Each number increases by ${d}`; break; }
case “geometric”: { const s = Math.floor(Math.random() * 4) + 2; const r = Math.floor(Math.random() * 2) + 2; seq = Array.from({ length: 5 }, (*, i) => s * Math.pow(r, i)); answer = s * Math.pow(r, 5); hint = `Each number is multiplied by ${r}`; break; }
case “square”: { const o = Math.floor(Math.random() * 3); seq = Array.from({ length: 5 }, (*, i) => (i + 1 + o) * (i + 1 + o)); answer = (6 + o) * (6 + o); hint = “These are square numbers (n × n)”; break; }
case “fibonacci_like”: { const a = Math.floor(Math.random() * 5) + 1; const b = Math.floor(Math.random() * 5) + a; seq = [a, b]; for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]); answer = seq.pop(); hint = “Add the last two numbers to get the next”; break; }
case “alternating”: { const s1 = Math.floor(Math.random() * 10) + 1; const d1 = Math.floor(Math.random() * 5) + 2; const d2 = Math.floor(Math.random() * 5) + 2; seq = Array.from({ length: 5 }, (*, i) => i % 2 === 0 ? s1 + (Math.floor(i / 2)) * d1 : s1 + 10 + (Math.floor(i / 2)) * d2); answer = seq[4] + d1; hint = “Look at every other number separately”; break; }
case “triangular”: { seq = Array.from({ length: 5 }, (_, i) => ((i + 1) * (i + 2)) / 2); answer = (6 * 7) / 2; hint = “These are triangular numbers”; break; }
}
const wrong = new Set();
while (wrong.size < 3) { const off = Math.floor(Math.random() * 10) - 5; if (off !== 0 && answer + off > 0) wrong.add(answer + off); }
return { sequence: seq, answer, options: [answer, …wrong].sort(() => Math.random() - 0.5), hint, type };
}

function PatternPuzzle({ onBack }) {
const [round, setRound] = useState(1);
const [score, setScore] = useState(0);
const [puzzle, setPuzzle] = useState(() => generatePattern());
const [selected, setSelected] = useState(null);
const [showHint, setShowHint] = useState(false);
const [hintUsed, setHintUsed] = useState(false);
const [showConfetti, setShowConfetti] = useState(false);
const [gameOver, setGameOver] = useState(false);
const totalRounds = 10;

const handleSelect = (val) => {
if (selected !== null) return; setSelected(val);
if (val === puzzle.answer) { setScore(s => s + (hintUsed ? 7 : 12)); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 1500); }
};
const nextRound = () => { if (round >= totalRounds) setGameOver(true); else { setRound(r => r + 1); setPuzzle(generatePattern()); setSelected(null); setShowHint(false); setHintUsed(false); } };

if (gameOver) return (
<GameResult emoji=“🔢” title=“Pattern Pro, Ifra!” score={`${score}/${totalRounds * 12}`}
subtitle={score >= 90 ? “Incredible logic!” : “Great pattern thinking!”}
gradient=“linear-gradient(135deg, #F7971E 0%, #FFD200 100%)” darkText
onRetry={() => { setRound(1); setScore(0); setPuzzle(generatePattern()); setSelected(null); setShowHint(false); setHintUsed(false); setGameOver(false); }} onBack={onBack} showConfetti={score >= 60} />
);

return (
<div style={styles.gameContainer}>
<Confetti active={showConfetti} />
<GameHeader onBack={onBack} stats={[{ icon: “🔢”, val: `${round}/${totalRounds}` }, { icon: “⭐”, val: score, highlight: true }]} />
<div style={{ textAlign: “center”, padding: “20px 20px 10px” }}>
<h3 style={{ color: “#FFE66D”, fontSize: “18px”, fontFamily: “‘Fredoka’, sans-serif”, margin: “0 0 20px” }}>What comes next?</h3>
<div style={{ display: “flex”, justifyContent: “center”, gap: “8px”, flexWrap: “wrap”, marginBottom: “12px” }}>
{puzzle.sequence.map((n, i) => (
<div key={i} style={{ width: “52px”, height: “52px”, borderRadius: “12px”, background: “linear-gradient(135deg, rgba(247,151,30,0.3), rgba(255,210,0,0.15))”, border: “2px solid rgba(255,210,0,0.3)”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: “20px”, fontWeight: 700, color: “#FFD200”, fontFamily: “‘Fredoka’, sans-serif” }}>{n}</div>
))}
<div style={{ width: “52px”, height: “52px”, borderRadius: “12px”, background: selected !== null ? (selected === puzzle.answer ? “linear-gradient(135deg, #4ECDC4, #45B7D1)” : “linear-gradient(135deg, #FF6B6B, #ee5a5a)”) : “rgba(255,255,255,0.05)”, border: “2px dashed rgba(255,255,255,0.3)”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: “22px”, fontWeight: 700, color: “#fff”, fontFamily: “‘Fredoka’, sans-serif”, animation: selected === null ? “pulse 2s ease-in-out infinite” : “none” }}>
{selected !== null ? puzzle.answer : “?”}
</div>
</div>
{!showHint && selected === null && (
<button onClick={() => { setShowHint(true); setHintUsed(true); }} style={{ background: “none”, border: “1px dashed rgba(255,255,255,0.3)”, color: “#FFE66D”, padding: “6px 16px”, borderRadius: “20px”, cursor: “pointer”, fontSize: “13px”, marginBottom: “10px” }}>💡 Show Hint (-5 pts)</button>
)}
{showHint && <div style={{ background: “rgba(78,205,196,0.15)”, padding: “8px 16px”, borderRadius: “10px”, color: “#4ECDC4”, fontSize: “14px”, marginBottom: “10px” }}>💡 {puzzle.hint}</div>}
</div>
<div style={{ …styles.optionsGrid, padding: “0 20px” }}>
{puzzle.options.map((opt, i) => {
let bg = “rgba(255,255,255,0.08)”, border = “rgba(255,255,255,0.12)”;
if (selected !== null) { if (opt === puzzle.answer) { bg = “rgba(78,205,196,0.25)”; border = “#4ECDC4”; } else if (opt === selected) { bg = “rgba(255,107,107,0.25)”; border = “#FF6B6B”; } }
return <button key={i} onClick={() => handleSelect(opt)} style={{ …styles.optionBtn, background: bg, borderColor: border, fontSize: “22px” }}>{opt}</button>;
})}
</div>
{selected !== null && (
<>
<div style={{ textAlign: “center”, fontSize: “20px”, marginTop: “12px”, animation: “popIn 0.3s ease” }}>{selected === puzzle.answer ? “✨ Correct!” : `❌ It was ${puzzle.answer}`}</div>
<button onClick={nextRound} style={{ …styles.playAgainBtn, margin: “12px 20px 0”, display: “block”, width: “calc(100% - 40px)”, background: “rgba(255,255,255,0.9)”, color: “#333” }}>{round >= totalRounds ? “See Results” : “Next Pattern →”}</button>
</>
)}
</div>
);
}

// ─── SPEED SPELLER GAME ───
const SPELLING_WORDS = [
{ word: “BEAUTIFUL”, hint: “Very pretty or attractive” },
{ word: “NECESSARY”, hint: “Something you must have” },
{ word: “DIFFERENT”, hint: “Not the same” },
{ word: “TOMORROW”, hint: “The day after today” },
{ word: “KNOWLEDGE”, hint: “What you gain from learning” },
{ word: “SURPRISE”, hint: “Something unexpected” },
{ word: “BEGINNING”, hint: “The start of something” },
{ word: “CALENDAR”, hint: “Shows dates and months” },
{ word: “FAVOURITE”, hint: “The one you like the most” },
{ word: “IMPORTANT”, hint: “Something that matters a lot” },
{ word: “EXCELLENT”, hint: “Extremely good” },
{ word: “DISAPPEAR”, hint: “To vanish from sight” },
{ word: “EXERCISE”, hint: “Physical activity for fitness” },
{ word: “LANGUAGE”, hint: “What people speak” },
{ word: “STRENGTH”, hint: “Being powerful or strong” },
{ word: “RESTAURANT”, hint: “A place to eat out” },
{ word: “SEPARATE”, hint: “To divide apart” },
{ word: “VEGETABLE”, hint: “A healthy food like carrot” },
{ word: “WEDNESDAY”, hint: “The middle day of the week” },
{ word: “ENVIRONMENT”, hint: “The natural world around us” },
];

function SpeedSpeller({ onBack }) {
const [round, setRound] = useState(1);
const [score, setScore] = useState(0);
const [wordData, setWordData] = useState(null);
const [input, setInput] = useState(””);
const [feedback, setFeedback] = useState(null);
const [showWord, setShowWord] = useState(true);
const [gameOver, setGameOver] = useState(false);
const [showConfetti, setShowConfetti] = useState(false);
const [timer, setTimer] = useState(3);
const inputRef = useRef(null);
const totalRounds = 8;
const timerRef = useRef(null);

const loadWord = useCallback(() => {
const w = SPELLING_WORDS[Math.floor(Math.random() * SPELLING_WORDS.length)];
setWordData(w); setInput(””); setFeedback(null); setShowWord(true); setTimer(3);
}, []);

useEffect(() => { loadWord(); }, [loadWord]);

useEffect(() => {
if (!showWord || !wordData) return;
timerRef.current = setInterval(() => {
setTimer(t => {
if (t <= 1) { clearInterval(timerRef.current); setShowWord(false); setTimeout(() => inputRef.current?.focus(), 100); return 0; }
return t - 1;
});
}, 1000);
return () => clearInterval(timerRef.current);
}, [showWord, wordData]);

const handleSubmit = () => {
if (!input.trim() || feedback) return;
const correct = input.trim().toUpperCase() === wordData.word;
if (correct) { setScore(s => s + 15); setFeedback(“correct”); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 1500); }
else setFeedback(“wrong”);
setTimeout(() => { if (round >= totalRounds) setGameOver(true); else { setRound(r => r + 1); loadWord(); } }, 1500);
};

if (gameOver) return (
<GameResult emoji=“✏️” title=“Spelling Star, Ifra!” score={`${score}/${totalRounds * 15}`}
subtitle={score >= 90 ? “Perfect speller!” : “Keep practising!”}
gradient=“linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)”
onRetry={() => { setRound(1); setScore(0); setGameOver(false); loadWord(); }} onBack={onBack} showConfetti={score >= 60} />
);

return (
<div style={styles.gameContainer}>
<Confetti active={showConfetti} />
<GameHeader onBack={onBack} stats={[{ icon: “✏️”, val: `${round}/${totalRounds}` }, { icon: “⭐”, val: score, highlight: true }]} />
<div style={{ padding: “20px”, textAlign: “center” }}>
<div style={{ background: “rgba(161,140,209,0.15)”, padding: “8px 16px”, borderRadius: “10px”, color: “#fbc2eb”, fontSize: “14px”, marginBottom: “16px” }}>💡 {wordData?.hint}</div>
{showWord ? (
<div style={{ animation: “popIn 0.3s ease” }}>
<div style={{ color: “rgba(255,255,255,0.5)”, fontSize: “14px”, marginBottom: “8px” }}>Memorise this word! ({timer}s)</div>
<div style={{ fontSize: “36px”, fontWeight: 800, fontFamily: “‘Fredoka’, sans-serif”, color: “#FFE66D”, letterSpacing: “6px”, padding: “20px”, background: “rgba(255,230,109,0.1)”, borderRadius: “16px”, border: “2px solid rgba(255,230,109,0.2)” }}>{wordData?.word}</div>
<div style={{ marginTop: “16px” }}>
<div style={{ width: “60px”, height: “60px”, borderRadius: “50%”, background: “rgba(255,255,255,0.1)”, display: “inline-flex”, alignItems: “center”, justifyContent: “center”, fontSize: “28px”, fontWeight: 800, color: “#FFE66D”, fontFamily: “‘Fredoka’, sans-serif” }}>{timer}</div>
</div>
</div>
) : (
<div style={{ animation: “fadeUp 0.3s ease” }}>
<div style={{ color: “#A855F7”, fontSize: “16px”, marginBottom: “16px”, fontWeight: 600 }}>Now spell it!</div>
<input ref={inputRef} value={input} onChange={e => setInput(e.target.value.toUpperCase())}
onKeyDown={e => e.key === “Enter” && handleSubmit()}
style={{ width: “100%”, padding: “16px”, fontSize: “24px”, fontWeight: 700, fontFamily: “‘Fredoka’, sans-serif”, textAlign: “center”, background: “rgba(255,255,255,0.08)”, border: “2px solid rgba(255,255,255,0.15)”, borderRadius: “14px”, color: “#fff”, outline: “none”, letterSpacing: “4px”, caretColor: “#FFE66D” }}
placeholder=“Type here…” autoFocus maxLength={wordData?.word.length + 2} />
<button onClick={handleSubmit} disabled={!input.trim()} style={{ …styles.playAgainBtn, margin: “16px auto 0”, display: “block”, width: “100%”, background: input.trim() ? “rgba(255,255,255,0.9)” : “rgba(255,255,255,0.2)”, color: “#333”, cursor: input.trim() ? “pointer” : “default” }}>Check Spelling ✓</button>
</div>
)}
{feedback && (
<div style={{ marginTop: “16px”, animation: “popIn 0.3s ease” }}>
{feedback === “correct” ? (
<div style={{ color: “#4ECDC4”, fontSize: “22px”, fontWeight: 700 }}>✨ Perfect Spelling!</div>
) : (
<div>
<div style={{ color: “#FF6B6B”, fontSize: “18px”, fontWeight: 600 }}>Not quite!</div>
<div style={{ color: “#FFE66D”, fontSize: “20px”, fontWeight: 700, marginTop: “6px”, letterSpacing: “3px” }}>Correct: {wordData?.word}</div>
</div>
)}
</div>
)}
</div>
</div>
);
}

// ─── SCIENCE SORT GAME ───
const SORT_CHALLENGES = [
{ title: “Solids, Liquids or Gases?”, categories: [“Solid”, “Liquid”, “Gas”],
items: [
{ name: “Ice Cube 🧊”, cat: “Solid” }, { name: “Water 💧”, cat: “Liquid” }, { name: “Steam ♨️”, cat: “Gas” },
{ name: “Rock 🪨”, cat: “Solid” }, { name: “Milk 🥛”, cat: “Liquid” }, { name: “Oxygen 💨”, cat: “Gas” },
{ name: “Wood 🪵”, cat: “Solid” }, { name: “Juice 🧃”, cat: “Liquid” }, { name: “Helium 🎈”, cat: “Gas” },
]},
{ title: “Herbivore, Carnivore or Omnivore?”, categories: [“Herbivore”, “Carnivore”, “Omnivore”],
items: [
{ name: “Cow 🐄”, cat: “Herbivore” }, { name: “Lion 🦁”, cat: “Carnivore” }, { name: “Bear 🐻”, cat: “Omnivore” },
{ name: “Rabbit 🐰”, cat: “Herbivore” }, { name: “Eagle 🦅”, cat: “Carnivore” }, { name: “Human 🧑”, cat: “Omnivore” },
{ name: “Deer 🦌”, cat: “Herbivore” }, { name: “Shark 🦈”, cat: “Carnivore” }, { name: “Pig 🐷”, cat: “Omnivore” },
]},
{ title: “Renewable or Non-Renewable Energy?”, categories: [“Renewable”, “Non-Renewable”],
items: [
{ name: “Solar ☀️”, cat: “Renewable” }, { name: “Coal ⛏️”, cat: “Non-Renewable” },
{ name: “Wind 💨”, cat: “Renewable” }, { name: “Oil 🛢️”, cat: “Non-Renewable” },
{ name: “Hydro 🌊”, cat: “Renewable” }, { name: “Natural Gas 🔥”, cat: “Non-Renewable” },
{ name: “Geothermal 🌋”, cat: “Renewable” }, { name: “Nuclear ☢️”, cat: “Non-Renewable” },
]},
{ title: “Vertebrate or Invertebrate?”, categories: [“Vertebrate”, “Invertebrate”],
items: [
{ name: “Dog 🐕”, cat: “Vertebrate” }, { name: “Jellyfish 🪼”, cat: “Invertebrate” },
{ name: “Snake 🐍”, cat: “Vertebrate” }, { name: “Butterfly 🦋”, cat: “Invertebrate” },
{ name: “Frog 🐸”, cat: “Vertebrate” }, { name: “Spider 🕷️”, cat: “Invertebrate” },
{ name: “Parrot 🦜”, cat: “Vertebrate” }, { name: “Worm 🪱”, cat: “Invertebrate” },
]},
{ title: “Conductor or Insulator?”, categories: [“Conductor”, “Insulator”],
items: [
{ name: “Copper Wire 🔌”, cat: “Conductor” }, { name: “Rubber 🧤”, cat: “Insulator” },
{ name: “Iron Nail 🔩”, cat: “Conductor” }, { name: “Plastic 🥤”, cat: “Insulator” },
{ name: “Gold Ring 💍”, cat: “Conductor” }, { name: “Wood 🪵”, cat: “Insulator” },
{ name: “Silver Coin 🪙”, cat: “Conductor” }, { name: “Glass 🪟”, cat: “Insulator” },
]},
];

function ScienceSort({ onBack }) {
const [challengeIdx, setChallengeIdx] = useState(0);
const [roundNum, setRoundNum] = useState(1);
const [score, setScore] = useState(0);
const [currentItem, setCurrentItem] = useState(null);
const [remaining, setRemaining] = useState([]);
const [feedback, setFeedback] = useState(null);
const [sorted, setSorted] = useState({});
const [showConfetti, setShowConfetti] = useState(false);
const [gameOver, setGameOver] = useState(false);
const [roundComplete, setRoundComplete] = useState(false);
const totalRounds = 4;
const [challenges] = useState(() => […SORT_CHALLENGES].sort(() => Math.random() - 0.5).slice(0, totalRounds));

const startRound = useCallback((idx) => {
const ch = challenges[idx];
const shuffled = […ch.items].sort(() => Math.random() - 0.5);
setRemaining(shuffled.slice(1)); setCurrentItem(shuffled[0]); setFeedback(null);
const s = {}; ch.categories.forEach(c => s[c] = []); setSorted(s); setRoundComplete(false);
}, [challenges]);

useEffect(() => { if (challenges.length) startRound(0); }, [challenges, startRound]);

const handleSort = (cat) => {
if (feedback || !currentItem) return;
const correct = currentItem.cat === cat;
if (correct) { setScore(s => s + 10); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 800); }
setFeedback(correct ? “correct” : “wrong”);
setSorted(prev => ({ …prev, [currentItem.cat]: […(prev[currentItem.cat] || []), currentItem] }));
setTimeout(() => {
if (remaining.length > 0) { setCurrentItem(remaining[0]); setRemaining(r => r.slice(1)); setFeedback(null); }
else { setRoundComplete(true); setFeedback(null); }
}, 600);
};

const nextChallenge = () => {
if (roundNum >= totalRounds) setGameOver(true);
else { const next = roundNum; setChallengeIdx(next); setRoundNum(r => r + 1); startRound(next); }
};

if (gameOver) return (
<GameResult emoji="🔬" title="Science Sorter, Ifra!" score={score}
subtitle={score >= 120 ? “Amazing scientist!” : “Great sorting skills!”}
gradient=“linear-gradient(135deg, #11998e 0%, #38ef7d 100%)” darkText
onRetry={() => { setChallengeIdx(0); setRoundNum(1); setScore(0); setGameOver(false); startRound(0); }} onBack={onBack} showConfetti={score >= 80} />
);

const ch = challenges[challengeIdx];
const catColors = [”#FF6B6B”, “#4ECDC4”, “#A855F7”];

return (
<div style={styles.gameContainer}>
<Confetti active={showConfetti} />
<GameHeader onBack={onBack} stats={[{ icon: “🔬”, val: `${roundNum}/${totalRounds}` }, { icon: “⭐”, val: score, highlight: true }]} />
<div style={{ padding: “12px 20px 0”, textAlign: “center” }}>
<h3 style={{ color: “#38ef7d”, fontSize: “18px”, fontFamily: “‘Fredoka’, sans-serif”, margin: “0 0 16px” }}>{ch?.title}</h3>
</div>
<div style={{ display: “flex”, gap: “8px”, padding: “0 16px”, marginBottom: “16px” }}>
{ch?.categories.map((cat, i) => (
<button key={cat} onClick={() => handleSort(cat)} disabled={roundComplete}
style={{ flex: 1, padding: “12px 6px”, borderRadius: “14px”, background: `${catColors[i % 3]}22`, border: `2px solid ${catColors[i % 3]}44`, color: catColors[i % 3], fontSize: “14px”, fontWeight: 700, fontFamily: “‘Fredoka’, sans-serif”, cursor: roundComplete ? “default” : “pointer”, transition: “all 0.2s”, textAlign: “center”, minHeight: “60px” }}>
{cat}
<div style={{ fontSize: “11px”, color: “rgba(255,255,255,0.4)”, marginTop: “4px”, fontWeight: 400 }}>{(sorted[cat] || []).length} items</div>
</button>
))}
</div>
{!roundComplete && currentItem && (
<div style={{ textAlign: “center”, padding: “0 20px” }}>
<div style={{ fontSize: “14px”, color: “rgba(255,255,255,0.4)”, marginBottom: “8px” }}>Tap the right category for:</div>
<div style={{ display: “inline-block”, padding: “16px 28px”, borderRadius: “16px”, background: “linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))”, border: “2px solid rgba(255,255,255,0.15)”, fontSize: “20px”, fontWeight: 700, color: “#fff”, fontFamily: “‘Fredoka’, sans-serif”, animation: “popIn 0.3s ease” }}>{currentItem.name}</div>
<div style={{ color: “rgba(255,255,255,0.3)”, fontSize: “13px”, marginTop: “8px” }}>{remaining.length + 1} items left</div>
</div>
)}
{feedback && !roundComplete && (
<div style={{ textAlign: “center”, fontSize: “20px”, marginTop: “10px”, animation: “popIn 0.2s ease” }}>
{feedback === “correct” ? “✅ Right!” : `❌ It's ${currentItem?.cat}`}
</div>
)}
{roundComplete && (
<div style={{ textAlign: “center”, padding: “20px”, animation: “popIn 0.3s ease” }}>
<div style={{ fontSize: “24px”, marginBottom: “8px” }}>🎉 Round Complete!</div>
<div style={{ display: “flex”, gap: “8px”, padding: “0 4px”, marginTop: “12px” }}>
{ch?.categories.map((cat, ci) => (
<div key={cat} style={{ flex: 1, background: `${catColors[ci % 3]}15`, borderRadius: “10px”, padding: “8px 4px” }}>
<div style={{ fontSize: “12px”, fontWeight: 700, color: catColors[ci % 3], marginBottom: “4px” }}>{cat}</div>
{(sorted[cat] || []).map((it, j) => (<div key={j} style={{ fontSize: “11px”, color: “rgba(255,255,255,0.6)”, padding: “2px 0” }}>{it.name}</div>))}
</div>
))}
</div>
<button onClick={nextChallenge} style={{ …styles.playAgainBtn, margin: “16px auto 0”, display: “block”, width: “100%”, background: “rgba(255,255,255,0.9)”, color: “#333” }}>{roundNum >= totalRounds ? “See Results” : “Next Challenge →”}</button>
</div>
)}
</div>
);
}

// ─── SHARED COMPONENTS ───
function GameHeader({ onBack, stats }) {
return (
<div style={styles.gameHeader}>
<button onClick={onBack} style={styles.backArrow}>← Back</button>
<div style={{ display: “flex”, gap: “12px”, alignItems: “center”, flexWrap: “wrap” }}>
{stats.map((s, i) => (<div key={i} style={{ …styles.statBadge, …(s.highlight ? { background: “#FFE66D”, color: “#333” } : {}) }}>{s.icon} {s.val}</div>))}
</div>
</div>
);
}

function GameResult({ emoji, title, score, subtitle, gradient, onRetry, onBack, showConfetti: sc = true, darkText = false }) {
const textColor = darkText ? “#1a3a2a” : “#fff”;
const subColor = darkText ? “#2a5a3a” : “rgba(255,255,255,0.8)”;
return (
<div style={styles.gameContainer}>
<Confetti active={sc} />
<div style={{ …styles.resultCard, background: gradient }}>
<div style={{ fontSize: “56px”, marginBottom: “10px” }}>{emoji}</div>
<h2 style={{ color: textColor, fontSize: “26px”, margin: “0 0 8px”, fontFamily: “‘Fredoka’, sans-serif” }}>{title}</h2>
<div style={{ color: subColor, fontSize: “16px” }}>Score</div>
<div style={{ color: darkText ? “#333” : “#FFE66D”, fontSize: “50px”, fontWeight: 800, fontFamily: “‘Fredoka’, sans-serif” }}>{score}</div>
{subtitle && <div style={{ color: subColor, fontSize: “14px”, marginTop: “2px” }}>{subtitle}</div>}
<div style={{ display: “flex”, gap: “12px”, marginTop: “20px”, justifyContent: “center” }}>
<button onClick={onRetry} style={styles.playAgainBtn}>Play Again</button>
<button onClick={onBack} style={{ …styles.backBtnLight, borderColor: textColor, color: textColor }}>Home</button>
</div>
</div>
</div>
);
}

// ─── HOME SCREEN ───
function HomeScreen({ onSelectGame }) {
const games = [
{ id: GAMES.MATH_BLAST, name: “Math Blast”, emoji: “🧮”, desc: “Solve fast, score big!”, gradient: “linear-gradient(135deg, #667eea 0%, #764ba2 100%)”, color: “#667eea” },
{ id: GAMES.WORD_SCRAMBLE, name: “Word Scramble”, emoji: “🔤”, desc: “Unscramble letters!”, gradient: “linear-gradient(135deg, #f093fb 0%, #f5576c 100%)”, color: “#f093fb” },
{ id: GAMES.QUIZ_QUEST, name: “Quiz Quest”, emoji: “🧠”, desc: “Test your knowledge!”, gradient: “linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)”, color: “#43e97b” },
{ id: GAMES.MEMORY_MATCH, name: “Memory Match”, emoji: “🃏”, desc: “Find matching pairs!”, gradient: “linear-gradient(135deg, #fa709a 0%, #fee140 100%)”, color: “#fa709a” },
{ id: GAMES.FLAG_FINDER, name: “Flag Finder”, emoji: “🌍”, desc: “Explore the world!”, gradient: “linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)”, color: “#0093E9” },
{ id: GAMES.PATTERN_PUZZLE, name: “Pattern Puzzle”, emoji: “🔢”, desc: “Crack the sequence!”, gradient: “linear-gradient(135deg, #F7971E 0%, #FFD200 100%)”, color: “#F7971E” },
{ id: GAMES.SPEED_SPELLER, name: “Speed Speller”, emoji: “✏️”, desc: “Memorise & spell!”, gradient: “linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)”, color: “#a18cd1” },
{ id: GAMES.SCIENCE_SORT, name: “Science Sort”, emoji: “🔬”, desc: “Classify like a pro!”, gradient: “linear-gradient(135deg, #11998e 0%, #38ef7d 100%)”, color: “#11998e” },
];

return (
<div style={{ padding: “0 16px 30px”, animation: “fadeUp 0.5s ease” }}>
<div style={{ textAlign: “center”, padding: “28px 0 18px” }}>
<div style={{ fontSize: “42px”, marginBottom: “2px”, animation: “float 3s ease-in-out infinite” }}>🎮</div>
<h1 style={{ fontFamily: “‘Fredoka’, sans-serif”, fontSize: “30px”, fontWeight: 700, background: “linear-gradient(135deg, #FFE66D, #FF85A2, #A855F7, #4ECDC4)”, WebkitBackgroundClip: “text”, WebkitTextFillColor: “transparent”, margin: “0” }}>Ifra’s Learning Arcade</h1>
<p style={{ color: “rgba(255,255,255,0.5)”, fontSize: “14px”, margin: “5px 0 0”, fontFamily: “‘Nunito’, sans-serif” }}>Class 5 • Lexicon School • 8 Games!</p>
</div>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: “12px” }}>
{games.map((game, i) => (
<button key={game.id} onClick={() => onSelectGame(game.id)}
style={{ background: game.gradient, border: “none”, borderRadius: “18px”, padding: “18px 14px”, cursor: “pointer”, textAlign: “left”, position: “relative”, overflow: “hidden”, animation: `fadeUp 0.4s ease ${i * 0.06}s both`, transition: “transform 0.2s ease, box-shadow 0.2s ease”, boxShadow: `0 6px 20px ${game.color}33` }}
onMouseEnter={e => { e.currentTarget.style.transform = “translateY(-3px) scale(1.02)”; e.currentTarget.style.boxShadow = `0 10px 28px ${game.color}55`; }}
onMouseLeave={e => { e.currentTarget.style.transform = “translateY(0) scale(1)”; e.currentTarget.style.boxShadow = `0 6px 20px ${game.color}33`; }}>
<div style={{ position: “absolute”, top: “-10px”, right: “-10px”, fontSize: “60px”, opacity: 0.15, transform: “rotate(15deg)” }}>{game.emoji}</div>
<div style={{ fontSize: “32px”, marginBottom: “6px” }}>{game.emoji}</div>
<div style={{ color: “#fff”, fontSize: “15px”, fontWeight: 700, fontFamily: “‘Fredoka’, sans-serif”, position: “relative” }}>{game.name}</div>
<div style={{ color: “rgba(255,255,255,0.8)”, fontSize: “11px”, marginTop: “2px”, fontFamily: “‘Nunito’, sans-serif”, position: “relative” }}>{game.desc}</div>
</button>
))}
</div>
<div style={{ marginTop: “20px”, textAlign: “center”, padding: “12px”, background: “rgba(255,255,255,0.05)”, borderRadius: “14px”, border: “1px solid rgba(255,255,255,0.08)” }}>
<span style={{ color: “rgba(255,255,255,0.4)”, fontSize: “13px” }}>✨ Made with love for Ifra ✨</span>
</div>
</div>
);
}

// ─── MAIN APP ───
export default function App() {
const [currentGame, setCurrentGame] = useState(GAMES.HOME);

return (
<div style={{ minHeight: “100vh”, background: “linear-gradient(160deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)”, color: “#fff”, fontFamily: “‘Nunito’, sans-serif”, maxWidth: “480px”, margin: “0 auto”, position: “relative”, overflow: “hidden” }}>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>{`@keyframes confettiFall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } } @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } } @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } * { box-sizing: border-box; } button:active { transform: scale(0.96) !important; } input::placeholder { color: rgba(255,255,255,0.3); }`}</style>
<div style={{ position: “absolute”, width: “300px”, height: “300px”, borderRadius: “50%”, background: “radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)”, top: “-100px”, right: “-100px” }} />
<div style={{ position: “absolute”, width: “200px”, height: “200px”, borderRadius: “50%”, background: “radial-gradient(circle, rgba(78,205,196,0.06), transparent 70%)”, bottom: “100px”, left: “-60px” }} />

```
  {currentGame === GAMES.HOME && <HomeScreen onSelectGame={setCurrentGame} />}
  {currentGame === GAMES.MATH_BLAST && <MathBlast onBack={() => setCurrentGame(GAMES.HOME)} />}
  {currentGame === GAMES.WORD_SCRAMBLE && <WordScramble onBack={() => setCurrentGame(GAMES.HOME)} />}
  {currentGame === GAMES.QUIZ_QUEST && <QuizQuest onBack={() => setCurrentGame(GAMES.HOME)} />}
  {currentGame === GAMES.MEMORY_MATCH && <MemoryMatch onBack={() => setCurrentGame(GAMES.HOME)} />}
  {currentGame === GAMES.FLAG_FINDER && <FlagFinder onBack={() => setCurrentGame(GAMES.HOME)} />}
  {currentGame === GAMES.PATTERN_PUZZLE && <PatternPuzzle onBack={() => setCurrentGame(GAMES.HOME)} />}
  {currentGame === GAMES.SPEED_SPELLER && <SpeedSpeller onBack={() => setCurrentGame(GAMES.HOME)} />}
  {currentGame === GAMES.SCIENCE_SORT && <ScienceSort onBack={() => setCurrentGame(GAMES.HOME)} />}
</div>
```

);
}

// ─── SHARED STYLES ───
const styles = {
gameContainer: { padding: “0 0 30px”, animation: “fadeUp 0.4s ease”, minHeight: “100vh” },
gameHeader: { display: “flex”, justifyContent: “space-between”, alignItems: “center”, padding: “16px 16px 8px”, flexWrap: “wrap”, gap: “8px” },
backArrow: { background: “rgba(255,255,255,0.08)”, border: “1px solid rgba(255,255,255,0.1)”, color: “#fff”, padding: “6px 14px”, borderRadius: “10px”, cursor: “pointer”, fontSize: “14px”, fontFamily: “‘Nunito’, sans-serif” },
statBadge: { background: “rgba(255,255,255,0.1)”, padding: “5px 12px”, borderRadius: “20px”, fontSize: “14px”, fontWeight: 700, fontFamily: “‘Fredoka’, sans-serif”, color: “#fff”, whiteSpace: “nowrap” },
timerBar: { height: “4px”, borderRadius: “2px”, margin: “4px 16px”, transition: “width 1s linear, background 0.3s ease” },
problemArea: { display: “flex”, justifyContent: “center”, alignItems: “center”, padding: “40px 20px” },
problemText: { fontSize: “40px”, fontWeight: 800, fontFamily: “‘Fredoka’, sans-serif”, letterSpacing: “2px” },
optionsGrid: { display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: “12px”, padding: “0 20px” },
optionBtn: { padding: “18px”, borderRadius: “16px”, border: “2px solid rgba(255,255,255,0.15)”, color: “#fff”, fontSize: “22px”, fontWeight: 700, fontFamily: “‘Fredoka’, sans-serif”, cursor: “pointer”, transition: “all 0.2s ease”, background: “rgba(255,255,255,0.1)” },
resultCard: { margin: “40px 20px”, borderRadius: “24px”, padding: “32px 24px”, textAlign: “center”, animation: “popIn 0.4s ease”, boxShadow: “0 16px 48px rgba(0,0,0,0.3)” },
playAgainBtn: { background: “rgba(255,255,255,0.9)”, border: “none”, padding: “12px 28px”, borderRadius: “14px”, fontWeight: 700, fontSize: “15px”, cursor: “pointer”, fontFamily: “‘Fredoka’, sans-serif”, color: “#333” },
backBtnLight: { background: “transparent”, border: “2px solid rgba(255,255,255,0.5)”, padding: “10px 24px”, borderRadius: “14px”, fontWeight: 700, fontSize: “15px”, cursor: “pointer”, fontFamily: “‘Fredoka’, sans-serif”, color: “#fff” },
};
