import { asset, img, local } from "./data";

/** Square, CORS-enabled JPEG for use as a WebGL texture. */
const tex = (id: string) =>
  `https://images.unsplash.com/${id}?w=1024&h=1024&fit=crop&q=80&fm=jpg`;

export type CategoryId = "garden" | "fire" | "pasta" | "dessert";

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  ingredients: string[];
  allergens: string[];
  photo: string;
  /** Top-down photo shown on the 3D plate; `zoom` crops in so only the food shows. */
  plate?: { src: string; zoom: number };
  tag?: string;
};

/** `source` is an Unsplash photo id or a local `/images/...` path. */
const dish = (
  id: string,
  source: string,
  d: Omit<Dish, "id" | "photo" | "plate"> & { zoom?: number; plateSrc?: string },
): Dish => {
  const { zoom, plateSrc, ...rest } = d;
  const local = source.startsWith("/");
  return {
    id,
    photo: local ? source : img(source),
    plate: zoom ? { src: plateSrc ?? (local ? source : tex(source)), zoom } : undefined,
    ...rest,
  };
};

export const dishes: Dish[] = [
  // Garden
  dish("buddha-bowl", "photo-1512621776951-a57141f2eefd", {
    name: "Garden Buddha bowl",
    description: "Avocado, roasted squash, chickpeas, heirloom tomato, pickled cabbage.",
    price: 15,
    category: "garden",
    ingredients: ["Avocado", "Roasted squash", "Chickpeas", "Cherry tomato", "Red cabbage", "Radish", "Microgreens"],
    allergens: ["Sesame"],
    tag: "Vegan",
    zoom: 1.15,
  }),
  dish("harvest-salad", "photo-1540189549336-e6e99c3679fe", {
    name: "Harvest green salad",
    description: "Shaved roots, pickled onion, toasted seeds, citrus dressing.",
    price: 16,
    category: "garden",
    ingredients: ["Frisée", "Carrot", "Red onion", "Sunflower seeds", "Orange", "Feta"],
    allergens: ["Dairy"],
    zoom: 1.35,
  }),
  dish("grain-bowl", "photo-1547592180-85f173990554", {
    name: "Ancient grain bowl",
    description: "Herbed couscous, charred green beans, blistered tomatoes.",
    price: 17,
    category: "garden",
    ingredients: ["Couscous", "Green beans", "Heirloom tomato", "Lemon", "Parsley", "Olive oil"],
    allergens: ["Gluten"],
    zoom: 2.1,
  }),
  dish("salmon-bowl", "photo-1546069901-ba9599a7e63c", {
    name: "Charred salmon grain bowl",
    description: "Soft egg, sweet corn, red cabbage, cucumber, sesame.",
    price: 24,
    category: "garden",
    ingredients: ["Salmon", "Soft-boiled egg", "Sweet corn", "Red cabbage", "Cucumber", "Romaine"],
    allergens: ["Fish", "Egg", "Sesame"],
    zoom: 1.2,
  }),

  // From the fire
  dish("ember-skewers", local.skewers, {
    name: "Ember mixed skewers",
    description: "Beef and chicken over live oak with charred peppers and onion, served with a crisp salad.",
    price: 38,
    category: "fire",
    ingredients: ["Beef sirloin", "Chicken thigh", "Red pepper", "Green pepper", "Onion", "House spice rub", "Garden salad"],
    allergens: [],
    tag: "Signature",
  }),
  dish("salmon-curry", local.salmonCurry, {
    name: "Coconut salmon curry",
    description: "Oven-roasted salmon in a smoked coconut and tomato sauce, lemon, oregano.",
    price: 29,
    category: "fire",
    ingredients: ["Salmon", "Coconut milk", "Smoked tomato", "Ginger", "Lemon", "Oregano"],
    allergens: ["Fish"],
    tag: "Chef's pick",
    zoom: 1.28,
    plateSrc: local.salmonCurryPlate,
  }),
  dish("langoustine", local.langoustine, {
    name: "Grilled langoustine",
    description: "Butterflied over oak, paprika butter, garlic aioli, sourdough.",
    price: 36,
    category: "fire",
    ingredients: ["Langoustine tails", "Smoked paprika", "Garlic butter", "Parsley", "Aioli", "Sourdough", "Frisée"],
    allergens: ["Crustacean", "Egg", "Dairy", "Gluten"],
    tag: "New",
  }),
  dish("seared-salmon", local.searedSalmon, {
    name: "Maple-seared salmon",
    description: "Crisp-skin salmon, courgette and carrot ribbons, wilted spinach, lime.",
    price: 31,
    category: "fire",
    ingredients: ["Salmon", "Maple glaze", "Courgette", "Carrot", "Spinach", "Lime"],
    allergens: ["Fish"],
    tag: "Signature",
  }),

  // Pasta & pizza
  dish("chicken-pizza", "photo-1565299624946-b28f40a0ae38", {
    name: "Smoked chicken pizza",
    description: "Wood-fired base, roasted peppers, red onion, mozzarella, coriander.",
    price: 22,
    category: "pasta",
    ingredients: ["Sourdough base", "Smoked chicken", "Mozzarella", "Roasted peppers", "Red onion", "Coriander"],
    allergens: ["Gluten", "Dairy"],
    zoom: 1.12,
  }),
  dish("prawn-linguine", "photo-1563379926898-05f4575a45d8", {
    name: "Garlic prawn linguine",
    description: "Blistered cherry tomato, chilli, basil, toasted crumb.",
    price: 26,
    category: "pasta",
    ingredients: ["Linguine", "Tiger prawns", "Garlic", "Cherry tomato", "Chilli", "Basil"],
    allergens: ["Crustacean", "Gluten"],
    zoom: 1.5,
  }),
  dish("short-rib-tagliatelle", "photo-1551183053-bf91a1d81141", {
    name: "Short-rib tagliatelle",
    description: "Ember-seared beef, sun-dried tomato, spinach, parmesan cream.",
    price: 28,
    category: "pasta",
    ingredients: ["Tagliatelle", "Beef short rib", "Sun-dried tomato", "Spinach", "Parmesan", "Cream"],
    allergens: ["Gluten", "Dairy", "Egg"],
    zoom: 1.15,
  }),

  // Dessert (photo only — no top-down shot for a 3D plate)
  dish("tiramisu", "photo-1571877227200-a0d98ea607e9", {
    name: "Smoked tiramisu",
    description: "Espresso-soaked sponge, mascarpone, cocoa, oak-smoked cream.",
    price: 11,
    category: "dessert",
    ingredients: ["Savoiardi", "Espresso", "Mascarpone", "Cocoa", "Egg"],
    allergens: ["Gluten", "Dairy", "Egg"],
  }),
  dish("affogato", "photo-1551024506-0bccd828d307", {
    name: "Salted caramel affogato",
    description: "Vanilla gelato, hot espresso caramel, almond tuile.",
    price: 10,
    category: "dessert",
    ingredients: ["Vanilla gelato", "Espresso", "Salted caramel", "Almond tuile"],
    allergens: ["Dairy", "Nuts"],
  }),
  dish("brownie", "photo-1606313564200-e75d5e30476c", {
    name: "Molten chocolate brownie",
    description: "Dark chocolate, warm ganache, smoked sea salt.",
    price: 12,
    category: "dessert",
    ingredients: ["Dark chocolate", "Butter", "Brown sugar", "Ganache", "Sea salt"],
    allergens: ["Gluten", "Dairy", "Egg"],
  }),
];

