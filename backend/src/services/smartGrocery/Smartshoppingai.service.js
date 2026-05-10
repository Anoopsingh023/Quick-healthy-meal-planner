// ─── knowledge base ───────────────────────────────────────────────────────────
const ITEMS_DB = [
  // name, category, price (per unit), unit, priority, perPersonPerDay (in unit)
  {
    name: "Onion",
    category: "Vegetable",
    price: 30,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.05,
  },
  {
    name: "Tomato",
    category: "Vegetable",
    price: 40,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.06,
  },
  {
    name: "Potato",
    category: "Vegetable",
    price: 25,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.08,
  },
  {
    name: "Garlic",
    category: "Vegetable",
    price: 80,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.01,
  },
  {
    name: "Ginger",
    category: "Vegetable",
    price: 100,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.01,
  },
  {
    name: "Spinach",
    category: "Vegetable",
    price: 30,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.05,
  },
  {
    name: "Carrot",
    category: "Vegetable",
    price: 40,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.04,
  },
  {
    name: "Capsicum",
    category: "Vegetable",
    price: 60,
    unit: "kg",
    priority: "low",
    perPersonPerDay: 0.03,
  },
  {
    name: "Cauliflower",
    category: "Vegetable",
    price: 30,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.06,
  },
  {
    name: "Peas",
    category: "Vegetable",
    price: 50,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.04,
  },
  {
    name: "Lemon",
    category: "Fruit",
    price: 8,
    unit: "pcs",
    priority: "medium",
    perPersonPerDay: 0.15,
  },
  {
    name: "Banana",
    category: "Fruit",
    price: 60,
    unit: "kg",
    priority: "low",
    perPersonPerDay: 0.05,
  },
  {
    name: "Apple",
    category: "Fruit",
    price: 120,
    unit: "kg",
    priority: "low",
    perPersonPerDay: 0.04,
  },
  {
    name: "Milk",
    category: "Dairy",
    price: 58,
    unit: "L",
    priority: "high",
    perPersonPerDay: 0.25,
  },
  {
    name: "Curd",
    category: "Dairy",
    price: 50,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.08,
  },
  {
    name: "Paneer",
    category: "Dairy",
    price: 350,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.04,
  },
  {
    name: "Butter",
    category: "Dairy",
    price: 450,
    unit: "kg",
    priority: "low",
    perPersonPerDay: 0.01,
  },
  {
    name: "Cheese",
    category: "Dairy",
    price: 500,
    unit: "kg",
    priority: "low",
    perPersonPerDay: 0.01,
  },
  {
    name: "Eggs",
    category: "Dairy",
    price: 7,
    unit: "pcs",
    priority: "medium",
    perPersonPerDay: 0.5,
  },
  {
    name: "Cumin",
    category: "Spices",
    price: 200,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.003,
  },
  {
    name: "Coriander",
    category: "Spices",
    price: 150,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.003,
  },
  {
    name: "Turmeric",
    category: "Spices",
    price: 180,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.002,
  },
  {
    name: "Chilli Powder",
    category: "Spices",
    price: 200,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.002,
  },
  {
    name: "Garam Masala",
    category: "Spices",
    price: 250,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.002,
  },
  {
    name: "Mustard Seeds",
    category: "Spices",
    price: 120,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.002,
  },
  {
    name: "Salt",
    category: "Spices",
    price: 20,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.005,
  },
  {
    name: "Bread",
    category: "Bakery",
    price: 40,
    unit: "pcs",
    priority: "medium",
    perPersonPerDay: 0.15,
  },
  {
    name: "Flour",
    category: "Bakery",
    price: 45,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.1,
  },
  {
    name: "Rice",
    category: "Other",
    price: 65,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.12,
  },
  {
    name: "Dal",
    category: "Other",
    price: 90,
    unit: "kg",
    priority: "high",
    perPersonPerDay: 0.06,
  },
  {
    name: "Oil",
    category: "Other",
    price: 140,
    unit: "L",
    priority: "high",
    perPersonPerDay: 0.02,
  },
  {
    name: "Sugar",
    category: "Other",
    price: 45,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.02,
  },
  {
    name: "Tea",
    category: "Other",
    price: 300,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.005,
  },
  {
    name: "Chickpeas",
    category: "Other",
    price: 80,
    unit: "kg",
    priority: "medium",
    perPersonPerDay: 0.04,
  },
];

