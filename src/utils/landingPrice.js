// Replicates the two formula shapes found in the source spreadsheet.
// Verified against the sheet's one worked example (3.00-10 SPEEDO DX):
// FTC landing = 4005.51, CEAT landing w/FOC = 3204.55, difference = 800.96.
export function computeLanding(dealerPriceWithVat, config) {
  if (dealerPriceWithVat == null || Number.isNaN(dealerPriceWithVat)) {
    return { landingWithoutFOC: null, landingWithFOC: null };
  }

  const rates = config.steps.map((s) => s.rate ?? 0);

  if (config.calcMode === 'two_stage') {
    const [distributorRate, ...rest] = rates;
    const afterDistributor = dealerPriceWithVat * (1 - distributorRate);
    const remaining = rest.reduce((a, b) => a + b, 0);
    const landing = afterDistributor * (1 - remaining);
    return { landingWithoutFOC: landing, landingWithFOC: landing };
  }

  const totalRate = rates.reduce((a, b) => a + b, 0);
  const landingWithoutFOC = dealerPriceWithVat * (1 - totalRate);
  const landingWithFOC = config.focRatio
    ? landingWithoutFOC * (config.focRatio / (config.focRatio + 1))
    : landingWithoutFOC;

  return { landingWithoutFOC, landingWithFOC };
}
