// Chinh sach giam gia dua tren diem score

const TIERS = [
    [1000, 15],
    [500, 10],
    [100, 5],
    [0, 0],
];

function discountPercent(score) {
    for (const [minScore, pct] of TIERS) {
        if (score >= minScore) {
            return pct;
        }
    }

    return 0;
}

module.exports = { discountPercent };