const SUBSTITUTES_MAP = [
  {
    original: "Paneer",
    substitute: "Tofu",
    savingsPct: 40,
    reason: "Similar protein, much cheaper",
  },
  {
    original: "Cheese",
    substitute: "Paneer",
    savingsPct: 30,
    reason: "Local alternative, similar use",
  },
  {
    original: "Butter",
    substitute: "Oil",
    savingsPct: 60,
    reason: "Works for most cooking purposes",
  },
  {
    original: "Almonds",
    substitute: "Peanuts",
    savingsPct: 70,
    reason: "High protein at a fraction of cost",
  },
  {
    original: "Apple",
    substitute: "Banana",
    savingsPct: 50,
    reason: "Equally nutritious, far cheaper",
  },
  {
    original: "Capsicum",
    substitute: "Green Chilli",
    savingsPct: 60,
    reason: "Adds similar flavour and colour",
  },
  {
    original: "Broccoli",
    substitute: "Cauliflower",
    savingsPct: 55,
    reason: "Same family, same nutrition",
  },
  {
    original: "Cream",
    substitute: "Curd",
    savingsPct: 65,
    reason: "Works well in gravies and dips",
  },
  {
    original: "Cashews",
    substitute: "Peanuts",
    savingsPct: 75,
    reason: "Similar crunch at much lower cost",
  },
  {
    original: "Saffron",
    substitute: "Turmeric",
    savingsPct: 95,
    reason: "Both add colour; turmeric is dirt cheap",
  },
];

const MEAL_PLANS = [
  {
    breakfast: "Poha",
    lunch: "Dal Rice + Aloo Sabzi",
    dinner: "Roti + Mixed Veg Curry",
    baseCost: 90,
  },
  {
    breakfast: "Upma",
    lunch: "Rajma Rice",
    dinner: "Roti + Dal Tadka",
    baseCost: 95,
  },
  {
    breakfast: "Paratha + Curd",
    lunch: "Chole Rice",
    dinner: "Roti + Paneer Bhurji",
    baseCost: 130,
  },
  {
    breakfast: "Idli + Sambar",
    lunch: "Sambar Rice + Papad",
    dinner: "Roti + Dal + Sabzi",
    baseCost: 85,
  },
  {
    breakfast: "Bread + Omelette",
    lunch: "Fried Rice + Raita",
    dinner: "Roti + Aloo Matar",
    baseCost: 100,
  },
  {
    breakfast: "Dalia",
    lunch: "Dal Khichdi",
    dinner: "Roti + Palak Sabzi",
    baseCost: 80,
  },
  {
    breakfast: "Puri + Sabzi",
    lunch: "Rice + Kadhi",
    dinner: "Roti + Egg Curry",
    baseCost: 110,
  },
];

