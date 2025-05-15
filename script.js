
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
    const winTotal = result.pattern.winPatterns.reduce((sum, w) => sum + w.count, 0);
    const loseTotal = result.pattern.losePatterns.reduce((sum, l) => sum + l.count, 0);
    const totalTickets = winTotal + loseTotal + 1; // ラストワン賞1枚分

    let output = "";
    output += "【統計】\n";
    output += `運営勝率: ${result.stats.winRate.toFixed(1)}%\n`;
    output += `赤字率: ${result.stats.lossRate.toFixed(1)}%\n`;
    output += `目標利益達成率: ${result.stats.profitAchieveRate.toFixed(1)}%\n`;
    output += `完売率: ${result.stats.selloutRate.toFixed(1)}%\n`;
    output += `プレイヤー勝率（参考）: ${result.stats.playerProfitRate.toFixed(1)}%\n\n`;

    output += "【提案された景品構成】\n";
    output += `全口数：${totalTickets}口（当たり：${winTotal}口、ハズレ：${loseTotal}口）\n`;
    output += `ラストワン賞：${result.pattern.lastOne.displayValue > 0 ? "あり" : "なし"}（${result.pattern.lastOne.displayValue}円 原価率: ${result.pattern.lastOne.costRate.toFixed(3)}）\n\n`;

    result.pattern.winPatterns.forEach(w => {
      output += `当たり: ${w.displayValue}円 × ${w.count}本（原価率: ${w.costRate.toFixed(3)}）\n`;
    });

    output += `ラストワン賞: ${result.pattern.lastOne.displayValue}円（原価率: ${result.pattern.lastOne.costRate.toFixed(3)}）`;

    document.getElementById("resultArea").innerText = output;
  }, 100);
}
