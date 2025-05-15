function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateTickets(settings) {
  const tickets = [];

  settings.winPatterns.forEach(pattern => {
    for (let i = 0; i < pattern.count; i++) {
      tickets.push({
        displayValue: pattern.displayValue,
        cost: pattern.displayValue * pattern.costRate,
        type: "win"
      });
    }
  });

  settings.losePatterns.forEach(pattern => {
    for (let i = 0; i < pattern.count; i++) {
      tickets.push({
        displayValue: pattern.displayValue,
        cost: pattern.displayValue * pattern.costRate,
        type: "lose"
      });
    }
  });

  shuffle(tickets);

  const last = tickets.pop();
  tickets.push({
    displayValue: last.displayValue + settings.lastOne.displayValue,
    cost: last.cost + settings.lastOne.displayValue * settings.lastOne.costRate,
    type: "lastone"
  });

  return tickets;
}

function generatePlayers(settings, totalTickets) {
  const players = [];
  players.push({ id: 1, type: "winner", budget: 0, gains: 0, purchases: 0 });

  const middleCount = settings.playerCount - 2;
  for (let i = 0; i < middleCount; i++) {
    players.push({ id: i + 2, type: "fixed", budget: 0, gains: 0, purchases: 0 });
  }

  players.push({ id: settings.playerCount, type: "lastWinner", budget: 0, gains: 0, purchases: 0 });
  return players;
}

function simulateSales(tickets, players, settings) {
  let ticketIndex = 0;

  for (const player of players) {
    while (ticketIndex < tickets.length) {
      const ticket = tickets[ticketIndex];
      const price = settings.betAmount;

      player.budget += price;
      player.gains += ticket.displayValue;
      player.purchases++;
      ticketIndex++;

      if (player.type === "fixed" && player.purchases >= settings.fixedPurchaseCount) break;
      if ((player.type === "winner" || player.type === "lastWinner") &&
          player.gains >= player.budget) break;

      if (ticketIndex >= tickets.length) break;
    }
  }
}

function evaluateResult(players, tickets, settings) {
  const totalRevenue = players.reduce((sum, p) => sum + p.budget, 0);
  const totalCost = tickets.reduce((sum, t) => sum + t.cost, 0);

  const profit = totalRevenue - totalCost;
  const profitRate = profit / totalRevenue;
  const playerProfitExists = players.some(p => p.gains > p.budget);

  return {
    isWin: totalRevenue > totalCost,
    isLoss: profit < 0,
    achievedProfitRate: profitRate >= settings.targetProfitRate,
    soldOut: tickets.length <= players.reduce((sum, p) => sum + p.purchases, 0),
    playerProfit: playerProfitExists
  };
}

function simulateOnce(settings) {
  const tickets = generateTickets(settings);
  const players = generatePlayers(settings, tickets.length);
  simulateSales(tickets, players, settings);
  return evaluateResult(players, tickets, settings);
}

function simulateMultipleTimes(settings, iterations = 10000) {
  let win = 0, loss = 0, profitOK = 0, sellout = 0, playerWin = 0;

  for (let i = 0; i < iterations; i++) {
    const result = simulateOnce(settings);
    if (result.isWin) win++;
    if (result.isLoss) loss++;
    if (result.achievedProfitRate) profitOK++;
    if (result.soldOut) sellout++;
    if (result.playerProfit) playerWin++;
  }

  return {
    winRate: (win / iterations) * 100,
    lossRate: (loss / iterations) * 100,
    profitAchieveRate: (profitOK / iterations) * 100,
    selloutRate: (sellout / iterations) * 100,
    playerProfitRate: (playerWin / iterations) * 100,
    totalSimulations: iterations
  };
}

function generateRandomPattern(base) {
  const winPatterns = [];
  const count = randomInRange(1, 3);
  for (let i = 0; i < count; i++) {
    const displayValue = randomInRange(1000, 20000);
    const costRate = Math.random() * 0.4 + 0.4;
    const prizeCount = randomInRange(1, 5);
    winPatterns.push({ displayValue, costRate, count: prizeCount });
  }

  const totalPrizes = winPatterns.reduce((sum, p) => sum + p.count, 0);
  const loseCount = 200 - totalPrizes;
  const losePatterns = [{ displayValue: 0, costRate: 0, count: loseCount }];

  const lastOne = {
    displayValue: randomInRange(1000, 10000),
    costRate: Math.random() * 0.4 + 0.4
  };

  return { ...base, winPatterns, losePatterns, lastOne };
}

function calculateScore(stats, target) {
  return (
    Math.abs(stats.winRate - target.targetWinRate) +
    Math.abs(stats.lossRate - target.targetLossRate) +
    Math.abs(stats.profitAchieveRate - target.targetProfitAchieveRate) +
    Math.abs(stats.selloutRate - target.targetSelloutRate)
  );
}

function findBestPattern(target) {
  let best = null, bestScore = Infinity;

  for (let i = 0; i < 100; i++) {
    const pattern = generateRandomPattern(target);
    const stats = simulateMultipleTimes(pattern, 10000);
    const score = calculateScore(stats, target);
    if (score < bestScore) {
      bestScore = score;
      best = { pattern, stats };
    }
  }

  return best;
}

function runSimulation() {
  const settings = {
    betAmount: Number(document.getElementById("betAmount").value),
    targetProfitRate: Number(document.getElementById("targetProfitRate").value),
    fixedPurchaseCount: Number(document.getElementById("fixedCount").value),
    playerCount: Number(document.getElementById("playerCount").value),
    targetWinRate: Number(document.getElementById("targetWinRate").value),
    targetLossRate: Number(document.getElementById("targetLossRate").value),
    targetProfitAchieveRate: Number(document.getElementById("targetProfitAchieveRate").value),
    targetSelloutRate: Number(document.getElementById("targetSelloutRate").value)
  };

  document.getElementById("resultArea").innerText = "シミュレーション中...";

  setTimeout(() => {
    const result = findBestPattern(settings);
    document.getElementById("resultArea").innerText = 
      "【統計】\n" +
      `運営勝率: ${result.stats.winRate.toFixed(1)}%\n` +
      `赤字率: ${result.stats.lossRate.toFixed(1)}%\n` +
      `目標利益達成率: ${result.stats.profitAchieveRate.toFixed(1)}%\n` +
      `完売率: ${result.stats.selloutRate.toFixed(1)}%\n` +
      `プレイヤー勝率（参考）: ${result.stats.playerProfitRate.toFixed(1)}%\n\n` +
      "【提案された景品構成】\n" +
      result.pattern.winPatterns.map(w => 
        `当たり: ${w.displayValue}円 × ${w.count}本（原価率: ${w.costRate}）`).join("\n") + "\n" +
      `ラストワン賞: ${result.pattern.lastOne.displayValue}円（原価率: ${result.pattern.lastOne.costRate}）`;
  }, 100);
}



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



function findBestPattern(target) {
  let best = null, bestScore = Infinity;

  const weights = {
    win: 1.0,
    loss: 1.2,
    profit: 1.5,
    sellout: 1.0
  };

  for (let i = 0; i < 100; i++) {
    const pattern = generateConstrainedPattern(target);
    const stats = simulateMultipleTimes(pattern, 10000);
    const score = calculateWeightedScore(stats, target, weights);

    if (score < bestScore) {
      bestScore = score;
      best = { pattern, stats };
    }
  }

  return best;
}