const WEEKLY_INGREDIENTS = [
  {
    name: "Flour",
    quantity: "2 kg",
    category: "Bakery",
    estimatedPrice: 90,
    unit: "kg",
    baseQty: 2,
  },
  {
    name: "Rice",
    quantity: "2 kg",
    category: "Other",
    estimatedPrice: 130,
    unit: "kg",
    baseQty: 2,
  },
  {
    name: "Dal",
    quantity: "1 kg",
    category: "Other",
    estimatedPrice: 90,
    unit: "kg",
    baseQty: 1,
  },
  {
    name: "Onion",
    quantity: "1 kg",
    category: "Vegetable",
    estimatedPrice: 30,
    unit: "kg",
    baseQty: 1,
  },
  {
    name: "Tomato",
    quantity: "1 kg",
    category: "Vegetable",
    estimatedPrice: 40,
    unit: "kg",
    baseQty: 1,
  },
  {
    name: "Potato",
    quantity: "1 kg",
    category: "Vegetable",
    estimatedPrice: 25,
    unit: "kg",
    baseQty: 1,
  },
  {
    name: "Oil",
    quantity: "500 ml",
    category: "Other",
    estimatedPrice: 70,
    unit: "L",
    baseQty: 0.5,
  },
  {
    name: "Milk",
    quantity: "3 L",
    category: "Dairy",
    estimatedPrice: 174,
    unit: "L",
    baseQty: 3,
  },
  {
    name: "Cumin",
    quantity: "50 g",
    category: "Spices",
    estimatedPrice: 20,
    unit: "kg",
    baseQty: 0.05,
  },
  {
    name: "Turmeric",
    quantity: "50 g",
    category: "Spices",
    estimatedPrice: 18,
    unit: "kg",
    baseQty: 0.05,
  },
  {
    name: "Coriander",
    quantity: "50 g",
    category: "Spices",
    estimatedPrice: 15,
    unit: "kg",
    baseQty: 0.05,
  },
  {
    name: "Chilli Powder",
    quantity: "50 g",
    category: "Spices",
    estimatedPrice: 20,
    unit: "kg",
    baseQty: 0.05,
  },
  {
    name: "Salt",
    quantity: "200 g",
    category: "Spices",
    estimatedPrice: 10,
    unit: "kg",
    baseQty: 0.2,
  },
  {
    name: "Garlic",
    quantity: "100 g",
    category: "Vegetable",
    estimatedPrice: 15,
    unit: "kg",
    baseQty: 0.1,
  },
  {
    name: "Ginger",
    quantity: "100 g",
    category: "Vegetable",
    estimatedPrice: 20,
    unit: "kg",
    baseQty: 0.1,
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

const norm = (s) => s.toLowerCase().trim();

const fuzzyMatch = (a, b) =>
  norm(a).includes(norm(b)) || norm(b).includes(norm(a));

const roundQty = (val, unit) => {
  if (unit === "pcs") return `${Math.ceil(val)} pcs`;
  if (val < 0.1) return `${Math.round(val * 1000)} g`;
  if (val < 1) return `${Math.round(val * 1000)} g`;
  return `${parseFloat(val.toFixed(2))} ${unit}`;
};

// ─── 1. Budget-aware suggestions ─────────────────────────────────────────────
export function getBudgetSuggestions({
  remaining,
  currentItems,
  people,
  days,
}) {
  const currentNorm = currentItems.map(norm);

  const suggestions = ITEMS_DB.filter(
    (item) => !currentNorm.some((c) => fuzzyMatch(c, item.name)),
  )
    .map((item) => {
      const totalQty = item.perPersonPerDay * people * days;
      const totalCost = Math.round(item.price * totalQty);
      return { ...item, totalQty, totalCost };
    })
    .filter((item) => item.totalCost <= remaining && item.totalCost > 0)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      if (order[a.priority] !== order[b.priority])
        return order[a.priority] - order[b.priority];
      // secondary: best value (quantity per rupee)
      return b.totalQty / b.totalCost - a.totalQty / a.totalCost;
    })
    .slice(0, 8)
    .map((item) => ({
      name: item.name,
      category: item.category,
      estimatedPrice: item.totalCost,
      quantity: roundQty(item.totalQty, item.unit),
      reason:
        item.priority === "high"
          ? "Daily essential — needed for most meals"
          : item.priority === "medium"
            ? "Used regularly through the week"
            : "Nice to have — fits within remaining budget",
    }));

  return { suggestions };
}

// ─── 2. Substitute recommender ────────────────────────────────────────────────
export function getSubstitutes({ items }) {
  const substitutes = [];

  items.forEach(({ name, price: itemPrice }) => {
    const match = SUBSTITUTES_MAP.find((s) => fuzzyMatch(name, s.original));
    if (!match) return;

    const savings = itemPrice
      ? Math.round(itemPrice * (match.savingsPct / 100))
      : `~${match.savingsPct}%`;

    substitutes.push({
      original: name,
      substitute: match.substitute,
      savings,
      reason: match.reason,
    });
  });

  return { substitutes };
}

