/** Prefix for files in /public — set to "/ember-oak" for the GitHub Pages build. */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

export const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80`;

export const images = {
  hero: img("photo-1600565193348-f74bd3c7ccdf"),
  chef: img("photo-1551218808-94e220e084d2"),
  room: img("photo-1578474846511-04ba529f0b88"),
};

/** Restaurant photography in /public/images. */
export const local = {
  langoustine: asset("/images/langoustine.jpg"),
  brunchTable: asset("/images/brunch-table.jpg"),
  diningHall: asset("/images/dining-hall.jpg"),
  interiorLamps: asset("/images/interior-lamps.jpg"),
  diningRoom: asset("/images/dining-room.jpg"),
  platedService: asset("/images/plated-service.jpg"),
  searedSalmon: asset("/images/seared-salmon.jpg"),
  salmonCurry: asset("/images/salmon-curry.jpg"),
  salmonCurryPlate: asset("/images/salmon-curry-plate.jpg"),
  breakfastSpread: asset("/images/breakfast-spread.jpg"),
  skewers: asset("/images/skewers.jpg"),
  tableWine: asset("/images/table-wine.jpg"),
  burger: asset("/images/burger.jpg"),
};

export type Dish = {
  name: string;
  description: string;
  price: number;
  image?: string;
  tag?: string;
};

export type MenuCategory = {
  id: string;
  label: string;
  featured: Dish[];
  more: Dish[];
};

export const menu: MenuCategory[] = [
  {
    id: "fire",
    label: "From the fire",
    featured: [
      {
        name: "Oak-smoked short ribs",
        description: "Twelve-hour smoke, burnt-honey glaze, charred tomato, pickles.",
        price: 34,
        image: img("photo-1544025162-d76694265947"),
        tag: "Signature",
      },
      {
        name: "Ember steak frites",
        description: "Dry-aged flank, chimichurri, triple-cooked fries.",
        price: 38,
        image: img("photo-1600891964092-4316c288032e"),
      },
    ],
    more: [
      { name: "Charred octopus", description: "Smoked paprika, white bean purée", price: 19 },
      { name: "Half chicken, flame-roasted", description: "Lemon, garlic, pan juices", price: 27 },
      { name: "Bone-marrow toast", description: "Parsley salad, sourdough", price: 14 },
    ],
  },
  {
    id: "pasta",
    label: "Pasta & pizza",
    featured: [
      {
        name: "Garlic prawn linguine",
        description: "Blistered cherry tomato, chilli, basil, toasted crumb.",
        price: 26,
        image: img("photo-1563379926898-05f4575a45d8"),
        tag: "Chef's pick",
      },
      {
        name: "Smoked chicken & pepper pizza",
        description: "Wood-fired base, roasted peppers, red onion, coriander.",
        price: 22,
        image: img("photo-1565299624946-b28f40a0ae38"),
      },
    ],
    more: [
      { name: "Burrata & heirloom tomato pizza", description: "Basil oil, sea salt", price: 21 },
      { name: "Cacio e pepe", description: "Pecorino, cracked black pepper", price: 19 },
      { name: "Lamb ragù pappardelle", description: "Slow-braised shoulder, gremolata", price: 25 },
    ],
  },
  {
    id: "garden",
    label: "Garden",
    featured: [
      {
        name: "Charred salmon grain bowl",
        description: "Soft egg, sweet corn, red cabbage, avocado, sesame.",
        price: 24,
        image: img("photo-1546069901-ba9599a7e63c"),
      },
      {
        name: "Harvest green salad",
        description: "Shaved roots, pickled onion, toasted seeds, citrus dressing.",
        price: 16,
        image: img("photo-1540189549336-e6e99c3679fe"),
        tag: "Vegan",
      },
    ],
    more: [
      { name: "Fire-roasted carrots", description: "Whipped feta, dukkah, honey", price: 13 },
      { name: "Grilled halloumi", description: "Flatbread, herb salad, tahini", price: 15 },
      { name: "Smoked beet tartare", description: "Horseradish cream, rye crisps", price: 14 },
    ],
  },
];

export const gallery = [
  { src: img("photo-1414235077428-338989a2e8c0"), alt: "Guests sharing a plated dish over wine", ratio: "aspect-[4/5]" },
  { src: img("photo-1504674900247-0877df9cc836"), alt: "Grilled beef salad with herbs and chilli", ratio: "aspect-[4/3]" },
  { src: asset("/images/dining-hall.jpg"), alt: "Looking down on the marble dining hall at afternoon tea", ratio: "aspect-[4/5]" },
  { src: asset("/images/breakfast-spread.jpg"), alt: "A table of weekend brunch plates, berries and coffee", ratio: "aspect-[4/3]" },
  { src: asset("/images/table-wine.jpg"), alt: "A table set with grilled meats, decanted red wine and fresh juice", ratio: "aspect-[4/5]" },
  { src: img("photo-1476224203421-9ac39bcb3327"), alt: "Grilled halloumi with flatbread and dip", ratio: "aspect-[4/3]" },
];

export const signatures = [
  "Oak-smoked short ribs",
  "Wood-fired pizza",
  "Dry-aged steak",
  "Garlic prawn linguine",
  "Natural wines",
  "Seasonal tasting menu",
];

export const testimonials = [
  {
    quote:
      "The short ribs alone are worth crossing the city for. Warm room, sharp service, and a wine list that actually surprises you.",
    name: "Priya Raman",
    role: "Local food writer",
  },
  {
    quote:
      "We booked for an anniversary and they treated it like their own. Every plate tasted of the fire — in the best way.",
    name: "Daniel Okafor",
    role: "Regular since 2019",
  },
  {
    quote:
      "Rare to find a place that nails both the cooking and the atmosphere. The terrace at sunset is unbeatable.",
    name: "Sofia Marchetti",
    role: "Visited in June",
  },
  {
    quote:
      "Ordered the mixed grill for pickup and it travelled perfectly — still smoky, still juicy. Our new Friday ritual.",
    name: "James Whitfield",
    role: "Ordered online",
  },
  {
    quote:
      "The tasting menu was paced beautifully and the sommelier's pairings were spot on. Worth every penny.",
    name: "Aisha Rahman",
    role: "Tasting menu guest",
  },
  {
    quote:
      "Weekend brunch by the hearth is the coziest thing in the city. The French toast is outrageous.",
    name: "Lucas Moreau",
    role: "Brunch regular",
  },
];

export const hours = [
  { days: "Tue – Thu", time: "5:00 pm – 10:30 pm" },
  { days: "Fri – Sat", time: "5:00 pm – 11:30 pm" },
  { days: "Sunday", time: "12:00 pm – 9:00 pm" },
  { days: "Monday", time: "Closed" },
];
