export const rankRecipes = (recipes) => {
  return recipes.sort((a, b) => {
    const scoreA =
      (a.semanticScore || 0) +
      (a.popularityScore || 0) +
      (a.qualityScore || 0) +
      (a.isVerified ? 0.1 : 0);

    const scoreB =
      (b.semanticScore || 0) +
      (b.popularityScore || 0) +
      (b.qualityScore || 0) +
      (b.isVerified ? 0.1 : 0);

    return scoreB - scoreA;
  });
};