// ─── 3. Smart quantity estimator ──────────────────────────────────────────────
export function getSmartQuantities({ items, people, days }) {
  const quantities = {};

  items.forEach((itemName) => {
    const found = ITEMS_DB.find((db) => fuzzyMatch(db.name, itemName));

    if (found) {
      const qty = found.perPersonPerDay * people * days;
      quantities[itemName] = roundQty(qty, found.unit);
    } else {
      // generic fallback: 80g per person per day
      quantities[itemName] = roundQty(0.08 * people * days, "kg");
    }
  });

  return { quantities };
}

// ─── 4. Priority auto-tagging ─────────────────────────────────────────────────
export function getPriorities({ items }) {
  const HIGH_KEYWORDS = [
    "milk",
    "oil",
    "salt",
    "rice",
    "dal",
    "flour",
    "onion",
    "tomato",
    "potato",
    "cumin",
    "turmeric",
    "chilli",
    "coriander",
    "mustard",
    "ginger",
    "garlic",
  ];
  const LOW_KEYWORDS = [
    "cheese",
    "butter",
    "cream",
    "cashew",
    "almond",
    "apple",
    "capsicum",
    "broccoli",
    "saffron",
    "chocolate",
    "biscuit",
    "snack",
  ];

  const priorities = items.map(({ id, name, category }) => {
    const lower = norm(name);

    let priority = "medium";
    let reason = "Used several times a week";

    if (HIGH_KEYWORDS.some((k) => lower.includes(k)) || category === "Spices") {
      priority = "high";
      reason = "Daily essential — needed for most meals";
    } else if (LOW_KEYWORDS.some((k) => lower.includes(k))) {
      priority = "low";
      reason = "Nice to have, not critical for daily cooking";
    } else if (category === "Dairy") {
      priority = "medium";
      reason = "Used regularly in cooking and breakfast";
    }

    return { id, priority, reason };
  });

  return { priorities };
}

// ─── 5. Weekly meal planner ───────────────────────────────────────────────────
export function getWeeklyPlan({ budget, people, days, currentItems }) {
  const currentNorm = currentItems.map(norm);

  // scale factor: base plans are for 2 people
  const peopleFactor = people / 2;

  const planDays = Array.from({ length: days }, (_, i) => {
    const meal = MEAL_PLANS[i % MEAL_PLANS.length];
    return {
      day: i + 1,
      breakfast: meal.breakfast,
      lunch: meal.lunch,
      dinner: meal.dinner,
      estimatedCost: Math.round(meal.baseCost * peopleFactor),
    };
  });

  const totalCost = planDays.reduce((s, d) => s + d.estimatedCost, 0);

  // scale ingredients by people & days, skip items already owned
  const scaleFactor = peopleFactor * (days / 7);
  const ingredients = WEEKLY_INGREDIENTS.filter(
    (ing) => !currentNorm.some((c) => fuzzyMatch(c, ing.name)),
  ).map((ing) => {
    const scaledQty = ing.baseQty * scaleFactor;
    const scaledPrice = Math.round(ing.estimatedPrice * scaleFactor);
    return {
      name: ing.name,
      quantity: roundQty(scaledQty, ing.unit),
      category: ing.category,
      estimatedPrice: scaledPrice,
    };
  });

  let tips = "Buy vegetables fresh from your local sabzi mandi to save 20–30%.";
  if (totalCost > budget) {
    const over = totalCost - budget;
    tips = `Plan exceeds budget by ₹${over}. Replace Paneer/Chole dishes with Dal or Egg-based meals to cut costs.`;
  } else if (totalCost < budget * 0.75) {
    tips = `You have ₹${budget - totalCost} headroom — consider adding fruits or snacks for variety.`;
  }

  return { days: planDays, ingredients, totalCost, tips };
}
