
function generateConstrainedPattern(base) {
  const winPatterns = [];
  const count = randomInRange(1, 3);
  let totalWinCount = 0;

  for (let i = 0; i < count; i++) {
    const displayValue = randomInRange(5000, 15000);
    const costRate = Math.random() * 0.2 + 0.5; // 0.5 - 0.7
    const prizeCount = randomInRange(1, 4);
    totalWinCount += prizeCount;
    winPatterns.push({ displayValue, costRate, count: prizeCount });
  }

  const maxTickets = 200;
  const loseCount = Math.max(maxTickets - totalWinCount, 0);
  const losePatterns = [{ displayValue: 0, costRate: 0, count: loseCount }];

  const lastOne = {
    displayValue: randomInRange(3000, 8000),
    costRate: Math.random() * 0.2 + 0.5
  };

  return { ...base, winPatterns, losePatterns, lastOne };
}

function calculateWeightedScore(stats, target, weights = { win: 1, loss: 1, profit: 1, sellout: 1 }) {
  return (
    weights.win * Math.abs(stats.winRate - target.targetWinRate) +
    weights.loss * Math.abs(stats.lossRate - target.targetLossRate) +
    weights.profit * Math.abs(stats.profitAchieveRate - target.targetProfitAchieveRate) +
    weights.sellout * Math.abs(stats.selloutRate - target.targetSelloutRate)
  );
}