export const dishById = (id: string) => dishes.find((d) => d.id === id);
export const dishesIn = (c: CategoryId) => dishes.filter((d) => d.category === c);

/** Hero signatures: real photographs (square, dish-centred) with estimated depth maps. */
export const heroShots = [
  { id: "ember-skewers", src: asset("/images/round-skewers.jpg"), depth: asset("/images/round-skewers-depth.png") },
  { id: "seared-salmon", src: asset("/images/round-salmon.jpg"), depth: asset("/images/round-salmon-depth.png") },
  { id: "langoustine", src: asset("/images/round-langoustine.jpg"), depth: asset("/images/round-langoustine-depth.png") },
  { id: "salmon-curry", src: asset("/images/round-curry.jpg"), depth: asset("/images/round-curry-depth.png") },
];
export const signatures = heroShots.map((s) => dishById(s.id)!);

export const drinks = [
  { name: "Smoked old fashioned", detail: "Bourbon, oak smoke, orange", price: 16 },
  { name: "Ember negroni", detail: "Gin, Campari, charred vermouth", price: 15 },
  { name: "Rosemary paloma", detail: "Tequila, grapefruit, burnt rosemary", price: 14 },
  { name: "House red, by the glass", detail: "Rotating natural Syrah", price: 12 },
  { name: "Champagne, by the glass", detail: "Brut, Montagne de Reims", price: 18 },
  { name: "Fire-spiced lemonade", detail: "Zero-proof, ginger, chilli", price: 7 },
];
