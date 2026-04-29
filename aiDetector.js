/**
 * AI Content Detection Utility
 * Uses heuristic-based analysis to estimate the probability that text was AI-generated.
 * 
 * Signals analyzed:
 *  1. AI Signature Phrases (common ChatGPT/AI patterns)
 *  2. Transition Word Density
 *  3. Sentence Length Uniformity (AI text has very low variance)
 *  4. Formal Vocabulary Usage
 *  5. Burstiness (human text is "bursty"; AI is uniform)
 */

const AI_PHRASES = [
    "it is important to note", "it's important to note",
    "it is worth noting", "it's worth noting",
    "in conclusion", "to summarize", "in summary",
    "furthermore", "moreover", "additionally",
    "it should be noted", "it is essential to",
    "it is crucial to", "play a crucial role",
    "plays a pivotal role", "in today's world",
    "in today's rapidly", "in this essay", "in this paper",
    "first and foremost", "last but not least",
    "on the other hand", "in light of",
    "as previously mentioned", "as mentioned earlier",
    "a wide range of", "a variety of",
    "it is undeniable that", "needless to say",
    "it is evident that", "it is clear that",
    "this ensures that", "which in turn",
    "in order to", "with respect to",
    "as an ai", "i cannot", "i am an ai",
    "delve into", "deep dive", "at its core",
    "revolutionize", "game-changer", "paradigm shift",
    "leveraging", "synergy", "holistic approach",
    "cutting-edge", "state-of-the-art",
    "in the realm of", "when it comes to",
    "it goes without saying", "by and large"
];

const TRANSITION_WORDS = [
    "however", "therefore", "consequently", "nevertheless",
    "furthermore", "moreover", "additionally", "subsequently",
    "accordingly", "thus", "hence", "nonetheless",
    "meanwhile", "alternatively", "similarly", "likewise",
    "conversely", "in contrast", "as a result", "in addition"
];

const FORMAL_AI_VOCAB = [
    "utilize", "facilitate", "implement", "demonstrate",
    "indicate", "significant", "substantial", "comprehensive",
    "fundamental", "essential", "crucial", "pivotal",
    "innovative", "sophisticated", "optimize", "enhance",
    "mitigate", "ascertain", "endeavor", "predominantly",
    "constitute", "encompasses", "illustrates", "necessitates"
];

/**
 * Tokenizes text into sentences.
 */
