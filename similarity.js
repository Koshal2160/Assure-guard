/**
 * Advanced Similarity Detection using multiple algorithms
 * 1. Jaccard Similarity (word-level)
 * 2. Cosine Similarity (term frequency)
 * 3. Longest Common Subsequence (LCS) ratio
 */

// Jaccard Similarity - measures intersection over union of word sets
function jaccardSimilarity(text1, text2) {
    const tokenize = (text) => {
        return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(word => word.length > 2));
    };

    const set1 = tokenize(text1);
    const set2 = tokenize(text2);

    if (set1.size === 0 && set2.size === 0) return 1.0;
    if (set1.size === 0 || set2.size === 0) return 0.0;

    let intersectionSize = 0;
    for (const item of set1) {
        if (set2.has(item)) {
            intersectionSize++;
        }
    }

    const unionSize = set1.size + set2.size - intersectionSize;
    return intersectionSize / unionSize;
}

// Cosine Similarity - TF-IDF based similarity
function cosineSimilarity(text1, text2) {
    const getTermFrequency = (text) => {
        const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
        const freq = {};
        words.forEach(word => {
            freq[word] = (freq[word] || 0) + 1;
        });
        return freq;
    };

    const freq1 = getTermFrequency(text1);
    const freq2 = getTermFrequency(text2);

    const allTerms = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
    if (allTerms.size === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const term of allTerms) {
        const f1 = freq1[term] || 0;
        const f2 = freq2[term] || 0;
        dotProduct += f1 * f2;
        norm1 += f1 * f1;
        norm2 += f2 * f2;
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

// Longest Common Subsequence Ratio
function lcsRatio(text1, text2) {
    const s1 = text1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = text2.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (s1.length === 0 && s2.length === 0) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    const lcs = getLCS(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    return lcs / maxLen;
}

// Helper function to calculate LCS length
function getLCS(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}

// Combined similarity score (weighted average)
function calculateSimilarity(text1, text2) {
    const jaccard = jaccardSimilarity(text1, text2);
    const cosine = cosineSimilarity(text1, text2);
    const lcs = lcsRatio(text1, text2);

    // Weighted average: 40% Jaccard, 40% Cosine, 20% LCS
    return (jaccard * 0.4) + (cosine * 0.4) + (lcs * 0.2);
}

module.exports = { calculateSimilarity, jaccardSimilarity, cosineSimilarity, lcsRatio };
