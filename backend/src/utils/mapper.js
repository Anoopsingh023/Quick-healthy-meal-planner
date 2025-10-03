export function mapSpoonacularToRecipe(spoonacularData) {
  return {
    title: spoonacularData.title,
    description: spoonacularData.summary
      ? spoonacularData.summary.replace(/<[^>]*>/g, "") // remove HTML tags
      : "",
    ingredients: spoonacularData.extendedIngredients
      ? spoonacularData.extendedIngredients.map((ing) => ({
          name: ing.name,
          quantity: `${ing.amount} ${ing.unit}`.trim(),
          optional: false,
        }))
      : [],
    steps: spoonacularData.analyzedInstructions?.[0]?.steps
      ? spoonacularData.analyzedInstructions[0].steps.map((s) => ({
          stepNumber: s.number,
          instruction: s.step,
          time: s.length?.number || null,
        }))
      : [],
    metadata: {
      cookingTime: spoonacularData.readyInMinutes || 0,
      difficulty: "Easy", // Spoonacular doesn’t provide difficulty
      cuisine: spoonacularData.cuisines?.[0] || "Any",
      dietType: spoonacularData.vegetarian
        ? "Veg"
        : spoonacularData.vegan
        ? "Vegan"
        : spoonacularData.glutenFree || spoonacularData.dairyFree
        ? "Any"
        : "Non-Veg",
      costEstimate: Math.round(spoonacularData.pricePerServing) || null,
      calories:
        spoonacularData.nutrition?.nutrients?.find((n) => n.name === "Calories")
          ?.amount || null,
    },
    tags: [
      ...(spoonacularData.dishTypes || []),
      ...(spoonacularData.diets || []),
      ...(spoonacularData.cuisines || []),
    ],
    source: "Spoonacular",
  };
}