function getSentences(text) {
    return text
        .replace(/\n+/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
}

/**
 * Tokenizes text into words.
 */
function getWords(text) {
    return text.toLowerCase().match(/\b[a-z']+\b/g) || [];
}

/**
 * Standard deviation of an array of numbers.
 */
function stdDev(arr) {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

/**
 * Main AI detection function.
 * Returns a score from 0–100 with a breakdown.
 */
function detectAIContent(text) {
    if (!text || text.trim().length < 50) {
        return { score: 0, breakdown: {}, verdict: 'Too short to analyze', details: [] };
    }

    const lowerText = text.toLowerCase();
    const words = getWords(text);
    const sentences = getSentences(text);
    const wordCount = words.length;
    const details = [];
    let totalScore = 0;
    const breakdown = {};

    // ── 1. AI Signature Phrases ───────────────────────────────────────────
    const phrasesFound = AI_PHRASES.filter(p => lowerText.includes(p));
    const phraseScore = Math.min(100, (phrasesFound.length / 5) * 100);
    const phraseWeight = 0.35;
    breakdown['AI Phrases'] = {
        score: Math.round(phraseScore),
        found: phrasesFound.slice(0, 8),
        weight: '35%'
    };
    totalScore += phraseScore * phraseWeight;
    if (phrasesFound.length > 0) {
        details.push(`Found ${phrasesFound.length} AI-typical phrase(s): "${phrasesFound.slice(0, 3).join('", "')}"`);
    }

    // ── 2. Transition Word Density ─────────────────────────────────────────
    const transitionsFound = TRANSITION_WORDS.filter(t => lowerText.includes(t));
    const transitionDensity = wordCount > 0 ? (transitionsFound.length / wordCount) * 100 : 0;
    // Humans: ~0.5–1.5%, AI: 2–5%
    const transitionScore = Math.min(100, (transitionDensity / 3) * 100);
    const transitionWeight = 0.15;
    breakdown['Transition Words'] = {
        score: Math.round(transitionScore),
        density: transitionDensity.toFixed(2) + '%',
        weight: '15%'
    };
    totalScore += transitionScore * transitionWeight;
    if (transitionDensity > 1.5) {
        details.push(`High transition word density (${transitionDensity.toFixed(2)}%) — typical of AI.`);
    }

    // ── 3. Sentence Length Uniformity (Low Std Dev = More AI-like) ─────────
    const sentLengths = sentences.map(s => getWords(s).length);
    const sentStdDev = stdDev(sentLengths);
    const avgSentLen = sentLengths.length > 0
        ? sentLengths.reduce((a, b) => a + b, 0) / sentLengths.length
        : 0;
    // Human text: stdDev usually 7–15. AI text: stdDev usually 2–7
    const uniformityScore = Math.min(100, Math.max(0, (1 - (sentStdDev / 12)) * 100));
    const uniformityWeight = 0.25;
    breakdown['Sentence Uniformity'] = {
        score: Math.round(uniformityScore),
        avgLength: avgSentLen.toFixed(1) + ' words',
        stdDev: sentStdDev.toFixed(2),
        weight: '25%'
    };
    totalScore += uniformityScore * uniformityWeight;
    if (sentStdDev < 5) {
        details.push(`Very uniform sentence lengths (std dev: ${sentStdDev.toFixed(1)}) — characteristic of AI.`);
    }

    // ── 4. Formal AI Vocabulary ─────────────────────────────────────────────
    const formalWordsFound = FORMAL_AI_VOCAB.filter(w => lowerText.includes(w));
    const formalScore = Math.min(100, (formalWordsFound.length / 6) * 100);
    const formalWeight = 0.15;
    breakdown['Formal AI Vocabulary'] = {
        score: Math.round(formalScore),
        found: formalWordsFound.slice(0, 6),
        weight: '15%'
    };
    totalScore += formalScore * formalWeight;
    if (formalWordsFound.length > 3) {
        details.push(`Heavy use of formal AI vocabulary: "${formalWordsFound.slice(0, 4).join('", "')}"`);
    }

    // ── 5. Burstiness (Type-Token Ratio variance) ──────────────────────────
    // AI text has consistent TTR across chunks; human text is bursty
    const chunkSize = 50;
    const ttrScores = [];
    for (let i = 0; i < words.length - chunkSize; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize);
        const unique = new Set(chunk).size;
        ttrScores.push(unique / chunkSize);
    }
    const ttrStdDev = stdDev(ttrScores);
    // Low ttrStdDev = uniform = AI-like
    const burstinessScore = Math.min(100, Math.max(0, (1 - (ttrStdDev / 0.15)) * 100));
    const burstinessWeight = 0.10;
    breakdown['Text Burstiness'] = {
        score: Math.round(burstinessScore),
        ttrVariance: ttrStdDev.toFixed(4),
        weight: '10%'
    };
    totalScore += burstinessScore * burstinessWeight;

    // ── Final Score ─────────────────────────────────────────────────────────
    const finalScore = Math.round(Math.min(100, Math.max(0, totalScore)));

    let verdict;
    if (finalScore >= 75) verdict = 'Very Likely AI-Generated';
    else if (finalScore >= 55) verdict = 'Likely AI-Assisted';
    else if (finalScore >= 35) verdict = 'Possibly AI-Assisted';
    else verdict = 'Likely Human-Written';

    return {
        score: finalScore,
        verdict,
        breakdown,
        details,
        stats: {
            wordCount,
            sentenceCount: sentences.length,
            avgSentenceLength: avgSentLen.toFixed(1)
        }
    };
}

module.exports = { detectAIContent };
