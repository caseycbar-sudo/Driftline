// Driftline cookbook. Generated from the researched recipe set; edit the recipes here directly.
// Meal prep recipes use ids 1–99 and yield 12 portions; private chef dishes use ids 101+ and serve 6.

export type CookbookSide = "meal-prep" | "private-chef";
export type Allergen = "Milk" | "Egg" | "Fish" | "Shellfish" | "Tree nuts" | "Peanuts" | "Wheat" | "Soy" | "Sesame";
export type Recipe = {
  id: number;
  slug: string;
  side: CookbookSide;
  title: string;
  category: string;
  description: string;
  /** Base yield the ingredient amounts are written for (portions for meal prep, guests for private chef). */
  servings: number;
  yieldNote: string;
  active: number;
  total: number;
  tags: string[];
  allergens: Allergen[];
  dietary: string[];
  image: string;
  photoCredit: { author: string; source: string; page: string };
  ingredients: string[];
  directions: string[];
  equipment: string[];
  storage: string;
  reheating: string;
  makeAhead: string;
  safety: string;
  chefNotes: string;
};

export const SIDES: Record<CookbookSide, { label: string; categories: string[]; unit: string; min: number; max: number; step: number }> = {
  "meal-prep": { label: "Meal Prep", categories: ["Poultry", "Beef, Pork & Lamb", "Seafood", "Vegetarian"], unit: "portions", min: 6, max: 24, step: 2 },
  "private-chef": { label: "Private Chef", categories: ["Starters", "Soups & Salads", "Mains", "Sides", "Desserts"], unit: "guests", min: 2, max: 20, step: 1 },
};

export const recipes: Recipe[] = [
  {
    "id": 1,
    "slug": "lemon-herb-chicken-thighs-with-orzo-and-green-beans",
    "side": "meal-prep",
    "title": "Lemon-Herb Chicken Thighs with Orzo and Green Beans",
    "category": "Poultry",
    "description": "Garlicky lemon-oregano chicken thighs roasted until juicy, sliced over herby lemon orzo with bright, snappy green beans.",
    "servings": 12,
    "yieldNote": "12 portions (about 5½ oz chicken, 1 cup orzo and 1 cup green beans each)",
    "active": 50,
    "total": 110,
    "tags": [
      "High protein",
      "Dairy-free",
      "Kid-friendly"
    ],
    "allergens": [
      "Wheat"
    ],
    "dietary": [
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "6 lb boneless skinless chicken thighs, trimmed",
      "⅓ cup olive oil (for the marinade)",
      "½ cup fresh lemon juice (for the marinade)",
      "2 tbsp grated lemon zest (for the marinade)",
      "10 cloves garlic, minced",
      "2 tbsp dried oregano",
      "1 tbsp fresh thyme leaves, chopped",
      "2 tbsp kosher salt (for the chicken)",
      "2 tsp black pepper, freshly ground",
      "2 lb orzo",
      "3 tbsp kosher salt (for the pasta water)",
      "3 tbsp olive oil (for the orzo)",
      "3 tbsp fresh lemon juice (for the orzo)",
      "1 tbsp grated lemon zest (for the orzo)",
      "1 bunch flat-leaf parsley, chopped",
      "¼ cup fresh dill, chopped",
      "3 lb green beans, trimmed",
      "1 tsp kosher salt (for the green beans)",
      "2 tbsp olive oil (for the green beans)",
      "2 medium lemons, cut into 12 wedges"
    ],
    "directions": [
      "Whisk the marinade oil, ½ cup lemon juice, 2 tbsp zest, garlic, oregano, thyme, 2 tbsp salt and the pepper in a large bowl. Add the chicken, turn to coat, and refrigerate 30 minutes to 4 hours; longer and the acid turns the surface mealy.",
      "Heat the oven to 425°F with racks in the upper and lower thirds. Line two 18 x 13-inch rimmed sheet pans with foil and set a wire rack in each if you have them.",
      "Lay the thighs smooth side up in a single layer with space between them, letting excess marinade drip off. Roast 20 to 25 minutes, swapping and rotating the pans halfway, until the edges are browned and the thickest pieces read 165°F; thighs are juiciest at 175°F.",
      "Switch to broil and broil one pan at a time 2 to 3 minutes, 6 inches from the element, until lightly charred in spots. Rest 5 minutes, then slice ½ inch thick and spoon the pan juices over the slices.",
      "While the chicken roasts, bring 6 quarts of water and 3 tbsp salt to a boil in an 8-quart pot. Add the green beans and cook 3 minutes, until bright green and just tender but still snappy. Lift them out with a spider straight into a large bowl of ice water, chill 3 minutes, drain well and pat dry.",
      "Return the water to a boil, add the orzo and cook 1 minute less than the package time, about 7 minutes, stirring often so it does not clump. It should still have a slight bite in the center.",
      "Drain the orzo, spread it on a sheet pan and toss with 3 tbsp oil, 3 tbsp lemon juice and 1 tbsp zest while hot so it does not stick together. Cool 10 minutes, then fold in the parsley and dill.",
      "Toss the chilled green beans with 2 tbsp oil and 1 tsp salt.",
      "Once everything has cooled to room temperature (no longer than 2 hours out), portion 1 cup orzo, about 5½ oz sliced chicken and 1 cup green beans into each of 12 containers. Tuck a lemon wedge into each, lid and label."
    ],
    "equipment": [
      "2 rimmed half-sheet pans (18 x 13-inch) with wire racks",
      "8-quart stockpot",
      "Spider or slotted spoon",
      "Large mixing bowls",
      "Instant-read thermometer",
      "12 meal-prep containers (about 32 oz)"
    ],
    "storage": "Cool components uncovered on the counter no longer than 2 hours, then refrigerate at 40°F or below. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Keeps 4 days refrigerated. The chicken and orzo freeze well for up to 2 months; freeze them without the green beans, which turn soft after thawing.",
    "reheating": "Microwave: sprinkle 1 tbsp water over the orzo, cover loosely and heat at 70% power 2½ to 3 minutes, stirring halfway, until the chicken reaches 165°F. Oven: transfer to an oven-safe dish, add 2 tbsp water, cover tightly with foil and heat at 350°F for 15 to 20 minutes until 165°F in the center. Squeeze the lemon wedge over just before eating.",
    "makeAhead": "",
    "safety": "Cook chicken thighs to at least 165°F (175°F for best texture). Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Reheat to 165°F.",
    "chefNotes": "Salt amounts assume Diamond Crystal kosher salt; use about half as much if using Morton. Pulling the orzo a minute early is what keeps it from going mushy on day four, and dressing it while hot keeps it from setting into a brick."
  },
  {
    "id": 2,
    "slug": "chicken-tikka-masala-with-basmati-rice",
    "side": "meal-prep",
    "title": "Chicken Tikka Masala with Basmati Rice",
    "category": "Poultry",
    "description": "Yogurt-marinated chicken charred under the broiler, then simmered in a gently spiced tomato-cream sauce, served with fluffy basmati rice.",
    "servings": 12,
    "yieldNote": "12 portions (about 1¼ cups curry and 1 cup rice each)",
    "active": 70,
    "total": 150,
    "tags": [
      "Freezer-friendly",
      "High protein",
      "Gluten-free"
    ],
    "allergens": [
      "Milk"
    ],
    "dietary": [
      "Gluten-free"
    ],
    "image": "/cookbook/mp/chicken-tikka-masala-with-basmati-rice.webp",
    "photoCredit": {
      "author": "gabbiistudios",
      "source": "Unsplash",
      "page": "https://unsplash.com/photos/chicken-tikka-masala-dinner-plate-7ZGOtqVZtAk"
    },
    "ingredients": [
      "6 lb boneless skinless chicken thighs, trimmed and cut into 1½-inch pieces",
      "2 cups plain whole-milk yogurt (for the marinade)",
      "2 tbsp garam masala (for the marinade)",
      "2 tbsp fresh ginger, grated (for the marinade)",
      "6 cloves garlic, grated (for the marinade)",
      "2 tbsp kosher salt (for the marinade)",
      "2 tbsp vegetable oil (for the marinade)",
      "6 tbsp unsalted butter (for the sauce)",
      "3 medium yellow onions, finely chopped",
      "10 cloves garlic, minced (for the sauce)",
      "3 tbsp fresh ginger, grated (for the sauce)",
      "2 medium serrano chiles, minced",
      "3 tbsp garam masala (for the sauce)",
      "1 tbsp ground cumin",
      "1 tbsp ground coriander",
      "1 tbsp Kashmiri chili powder",
      "1 tsp ground turmeric",
      "¼ cup tomato paste",
      "2 cans (28 oz each) crushed tomatoes",
      "1½ cups heavy cream",
      "1 tbsp sugar",
      "1 tbsp kosher salt (for the sauce)",
      "1 bunch cilantro, chopped",
      "4 cups white basmati rice",
      "5½ cups water (for the rice)",
      "2 tsp kosher salt (for the rice)",
      "1 tbsp unsalted butter (for the rice)"
    ],
    "directions": [
      "Stir the yogurt, 2 tbsp garam masala, 2 tbsp ginger, 6 grated garlic cloves, 2 tbsp salt and the oil together in a large bowl. Add the chicken, toss to coat, cover and refrigerate at least 1 hour and up to 12 hours.",
      "Melt 6 tbsp butter in a 7- to 8-quart Dutch oven over medium heat. Add the onions and a pinch of salt and cook, stirring occasionally, until deep golden and soft, 15 to 18 minutes.",
      "Add the minced garlic, 3 tbsp ginger and the serranos and cook 1 minute. Stir in 3 tbsp garam masala, the cumin, coriander, chili powder and turmeric and cook 1 minute more until fragrant, then add the tomato paste and cook 2 minutes, until it darkens to brick red.",
      "Add the crushed tomatoes, sugar and 1 tbsp salt, scraping the bottom. Bring to a simmer, partially cover and cook gently 20 minutes, stirring now and then so it does not scorch. Stir in the cream and keep warm over low heat.",
      "Meanwhile, set an oven rack 6 inches from the broiler and heat the broiler to high. Line two 18 x 13-inch rimmed sheet pans with foil and set wire racks on top.",
      "Wipe off the heavy clumps of marinade and spread the chicken in a single layer on the racks. Broil one pan at a time 10 to 14 minutes, flipping halfway, until charred in spots and the largest pieces read 165°F.",
      "For the rice, rinse the basmati in a fine-mesh strainer until the water runs almost clear, then soak 15 minutes and drain well. Bring 5½ cups water, 2 tsp salt and 1 tbsp butter to a boil in a 5-quart pot, add the rice, return to a boil, cover and cook on the lowest heat 15 minutes. Rest off heat, covered, 10 minutes, then fluff.",
      "Add the broiled chicken and any juices to the sauce and simmer gently 10 minutes so the chicken absorbs the flavor. The sauce should coat a spoon; thin with ¼ cup water if it is too thick. Stir in half the cilantro.",
      "Spread the rice on a sheet pan to cool quickly, and transfer the curry to shallow pans no more than 2 inches deep. When both have stopped steaming, portion 1 cup rice and about 1¼ cups curry into each of 12 containers and top with the remaining cilantro."
    ],
    "equipment": [
      "7- to 8-quart Dutch oven",
      "2 rimmed half-sheet pans (18 x 13-inch) with wire racks",
      "5-quart saucepan with lid",
      "Fine-mesh strainer",
      "Instant-read thermometer",
      "12 meal-prep containers (two-compartment)"
    ],
    "storage": "Chill the curry and rice in shallow pans, then refrigerate at 40°F or below. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Cooked rice must be cooled quickly and not left out, as it can harbor Bacillus cereus spores. Keeps 4 days refrigerated; the curry freezes well for up to 3 months (freeze rice separately).",
    "reheating": "Microwave: sprinkle 1 tbsp water over the rice, cover loosely and heat at 70% power 3 minutes, stirring the curry halfway, until it reaches 165°F. Oven: transfer to an oven-safe dish, cover tightly with foil and heat at 350°F for 20 minutes, until 165°F in the center. If the sauce looks split, stir well; it comes back together.",
    "makeAhead": "",
    "safety": "Cook chicken to 165°F. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Reheat to 165°F.",
    "chefNotes": "Salt amounts assume Diamond Crystal kosher salt. Broiling on racks gives the charred tikka flavor without crowding; skip it and you have a stew, not tikka masala. Kashmiri chili brings color without much heat; swap sweet paprika plus a pinch of cayenne if needed."
  },
  {
    "id": 3,
    "slug": "honey-garlic-chicken-with-broccoli-and-jasmine-rice",
    "side": "meal-prep",
    "title": "Honey-Garlic Chicken with Broccoli and Jasmine Rice",
    "category": "Poultry",
    "description": "Roasted chicken thigh bites glazed in sticky honey, garlic and tamari, with crisp-tender broccoli and fragrant jasmine rice.",
    "servings": 12,
    "yieldNote": "12 portions (about 5 oz chicken, 1 cup rice and 1 cup broccoli each)",
    "active": 45,
    "total": 75,
    "tags": [
      "High protein",
      "Kid-friendly",
      "Gluten-free"
    ],
    "allergens": [
      "Soy"
    ],
    "dietary": [
      "Gluten-free",
      "Dairy-free"
    ],
    "image": "/cookbook/mp/honey-garlic-chicken-with-broccoli-and-jasmine-rice.webp",
    "photoCredit": {
      "author": "ROMAN ODINTSOV",
      "source": "Pexels",
      "page": "https://www.pexels.com/photo/meal-in-a-restaurant-5836782/"
    },
    "ingredients": [
      "6 lb boneless skinless chicken thighs, trimmed and cut into 1½-inch pieces",
      "2 tbsp cornstarch (for the chicken)",
      "2 tbsp gluten-free tamari (for the chicken)",
      "2 tsp kosher salt (for the chicken)",
      "3 tbsp vegetable oil (for the chicken)",
      "¾ cup honey",
      "¾ cup gluten-free tamari (for the glaze)",
      "½ cup water (for the glaze)",
      "¼ cup unseasoned rice vinegar",
      "12 cloves garlic, minced",
      "2 tbsp fresh ginger, grated",
      "1 tsp red pepper flakes",
      "2 tbsp cornstarch (for the glaze)",
      "3 tbsp cold water (for the slurry)",
      "4 lb broccoli crowns, cut into 1½-inch florets",
      "3 tbsp vegetable oil (for the broccoli)",
      "1½ tsp kosher salt (for the broccoli)",
      "4 cups jasmine rice",
      "5 cups water (for the rice)",
      "1½ tsp kosher salt (for the rice)",
      "1 bunch scallions, thinly sliced"
    ],
    "directions": [
      "Heat the oven to 450°F with racks in the upper and lower thirds. Toss the chicken with 2 tbsp cornstarch, 2 tbsp tamari, 2 tsp salt and 3 tbsp oil until evenly coated.",
      "Rinse the jasmine rice in a fine-mesh strainer until the water runs mostly clear. Bring 5 cups water and 1½ tsp salt to a boil in a 5-quart pot, stir in the rice, return to a boil, cover and cook on the lowest heat 15 minutes. Rest off heat, covered, 10 minutes, then fluff and spread on a sheet pan to cool.",
      "Spread the chicken in a single layer on two oiled 18 x 13-inch rimmed sheet pans. Roast 18 to 22 minutes, flipping and swapping pans halfway, until browned at the edges and the largest pieces read 165°F.",
      "While the chicken roasts, combine the honey, ¾ cup tamari, ½ cup water, rice vinegar, garlic, ginger and pepper flakes in a 3-quart saucepan. Simmer over medium heat 3 minutes, until the garlic softens and the raw edge cooks off.",
      "Stir the cornstarch and cold water into a smooth slurry, whisk it into the simmering glaze and boil 1 minute, until glossy and thick enough to coat a spoon. Remove from heat.",
      "Transfer the hot chicken to a large bowl and toss with about two-thirds of the glaze until every piece is lacquered. Reserve the rest of the glaze.",
      "Wipe out both sheet pans, toss the broccoli with 3 tbsp oil and 1½ tsp salt, divide it between the pans in a single layer and roast at 450°F, swapping the pans halfway, for 8 to 10 minutes, just until the florets are bright green with a few browned tips and still firm. Pull them early; they soften further on reheating.",
      "When everything has cooled to room temperature (within 2 hours), portion 1 cup rice, about 5 oz chicken and 1 cup broccoli into each of 12 containers. Spoon a little reserved glaze over each portion of chicken and scatter with scallions."
    ],
    "equipment": [
      "2 rimmed half-sheet pans (18 x 13-inch)",
      "5-quart saucepan with lid",
      "3-quart saucepan",
      "Fine-mesh strainer",
      "Large mixing bowl",
      "Instant-read thermometer",
      "12 meal-prep containers (three-compartment)"
    ],
    "storage": "Cool all components on sheet pans, then refrigerate at 40°F or below. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Cooked rice should be chilled promptly and not held at room temperature. Keeps 4 days refrigerated. Chicken and rice freeze up to 2 months; broccoli is best fresh.",
    "reheating": "Microwave: sprinkle 1 tbsp water over the rice, cover loosely and heat at 70% power 2½ to 3 minutes, stirring the chicken halfway, until it reaches 165°F. Oven: transfer to an oven-safe dish, add 2 tbsp water, cover tightly with foil and heat at 350°F for 15 to 20 minutes to 165°F.",
    "makeAhead": "",
    "safety": "Cook chicken to 165°F. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Reheat to 165°F. Tamari must be labeled gluten-free to keep the dish gluten-free; regular soy sauce contains wheat.",
    "chefNotes": "Salt amounts assume Diamond Crystal kosher salt. Roasting instead of stir-frying in batches is the move for a home oven and 6 pounds of chicken; the cornstarch coating browns and grabs the glaze. Keep the glaze off the rice so it does not turn gummy."
  },
  {
    "id": 4,
    "slug": "chicken-and-wild-rice-soup",
    "side": "meal-prep",
    "title": "Chicken and Wild Rice Soup",
    "category": "Poultry",
    "description": "A creamy, thyme-scented chicken soup loaded with mushrooms, carrots, celery and nutty wild rice, cooked separately so it stays chewy.",
    "servings": 12,
    "yieldNote": "12 portions (about 1¾ cups each)",
    "active": 50,
    "total": 105,
    "tags": [
      "Freezer-friendly",
      "Seasonal: fall",
      "Kid-friendly"
    ],
    "allergens": [
      "Milk",
      "Wheat"
    ],
    "dietary": [],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "2 cups wild rice, rinsed",
      "8 cups water (for the rice)",
      "2 tsp kosher salt (for the rice)",
      "5 lb boneless skinless chicken thighs, trimmed",
      "6 tbsp unsalted butter",
      "2 medium yellow onions, diced",
      "4 medium carrots, diced",
      "4 ribs celery, diced",
      "1 lb cremini mushrooms, sliced",
      "8 cloves garlic, minced",
      "1 tbsp fresh thyme leaves, chopped",
      "2 bay leaves",
      "¾ cup all-purpose flour",
      "¼ cup dry sherry",
      "12 cups low-sodium chicken stock",
      "2 tbsp kosher salt (for the soup)",
      "1½ tsp black pepper, freshly ground",
      "2 cups heavy cream",
      "1 tbsp fresh lemon juice",
      "1 bunch flat-leaf parsley, chopped"
    ],
    "directions": [
      "Bring the wild rice, 8 cups water and 2 tsp salt to a boil in a 4-quart saucepan. Cover partially and simmer 45 to 55 minutes, until most kernels have split and are tender but still chewy. Drain well, spread on a sheet pan and cool.",
      "Meanwhile, melt the butter in an 8-quart Dutch oven over medium heat. Add the onions, carrots and celery and cook, stirring occasionally, until softened, about 8 minutes.",
      "Add the mushrooms and cook until they release their liquid and it evaporates, 8 to 10 minutes. Stir in the garlic, thyme and bay leaves and cook 1 minute.",
      "Sprinkle the flour over the vegetables and stir constantly for 2 minutes to cook out the raw taste. Add the sherry and stir until absorbed, then slowly whisk in the stock so no lumps form.",
      "Add the chicken thighs whole, 2 tbsp salt and the pepper. Bring to a simmer, reduce the heat to low and cook gently, partly covered, 20 to 25 minutes, until the thickest thigh reads 165°F.",
      "Transfer the chicken to a cutting board, cool 10 minutes and shred into bite-size pieces with two forks. Discard the bay leaves.",
      "Stir the cream into the soup and simmer 5 minutes until lightly thickened; it should coat a spoon but still pour easily. Return the chicken, add the lemon juice and half the parsley, and taste for salt.",
      "Divide the soup between two or three shallow pans to cool quickly, stirring occasionally. Keep the cooled wild rice separate.",
      "To pack, spoon ½ cup wild rice into each of 12 containers and ladle about 1¼ cups cooled soup over it. Top with the remaining parsley, lid and label."
    ],
    "equipment": [
      "8-quart Dutch oven",
      "4-quart saucepan",
      "Rimmed half-sheet pan (18 x 13-inch)",
      "Ladle",
      "Instant-read thermometer",
      "12 soup containers (24 oz)"
    ],
    "storage": "Cool the soup in shallow pans, stirring, before refrigerating at 40°F or below. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Keeps 4 days refrigerated. Freezes up to 2 months; the cream may look slightly grainy after thawing but smooths out with stirring as it reheats.",
    "reheating": "The rice absorbs broth as it sits, so add 2 to 3 tbsp water or stock before reheating. Microwave: cover loosely and heat on high 3 to 4 minutes, stirring every minute, until 165°F. Stovetop or oven: warm in a covered saucepan over medium-low, or an oven-safe covered dish at 350°F for 20 to 25 minutes, stirring once, until 165°F.",
    "makeAhead": "",
    "safety": "Cook chicken to 165°F. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Reheat soups to a full 165°F.",
    "chefNotes": "Salt amounts assume Diamond Crystal kosher salt and low-sodium stock. Always cook wild rice separately: simmered in the soup it bursts, turns starchy and drinks the broth dry by day two."
  },
  {
    "id": 5,
    "slug": "green-chile-chicken-enchiladas",
    "side": "meal-prep",
    "title": "Green Chile Chicken Enchiladas",
    "category": "Poultry",
    "description": "Corn tortillas rolled around tender chicken, roasted green chiles and melty Jack cheese, baked under a tangy roasted tomatillo sauce.",
    "servings": 12,
    "yieldNote": "12 portions (3 enchiladas each)",
    "active": 75,
    "total": 135,
    "tags": [
      "Gluten-free",
      "Freezer-friendly",
      "High protein"
    ],
    "allergens": [
      "Milk"
    ],
    "dietary": [
      "Gluten-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "5 lb boneless skinless chicken thighs, trimmed",
      "6 cups low-sodium chicken stock (gluten-free)",
      "4½ lb tomatillos, husked and rinsed",
      "4 medium poblano peppers",
      "2 medium jalapeños, stemmed",
      "2 medium white onions, quartered",
      "8 cloves garlic, unpeeled",
      "1 bunch cilantro, stems and leaves",
      "3 tbsp vegetable oil (for the sauce)",
      "1 tbsp ground cumin",
      "2 tsp dried Mexican oregano",
      "1½ tbsp kosher salt (for the sauce)",
      "2 cans (4 oz each) diced green chiles, drained",
      "1 cup sour cream",
      "1 tbsp kosher salt (for the filling)",
      "1½ lb Monterey Jack cheese, shredded",
      "36 corn tortillas (6-inch, 100% corn, labeled gluten-free)",
      "6 tbsp vegetable oil (for the tortillas)",
      "1 medium red onion, thinly sliced (for garnish)"
    ],
    "directions": [
      "Put the chicken in a 6-quart pot, add the stock and enough water to cover by an inch, and bring to a bare simmer. Cook gently 18 to 22 minutes, until the thickest piece reads 165°F. Remove the chicken, reserve 3 cups of the poaching liquid, and shred the meat when cool enough to handle.",
      "Set an oven rack 6 inches from the broiler and heat the broiler to high. Spread the tomatillos, poblanos, jalapeños, onion quarters and garlic on two foil-lined sheet pans and broil one pan at a time 8 to 12 minutes, turning once, until blistered and blackened in spots and the tomatillos are soft and olive green.",
      "Put the poblanos in a covered bowl for 10 minutes, then peel, stem and seed them. Peel the garlic. Chop half the poblanos for the filling.",
      "Blend the tomatillos and their juices, the remaining poblanos, jalapeños, onion, garlic, cilantro, cumin, oregano, 1½ tbsp salt and the 3 cups reserved poaching liquid until smooth, working in batches.",
      "Heat 3 tbsp oil in a Dutch oven over medium-high heat until shimmering, pour in the sauce (it will spatter) and simmer 10 minutes, stirring, until slightly thickened and deepened in color. You should have about 12 cups.",
      "Heat the oven to 400°F. In a large bowl, mix the shredded chicken, chopped poblanos, canned green chiles, sour cream, 1 tbsp salt, half the cheese and 1½ cups of the sauce.",
      "Brush both sides of the tortillas lightly with oil, shingle them on sheet pans in batches and bake 2 to 3 minutes, until soft and pliable; this keeps them from cracking and turning soggy.",
      "Spread 1 cup sauce in each of three 9 x 13-inch baking dishes. Fill each tortilla with a heaping ½ cup filling, roll tightly and lay seam side down, 12 per dish.",
      "Spoon 1½ cups sauce over each dish, leaving the ends of the tortillas lightly coated, and scatter the remaining cheese on top. Bake uncovered 20 to 25 minutes, until bubbling at the edges, the cheese is spotted brown and the center reads 165°F.",
      "Cool 30 minutes, then portion 3 enchiladas into each of 12 containers with a spatula. Pack the remaining sauce (about ¼ cup per portion) and red onion in small side cups."
    ],
    "equipment": [
      "6-quart pot",
      "7-quart Dutch oven",
      "2 rimmed half-sheet pans (18 x 13-inch)",
      "Blender",
      "Three 9 x 13-inch baking dishes",
      "Instant-read thermometer",
      "12 meal-prep containers with small side cups"
    ],
    "storage": "Cool no longer than 2 hours before refrigerating at 40°F or below. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Keeps 4 days refrigerated. Freezes well for up to 3 months; freeze the extra sauce alongside.",
    "reheating": "Spoon the reserved sauce over the enchiladas first. Microwave: cover loosely and heat at 70% power 3 to 4 minutes until the center reaches 165°F. Oven: place in an oven-safe dish, cover with foil and bake at 350°F for 20 minutes, uncovering for the last 5, until 165°F in the center. Top with the red onion after heating.",
    "makeAhead": "",
    "safety": "Cook chicken to 165°F and reheat the assembled enchiladas to 165°F. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Use 100% corn tortillas to keep this gluten-free; some brands blend in wheat flour.",
    "chefNotes": "Salt amounts assume Diamond Crystal kosher salt. Holding back part of the sauce for reheating is the trick for meal-prep enchiladas: the tortillas stay intact in storage and still get a fresh, saucy finish."
  },
  {
    "id": 6,
    "slug": "turkey-meatballs-in-marinara-with-penne-and-zucchini",
    "side": "meal-prep",
    "title": "Turkey Meatballs in Marinara with Penne and Zucchini",
    "category": "Poultry",
    "description": "Tender Parmesan-garlic turkey meatballs simmered in a simple marinara, served over penne with golden roasted zucchini.",
    "servings": 12,
    "yieldNote": "12 portions (4 meatballs, 1 cup penne, ¾ cup sauce and ½ cup zucchini each)",
    "active": 70,
    "total": 110,
    "tags": [
      "Kid-friendly",
      "Freezer-friendly",
      "High protein"
    ],
    "allergens": [
      "Milk",
      "Egg",
      "Wheat"
    ],
    "dietary": [],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "1½ cups panko bread crumbs",
      "1 cup whole milk",
      "3 large eggs",
      "5 lb ground turkey (93% lean)",
      "1 cup Parmesan cheese, finely grated",
      "½ cup flat-leaf parsley, chopped",
      "6 cloves garlic, grated (for the meatballs)",
      "2 tsp dried oregano (for the meatballs)",
      "1 tsp fennel seed, crushed",
      "5 tsp kosher salt (for the meatballs)",
      "1½ tsp black pepper, freshly ground",
      "3 tbsp olive oil (for the meatballs)",
      "¼ cup olive oil (for the sauce)",
      "1 medium yellow onion, finely chopped",
      "10 cloves garlic, thinly sliced (for the sauce)",
      "1 tsp red pepper flakes",
      "3 cans (28 oz each) crushed tomatoes",
      "1 tsp dried oregano (for the sauce)",
      "1 tbsp kosher salt (for the sauce)",
      "1 tsp sugar",
      "1 bunch basil, torn",
      "2 lb penne",
      "3 tbsp kosher salt (for the pasta water)",
      "2 tbsp olive oil (for the pasta)",
      "4 lb zucchini, halved lengthwise and cut into ½-inch half-moons",
      "3 tbsp olive oil (for the zucchini)",
      "1½ tsp kosher salt (for the zucchini)"
    ],
    "directions": [
      "Heat the oven to 425°F with racks in the upper and lower thirds and oil two 18 x 13-inch rimmed sheet pans. Mash the panko and milk together in a large bowl and let stand 5 minutes, then beat in the eggs.",
      "Add the turkey, Parmesan, parsley, grated garlic, oregano, fennel, 5 tsp salt, pepper and 3 tbsp oil. Mix gently with your hands just until evenly combined; overworking makes lean turkey tough.",
      "With wet hands, roll into 1½-inch meatballs (about 2 oz each, roughly 48) and space them on the sheet pans. Bake 15 to 18 minutes, swapping pans halfway, until browned; they will finish cooking in the sauce.",
      "While the meatballs bake, heat ¼ cup oil in a 7- to 8-quart Dutch oven over medium heat. Cook the onion until soft and translucent, 6 to 8 minutes, then add the sliced garlic and pepper flakes and cook until the garlic is pale golden, about 1 minute.",
      "Add the tomatoes, oregano, 1 tbsp salt and sugar. Simmer, partially covered and stirring occasionally, 20 minutes, until slightly thickened.",
      "Nestle the meatballs and any pan juices into the sauce and simmer gently 10 minutes, until the centers read 165°F. Stir in the basil.",
      "Toss the zucchini with 3 tbsp oil and 1½ tsp salt, spread on the empty sheet pans, raise the oven to 450°F and roast for 12 to 15 minutes, until browned at the edges but still holding their shape.",
      "Bring 6 quarts water and 3 tbsp salt to a boil, add the penne and cook 2 minutes less than the package directions so it is firm in the center. Drain, toss with 2 tbsp oil and spread on a sheet pan to cool.",
      "Once cool, portion 1 cup penne, 4 meatballs with about ¾ cup sauce and ½ cup zucchini into each of 12 containers, spooning the sauce over the meatballs rather than soaking the pasta."
    ],
    "equipment": [
      "2 rimmed half-sheet pans (18 x 13-inch)",
      "7- to 8-quart Dutch oven",
      "8-quart stockpot",
      "Colander",
      "Large mixing bowl",
      "Instant-read thermometer",
      "12 meal-prep containers (about 32 oz)"
    ],
    "storage": "Cool meatballs and sauce in a shallow pan before refrigerating at 40°F or below. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Keeps 4 days refrigerated. Meatballs in sauce freeze well up to 3 months; pasta and zucchini are better fresh.",
    "reheating": "Microwave: stir the sauce into the pasta, cover loosely and heat at 70% power 3 minutes, turning the meatballs halfway, until they reach 165°F. Oven: transfer to an oven-safe dish, cover tightly with foil and heat at 350°F for 20 to 25 minutes to 165°F in the center of a meatball.",
    "makeAhead": "",
    "safety": "Ground turkey must reach 165°F. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Reheat to 165°F.",
    "chefNotes": "Salt amounts assume Diamond Crystal kosher salt. The milk-soaked panko is what keeps 93% lean turkey moist through four days and a reheat; do not skip it or swap in dry crumbs."
  },
  {
    "id": 7,
    "slug": "greek-chicken-bowls-with-tzatziki-and-cucumber-tomato-salad",
    "side": "meal-prep",
    "title": "Greek Chicken Bowls with Tzatziki and Cucumber-Tomato Salad",
    "category": "Poultry",
    "description": "Oregano-lemon chicken over lemony rice, packed with cool garlicky tzatziki and a crunchy cucumber, tomato, olive and feta salad.",
    "servings": 12,
    "yieldNote": "12 portions (about 5½ oz chicken, 1 cup rice, ⅓ cup tzatziki and ¾ cup salad each)",
    "active": 60,
    "total": 120,
    "tags": [
      "High protein",
      "Gluten-free",
      "Seasonal: summer"
    ],
    "allergens": [
      "Milk"
    ],
    "dietary": [
      "Gluten-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "6 lb boneless skinless chicken thighs, trimmed",
      "½ cup olive oil (for the marinade)",
      "⅓ cup fresh lemon juice (for the marinade)",
      "1 tbsp grated lemon zest",
      "10 cloves garlic, minced (for the marinade)",
      "2 tbsp dried oregano (for the marinade)",
      "2 tsp sweet paprika",
      "2 tbsp kosher salt (for the chicken)",
      "2 tsp black pepper, freshly ground",
      "4 cups long-grain white rice",
      "3 tbsp olive oil (for the rice)",
      "6 cups low-sodium chicken stock (gluten-free)",
      "2 tsp kosher salt (for the rice)",
      "2 tbsp fresh lemon juice (for the rice)",
      "4 cups whole-milk Greek yogurt",
      "2 medium English cucumbers, coarsely grated (for the tzatziki)",
      "1½ tsp kosher salt (for the tzatziki)",
      "4 cloves garlic, grated (for the tzatziki)",
      "3 tbsp fresh lemon juice (for the tzatziki)",
      "2 tbsp olive oil (for the tzatziki)",
      "¼ cup fresh dill, chopped",
      "2 medium English cucumbers, cut into ½-inch dice (for the salad)",
      "2 lb cherry tomatoes, halved",
      "1 medium red onion, finely diced",
      "¾ cup pitted Kalamata olives, halved",
      "8 oz feta cheese, crumbled",
      "½ cup flat-leaf parsley, chopped",
      "½ cup olive oil (for the vinaigrette)",
      "6 tbsp red wine vinegar",
      "2 tsp dried oregano (for the vinaigrette)",
      "1 tsp kosher salt (for the vinaigrette)"
    ],
    "directions": [
      "Whisk ½ cup oil, ⅓ cup lemon juice, zest, minced garlic, 2 tbsp oregano, paprika, 2 tbsp salt and pepper in a large bowl. Add the chicken, turn to coat and refrigerate 30 minutes to 4 hours.",
      "For the tzatziki, toss the grated cucumber with 1½ tsp salt in a strainer set over a bowl and drain 15 minutes. Squeeze it hard in a clean towel until very dry, then stir into the yogurt with the grated garlic, 3 tbsp lemon juice, 2 tbsp oil and dill. Refrigerate.",
      "Heat the oven to 425°F with racks in the upper and lower thirds. Arrange the chicken in a single layer on two foil-lined 18 x 13-inch rimmed sheet pans fitted with wire racks.",
      "Roast 20 to 25 minutes, swapping pans halfway, until browned and the thickest pieces read 165°F (175°F is ideal for thighs). Broil each pan 2 to 3 minutes for char, rest 5 minutes and slice ½ inch thick.",
      "While the chicken roasts, rinse the rice until the water runs mostly clear. Heat 3 tbsp oil in a 5-quart pot over medium heat, add the rice and stir 3 minutes until the edges turn translucent. Add the stock and 2 tsp salt, bring to a boil, cover and cook on the lowest heat 18 minutes.",
      "Rest the rice off heat, covered, 10 minutes, then fluff with 2 tbsp lemon juice and spread on a sheet pan to cool.",
      "For the salad, combine the diced cucumbers, tomatoes, red onion, olives, feta and parsley. Shake the ½ cup oil, vinegar, 2 tsp oregano and 1 tsp salt in a jar; keep the vinaigrette separate so the salad stays crisp.",
      "When the chicken and rice are cool, portion 1 cup rice and about 5½ oz chicken into the main compartment of each of 12 containers. Pack ¾ cup salad in a second compartment and ⅓ cup tzatziki plus 1 tbsp vinaigrette in small lidded cups."
    ],
    "equipment": [
      "2 rimmed half-sheet pans (18 x 13-inch) with wire racks",
      "5-quart saucepan with lid",
      "Box grater",
      "Fine-mesh strainer",
      "Instant-read thermometer",
      "12 three-compartment meal-prep containers plus 24 small lidded cups"
    ],
    "storage": "Cool chicken and rice before refrigerating at 40°F or below. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Keeps 4 days refrigerated; the tzatziki holds 4 days and the undressed salad 3 to 4 days. Do not freeze the tzatziki or salad; chicken and rice can be frozen up to 2 months.",
    "reheating": "Remove the salad and tzatziki cups first; they are served cold. Microwave: sprinkle 1 tbsp water over the rice, cover loosely and heat at 70% power 2 to 2½ minutes until the chicken reaches 165°F. Oven: transfer chicken and rice to an oven-safe dish, add 2 tbsp water, cover with foil and heat at 350°F for 15 minutes to 165°F. Dress the salad and add tzatziki after heating.",
    "makeAhead": "",
    "safety": "Cook chicken to 165°F. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Keep tzatziki refrigerated and do not reheat it.",
    "chefNotes": "Salt amounts assume Diamond Crystal kosher salt. Wringing the salted cucumber until almost dry is what keeps the tzatziki thick for four days instead of weeping into a puddle."
  },
  {
    "id": 8,
    "slug": "chicken-pot-pie-with-biscuit-topping",
    "side": "meal-prep",
    "title": "Chicken Pot Pie with Biscuit Topping",
    "category": "Poultry",
    "description": "Creamy, thyme-scented chicken and vegetable filling crowned with tall, flaky buttermilk biscuits that are baked separately to stay crisp.",
    "servings": 12,
    "yieldNote": "12 portions (about 1½ cups filling and 2 biscuits each)",
    "active": 80,
    "total": 135,
    "tags": [
      "Kid-friendly",
      "Freezer-friendly",
      "Seasonal: fall"
    ],
    "allergens": [
      "Milk",
      "Wheat"
    ],
    "dietary": [],
    "image": "/cookbook/mp/chicken-pot-pie-with-biscuit-topping.webp",
    "photoCredit": {
      "author": "Elijah Crouch",
      "source": "Unsplash",
      "page": "https://unsplash.com/photos/NcsdLcklhMQ"
    },
    "ingredients": [
      "5 lb boneless skinless chicken thighs, trimmed",
      "8 cups low-sodium chicken stock",
      "14 tbsp unsalted butter (for the filling)",
      "2 medium yellow onions, diced",
      "4 medium carrots, cut into ½-inch dice",
      "4 ribs celery, cut into ½-inch slices",
      "6 cloves garlic, minced",
      "1¼ cups all-purpose flour (for the filling)",
      "2 cups whole milk",
      "1 tbsp fresh thyme leaves, chopped",
      "2 tbsp kosher salt (for the filling)",
      "1½ tsp black pepper, freshly ground",
      "1 lb frozen peas",
      "2 tbsp fresh lemon juice",
      "½ cup flat-leaf parsley, chopped",
      "6 cups all-purpose flour (for the biscuits)",
      "2 tbsp baking powder",
      "1 tsp baking soda",
      "1 tbsp sugar",
      "1 tbsp kosher salt (for the biscuits)",
      "1½ cups cold unsalted butter, cut into ½-inch cubes (for the biscuits)",
      "2¼ cups cold buttermilk",
      "2 tbsp unsalted butter, melted (for brushing)"
    ],
    "directions": [
      "Put the chicken and stock in a 6-quart pot, add water to cover by an inch if needed, and bring to a bare simmer. Poach 18 to 22 minutes until the thickest thigh reads 165°F. Transfer the chicken to a board, measure out 8 cups of the poaching liquid and keep it warm. Cut the chicken into bite-size pieces once cool enough to handle.",
      "For the biscuits, whisk 6 cups flour, baking powder, baking soda, sugar and 1 tbsp salt in a large bowl. Toss in the cold butter cubes and rub them in with your fingertips until the largest pieces are the size of peas. Refrigerate 10 minutes.",
      "Heat the oven to 425°F with racks in the upper and lower thirds. Stir the buttermilk into the flour mixture just until a shaggy dough forms; turn onto a floured counter, pat into a rectangle, fold in thirds, and repeat twice for flaky layers.",
      "Pat the dough ¾ inch thick and cut 24 biscuits with a 2½-inch cutter, pressing straight down without twisting; gently re-pat the scraps once. Set on two parchment-lined sheet pans, brush with melted butter and bake 14 to 18 minutes, swapping pans halfway, until tall and deep golden. Cool on a rack.",
      "For the filling, melt 14 tbsp butter in an 8-quart Dutch oven over medium heat. Cook the onions, carrots and celery until the onions are soft and the carrots are just tender, about 10 minutes, then add the garlic for 1 minute.",
      "Sprinkle in 1¼ cups flour and stir constantly 2 minutes without letting it brown. Slowly whisk in the warm poaching liquid, then the milk, and bring to a simmer, whisking, until thick enough to coat the back of a spoon, about 5 minutes.",
      "Add the thyme, 2 tbsp salt, pepper and chicken and simmer 5 minutes. Stir in the frozen peas, lemon juice and parsley off the heat; the peas cool the filling and stay bright. Taste and adjust the salt; it should be well seasoned, since flavors dull when chilled.",
      "Divide the filling between shallow pans to cool, stirring now and then. When no longer steaming, portion about 1½ cups into each of 12 oven-safe containers.",
      "Pack 2 cooled biscuits per portion in a separate bag or compartment so they do not absorb steam from the filling."
    ],
    "equipment": [
      "8-quart Dutch oven",
      "6-quart pot",
      "2 rimmed half-sheet pans (18 x 13-inch)",
      "2½-inch round biscuit cutter",
      "Large mixing bowl",
      "Instant-read thermometer",
      "12 oven-safe meal-prep containers (about 24 oz)"
    ],
    "storage": "Cool the filling in shallow pans before refrigerating at 40°F or below. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Filling keeps 4 days refrigerated and freezes up to 3 months. Store biscuits airtight in the refrigerator up to 4 days or freeze up to 2 months.",
    "reheating": "Microwave: stir 2 tbsp water or milk into the filling, cover loosely and heat on high 3 to 4 minutes, stirring halfway, until 165°F; warm the biscuits 15 seconds or toast them. Oven (best): heat the filling covered with foil at 375°F for 20 minutes, then set the biscuits on top and bake uncovered 8 to 10 minutes, until the filling bubbles and reaches 165°F and the biscuits are crisp.",
    "makeAhead": "",
    "safety": "Cook chicken to 165°F. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Reheat filling to 165°F.",
    "chefNotes": "Salt amounts assume Diamond Crystal kosher salt and low-sodium stock. Baking the biscuits separately is a deliberate meal-prep choice: biscuits baked on the filling turn gummy underneath within a day, while these crisp up again in the oven."
  },
  {
    "id": 9,
    "slug": "braised-beef-rag-over-creamy-polenta",
    "side": "meal-prep",
    "title": "Braised Beef Ragù over Creamy Polenta",
    "category": "Beef, Pork & Lamb",
    "description": "Beef chuck slow-braised in Oregon Pinot Noir and tomatoes until it falls apart, spooned over creamy Parmesan polenta.",
    "servings": 12,
    "yieldNote": "12 portions (about 1 cup ragù and 1 cup polenta each)",
    "active": 60,
    "total": 270,
    "tags": [
      "Freezer-friendly",
      "High protein",
      "Seasonal: fall"
    ],
    "allergens": [
      "Milk"
    ],
    "dietary": [
      "Gluten-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "7 lb boneless beef chuck roast, trimmed and cut into 3-inch chunks",
      "2 tbsp kosher salt (for the beef)",
      "2 tsp black pepper, freshly ground",
      "3 tbsp olive oil",
      "2 medium yellow onions, finely chopped",
      "2 medium carrots, finely chopped",
      "2 ribs celery, finely chopped",
      "10 cloves garlic, minced",
      "¼ cup tomato paste",
      "2 cups Pinot Noir",
      "2 cans (28 oz each) whole peeled tomatoes, crushed by hand",
      "2 cups low-sodium beef stock (gluten-free)",
      "2 fresh rosemary sprigs",
      "3 bay leaves",
      "1 tsp red pepper flakes",
      "1 tbsp balsamic vinegar",
      "12 cups water (for the polenta)",
      "3 cups whole milk (for the polenta)",
      "2 tbsp kosher salt (for the polenta)",
      "¼ tsp baking soda",
      "3 cups coarse-ground cornmeal",
      "4 tbsp unsalted butter",
      "1½ cups Parmesan cheese, finely grated",
      "½ cup flat-leaf parsley, chopped"
    ],
    "directions": [
      "Season the beef all over with 2 tbsp salt and the pepper; if time allows, refrigerate uncovered up to 24 hours. Heat the oven to 300°F with a rack in the lower third.",
      "Heat the oil in a 9-quart Dutch oven over medium-high heat until shimmering. Brown the beef in 3 or 4 batches without crowding, 8 to 10 minutes per batch, until deeply browned on at least two sides. Transfer to a sheet pan.",
      "Lower the heat to medium, add the onions, carrots and celery and cook, scraping up the browned bits, until soft, about 8 minutes. Add the garlic and tomato paste and cook 2 minutes, until the paste darkens.",
      "Pour in the Pinot Noir and simmer until reduced by half, about 5 minutes. Add the tomatoes, stock, rosemary, bay leaves and pepper flakes, then return the beef and its juices; the liquid should come about three-quarters of the way up the meat.",
      "Bring to a simmer, cover and braise in the oven 3 to 3½ hours, turning the beef once, until a fork slides in and the meat shreds with no resistance.",
      "Transfer the beef to a board, discard the herbs, and skim the fat from the surface of the sauce. Simmer the sauce on the stovetop 10 to 15 minutes until thick enough to coat a spoon. Shred the beef into bite-size pieces, return it to the pot, stir in the balsamic and taste for salt.",
      "For the polenta, bring the water, milk and 2 tbsp salt to a boil in an 8-quart heavy pot, stir in the baking soda, then pour in the cornmeal in a slow stream while whisking constantly. Return to a simmer, stirring, about 1 minute.",
      "Reduce the heat to the lowest setting, cover and cook 30 to 35 minutes, whisking thoroughly every 10 minutes and scraping the corners, until the grains are tender and the polenta is smooth and creamy. Off heat, stir in the butter and Parmesan.",
      "Spread the ragù in shallow pans to cool. Portion the polenta immediately, about 1 cup per container, while it is still loose; it firms as it cools. Once the ragù has cooled, spoon about 1 cup over or beside each portion and sprinkle with parsley."
    ],
    "equipment": [
      "9-quart Dutch oven",
      "8-quart heavy-bottomed pot with lid",
      "Rimmed half-sheet pan (18 x 13-inch)",
      "Sturdy whisk",
      "Tongs",
      "Instant-read thermometer",
      "12 oven-safe meal-prep containers (about 32 oz)"
    ],
    "storage": "Cool the ragù in shallow pans before refrigerating at 40°F or below. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Keeps 4 days refrigerated. The ragù freezes beautifully for up to 3 months; polenta freezes acceptably up to 2 months but may turn slightly grainy.",
    "reheating": "The polenta sets firm when chilled; add 3 tbsp milk or water to it before reheating. Microwave: cover loosely and heat at 70% power 3 to 4 minutes, stirring the polenta vigorously after each minute until creamy, until everything reaches 165°F. Oven: transfer to an oven-safe dish, add the liquid, cover tightly with foil and heat at 350°F for 25 minutes, stirring the polenta once, until 165°F.",
    "makeAhead": "",
    "safety": "Whole cuts of beef are safe at 145°F with a 3-minute rest; this braise cooks well beyond that to about 200°F for tenderness. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Reheat to 165°F.",
    "chefNotes": "Salt amounts assume Diamond Crystal kosher salt. The pinch of baking soda softens the corn so the polenta goes creamy without constant stirring; use coarse-ground cornmeal, not instant, so it survives reheating."
  },
  {
    "id": 10,
    "slug": "beef-and-bean-chili",
    "side": "meal-prep",
    "title": "Beef and Bean Chili",
    "category": "Beef, Pork & Lamb",
    "description": "A hearty, smoky beef and two-bean chili built on toasted ancho chiles and warm spices, thickened with masa for body.",
    "servings": 12,
    "yieldNote": "12 portions (about 1½ cups each)",
    "active": 50,
    "total": 135,
    "tags": [
      "Freezer-friendly",
      "High protein",
      "Gluten-free"
    ],
    "allergens": [],
    "dietary": [
      "Gluten-free",
      "Dairy-free"
    ],
    "image": "/cookbook/mp/beef-and-bean-chili.webp",
    "photoCredit": {
      "author": "Zak Chapman",
      "source": "Pexels",
      "page": "https://www.pexels.com/photo/meat-dish-1618906/"
    },
    "ingredients": [
      "4 dried ancho chiles, stemmed and seeded",
      "2 cups low-sodium beef stock (gluten-free)",
      "5 lb ground beef (85% lean)",
      "2 tbsp vegetable oil",
      "3 medium yellow onions, diced",
      "2 medium red bell peppers, diced",
      "2 medium jalapeños, minced",
      "10 cloves garlic, minced",
      "¼ cup chili powder",
      "2 tbsp ground cumin",
      "1 tbsp dried Mexican oregano",
      "1 tbsp smoked paprika",
      "½ tsp ground cinnamon",
      "3 tbsp tomato paste",
      "2 canned chipotle chiles in adobo (gluten-free brand), minced",
      "2 cans (28 oz each) crushed tomatoes",
      "2 cans (15 oz each) kidney beans, drained and rinsed",
      "2 cans (15 oz each) pinto beans, drained and rinsed",
      "2 tbsp kosher salt",
      "1 tsp black pepper, freshly ground",
      "¼ cup masa harina",
      "½ cup water (for the masa)",
      "1 tbsp cider vinegar",
      "1 bunch cilantro, chopped",
      "3 medium limes, cut into 12 wedges"
    ],
    "directions": [
      "Toast the anchos in a dry 8-quart Dutch oven over medium heat, pressing with tongs, 20 to 30 seconds per side until fragrant and pliable; do not let them smoke. Transfer to a bowl, cover with the hot stock and soak 15 minutes, then blend the chiles and stock until smooth.",
      "Heat the oil in the Dutch oven over medium-high heat. Brown the beef in 3 batches, breaking it into small pieces, 6 to 8 minutes per batch, until no pink remains and some bits are crusty. Transfer to a bowl with a slotted spoon, leaving about 3 tbsp fat in the pot.",
      "Add the onions, bell peppers and jalapeños and cook over medium heat until soft, about 8 minutes. Stir in the garlic, chili powder, cumin, oregano, paprika and cinnamon and cook 1 minute until fragrant.",
      "Add the tomato paste and chipotles and cook 2 minutes. Stir in the ancho purée, crushed tomatoes, beef and its juices, 2 tbsp salt and the pepper, scraping up any browned bits.",
      "Bring to a simmer, then cook partially covered over low heat for 45 minutes, stirring every 10 minutes so the bottom does not catch.",
      "Stir in the beans and simmer 15 minutes more so they absorb the flavor without breaking down.",
      "Whisk the masa harina into ½ cup water until smooth, stir it into the chili and simmer 5 minutes, until the chili thickens and turns glossy. Add the vinegar and taste for salt; it should be well seasoned, as flavors dull slightly when cold.",
      "Transfer to shallow pans no more than 2 inches deep to cool quickly, stirring occasionally. Portion about 1½ cups into each of 12 containers and pack cilantro and a lime wedge in a small side cup."
    ],
    "equipment": [
      "8-quart Dutch oven",
      "Blender",
      "Slotted spoon",
      "Tongs",
      "Instant-read thermometer",
      "12 meal-prep containers (24 oz)"
    ],
    "storage": "Cool in shallow pans before refrigerating at 40°F or below. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Keeps 4 days refrigerated and improves by day two. Freezes very well for up to 3 months.",
    "reheating": "Microwave: cover loosely and heat on high 3 to 4 minutes, stirring every minute, until 165°F throughout; add a splash of water if thick. Oven: transfer to an oven-safe dish, cover tightly with foil and heat at 350°F for 25 minutes, stirring once, until 165°F. Add the cilantro and lime after heating.",
    "makeAhead": "",
    "safety": "Ground beef must reach 160°F; brown it fully before simmering. Cool to 70°F within 2 hours and to 41°F or below within the next 4 hours. Reheat to 165°F. Check the chipotle and chili powder labels; some contain wheat.",
    "chefNotes": "Salt amounts assume Diamond Crystal kosher salt; canned beans and tomatoes vary, so taste at the end. Masa harina adds a toasty corn flavor and body that flour cannot, and keeps the chili gluten-free."
  },
  {
    "id": 11,
    "slug": "beef-bulgogi-bowls-with-rice-and-quick-pickles",
    "side": "meal-prep",
    "title": "Beef Bulgogi Bowls with Rice and Quick Pickles",
    "category": "Beef, Pork & Lamb",
    "description": "Pear-and-garlic marinated sirloin seared in hot batches over short-grain rice, with crunchy quick-pickled cucumber, carrot and daikon packed on the side.",
    "servings": 12,
    "yieldNote": "12 portions (about 5 oz beef and 1½ cups rice each, plus pickles)",
    "active": 75,
    "total": 165,
    "tags": [
      "High protein",
      "Dairy-free",
      "Make-ahead"
    ],
    "allergens": [
      "Soy",
      "Wheat",
      "Sesame"
    ],
    "dietary": [
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "5 lb boneless top sirloin or chuck eye, trimmed of excess fat",
      "1 cup low-sodium soy sauce",
      "⅓ cup packed light brown sugar",
      "1 large Asian pear, peeled and finely grated",
      "12 cloves garlic, minced",
      "2 tbsp fresh ginger, finely grated",
      "3 tbsp toasted sesame oil",
      "1 tsp black pepper, freshly ground",
      "1 bunch scallions, thinly sliced, whites and greens kept separate",
      "2 medium yellow onions, halved and thinly sliced",
      "3 tbsp neutral oil, divided",
      "½ cup water (for deglazing)",
      "7 cups short-grain white rice",
      "7¾ cups water (for the rice)",
      "2 English cucumbers, thinly sliced",
      "4 medium carrots, julienned",
      "1 lb daikon radish, peeled and julienned",
      "1½ cups unseasoned rice vinegar (for the pickles)",
      "1 cup water (for the pickles)",
      "⅓ cup sugar (for the pickles)",
      "1 tbsp kosher salt (for the pickles)",
      "3 tbsp toasted sesame seeds"
    ],
    "directions": [
      "Freeze the beef on a sheet pan for 45 minutes, until firm at the edges but still sliceable. Slice across the grain as thin as you can, about ⅛ inch, then cut any wide slices into 3-inch lengths.",
      "Whisk the soy sauce, brown sugar, grated pear with its juice, garlic, ginger, sesame oil, pepper and scallion whites in a large nonreactive bowl until the sugar dissolves. Add the beef and sliced onions, massage to coat every slice, cover and refrigerate at least 1 hour and no more than 6 hours.",
      "For the pickles, bring the rice vinegar, water, sugar and salt to a simmer in a small saucepan, stirring until clear, then let cool for 10 minutes. Pack the cucumbers, carrots and daikon into two quart jars, pour the warm brine over, lid and refrigerate at least 1 hour.",
      "Rinse the rice in a large bowl, changing the water four or five times, until it runs nearly clear, then drain well. Combine rice and water in a heavy 8-quart pot, bring to a boil over high heat, cover, reduce to the lowest flame and cook 15 minutes. Take off the heat and leave covered 10 minutes.",
      "Fluff the rice and spread it on two parchment-lined rimmed sheet pans in an even layer so it steams off and cools quickly.",
      "Heat a 12-inch cast-iron skillet over high heat until it just begins to smoke. Add 2 tsp oil, lift about 1 lb of beef and onion from the marinade, letting the excess drip back, and spread it in a single layer.",
      "Sear undisturbed about 2 minutes, until the underside is browned and caramelized, then toss and cook 1 to 2 minutes more, until no pink remains. Transfer to a rimmed sheet pan and repeat with the remaining beef, adding oil as needed. Discard the leftover raw marinade.",
      "If sugar begins to scorch between batches, pour in a splash of the deglazing water, scrape, and pour the liquid over the cooked beef. After the last batch, add the rest of the water, scrape up the browned bits, boil 1 minute and pour over the beef.",
      "Cool the beef and rice on their sheet pans until they drop to 70°F, within 2 hours, before portioning.",
      "Portion 1½ cups rice and about 5 oz beef with onions into each of 12 containers, and sprinkle with scallion greens and sesame seeds. Drain the pickles and pack about ⅓ cup into 12 small lidded cups so they stay cold and crisp."
    ],
    "equipment": [
      "12-inch cast-iron skillet",
      "8-quart heavy pot with lid",
      "Rimmed sheet pans",
      "Chef's knife",
      "Two quart jars",
      "Microplane grater",
      "12 meal-prep containers with small side cups"
    ],
    "storage": "Cool uncovered in shallow layers so everything drops to 70°F within 2 hours and to 41°F or below within the next 4 hours, then lid and refrigerate at 40°F or colder. Keeps 4 days. Pickles keep 2 weeks in their brine. Beef and rice (without pickles) freeze up to 2 months; thaw overnight in the refrigerator.",
    "reheating": "Remove the pickle cup first. Microwave: sprinkle 1 tbsp water over the rice, cover loosely and heat on high 2 to 3 minutes, stirring halfway, until the center reaches 165°F. Oven: transfer to an oven-safe dish, add 2 tbsp water, cover with foil and heat at 350°F for 20 to 25 minutes, until 165°F. Serve the pickles cold on top.",
    "makeAhead": "",
    "safety": "Thin-sliced beef cooks well beyond the 145°F minimum for whole cuts; cook until no pink remains. Discard raw marinade or boil it before use. Cooked rice must be spread thin and cooled promptly (to 70°F within 2 hours, 41°F within 4 more). Reheat leftovers to 165°F.",
    "chefNotes": "Don't marinate longer than 6 hours: the pear's enzymes keep working and turn the beef mealy by day three. Crowding the pan steams the meat grey, so keep batches to about 1 lb in a very hot skillet. Salt amounts assume Diamond Crystal kosher salt; with Morton use 2 tsp in the brine."
  },
  {
    "id": 12,
    "slug": "carnitas-burrito-bowls-with-cilantro-lime-rice-and-beans",
    "side": "meal-prep",
    "title": "Carnitas Burrito Bowls with Cilantro-Lime Rice and Beans",
    "category": "Beef, Pork & Lamb",
    "description": "Citrus-braised pork shoulder shredded and broiled until crisp-edged, over cilantro-lime rice and cumin-scented black beans, with salsa verde packed on the side.",
    "servings": 12,
    "yieldNote": "12 portions (about 6 oz carnitas, 1 cup rice and ½ cup beans each)",
    "active": 60,
    "total": 270,
    "tags": [
      "High protein",
      "Freezer-friendly",
      "Kid-friendly"
    ],
    "allergens": [],
    "dietary": [
      "Gluten-free",
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "8 lb boneless pork shoulder (Boston butt), cut into 2-inch chunks",
      "3 tbsp kosher salt (for the pork)",
      "1 tbsp ground cumin (for the pork)",
      "1 tbsp dried Mexican oregano",
      "2 tsp black pepper",
      "1 large white onion, quartered",
      "10 cloves garlic, smashed",
      "4 bay leaves",
      "2 cinnamon sticks",
      "2 large oranges, halved",
      "2 limes, halved (for the pork)",
      "1 cup water (for the pork)",
      "4 cups long-grain white rice, rinsed",
      "6 cups water (for the rice)",
      "2 tbsp olive oil (for the rice)",
      "2 tsp kosher salt (for the rice)",
      "1 bunch cilantro, finely chopped",
      "3 limes, zested and juiced (for the rice)",
      "4 cans (15 oz) black beans, rinsed and drained",
      "2 tbsp olive oil (for the beans)",
      "1 medium yellow onion, finely diced",
      "4 cloves garlic, minced (for the beans)",
      "2 tsp ground cumin (for the beans)",
      "1 tsp chili powder",
      "1½ cups water (for the beans)",
      "1 tsp kosher salt (for the beans)",
      "2 cups salsa verde, for serving"
    ],
    "directions": [
      "Heat the oven to 300°F with a rack in the lower-middle position. In a large bowl, toss the pork with the salt, cumin, oregano and pepper until evenly coated.",
      "Arrange the pork in a snug single layer in a 12-by-16-inch roasting pan. Tuck in the onion, garlic, bay leaves and cinnamon sticks, squeeze the orange and lime halves over the meat, drop in the spent rinds and pour in the water. Cover tightly with two layers of foil.",
      "Braise 3 to 3½ hours, until the pork is fork-tender and a chunk shreds with light pressure (about 200°F inside). Transfer the meat to two rimmed sheet pans, strain the juices into a fat separator and discard the aromatics.",
      "While the pork braises, make the rice: heat the olive oil in a heavy 5-quart pot over medium heat, add the rice and stir 2 minutes until the grains turn opaque at the edges. Add the water and salt, bring to a boil, cover, and cook on low 18 minutes. Rest off the heat, covered, 10 minutes.",
      "Fluff the rice, fold in the cilantro, lime zest and lime juice, and spread on a parchment-lined sheet pan to cool.",
      "For the beans, heat the oil in a 4-quart saucepan over medium heat and cook the onion 5 minutes until soft. Stir in the garlic, cumin and chili powder for 30 seconds, then add the beans, water and salt and simmer 10 minutes, mashing about a quarter of the beans against the pot so the liquid turns creamy.",
      "Shred the pork into bite-size pieces, discarding any large pieces of fat. Toss with 1 cup of the defatted juices and 3 tbsp of the skimmed fat; reserve the remaining juices for reheating.",
      "Heat the broiler with a rack 4 inches from the element. Broil one sheet pan at a time for 4 to 6 minutes, until the edges are browned and crisp, then stir and broil 2 to 3 minutes more.",
      "Cool the pork, rice and beans in shallow layers until they drop to 70°F, within 2 hours.",
      "Portion 1 cup rice, ½ cup beans and about 6 oz carnitas into each of 12 containers, and drizzle each with 1 tbsp reserved juices. Pack salsa verde in 2-oz lidded cups."
    ],
    "equipment": [
      "12-by-16-inch roasting pan",
      "Heavy 5-quart pot with lid",
      "4-quart saucepan",
      "Rimmed sheet pans",
      "Fat separator",
      "12 meal-prep containers with small side cups"
    ],
    "storage": "Cool uncovered in shallow layers so everything drops to 70°F within 2 hours and to 41°F or below within the next 4 hours, then lid and refrigerate at 40°F or colder. Keeps 4 days. Carnitas freeze well for up to 3 months with a little of their juices; freeze rice and beans separately and thaw overnight in the refrigerator.",
    "reheating": "Remove the salsa cup first. Microwave: add 1 tbsp water, cover loosely and heat on high 2½ to 3 minutes, stirring halfway, until 165°F. Oven: transfer to an oven-safe dish, add 2 tbsp water or reserved juices, cover with foil and heat at 350°F for 20 to 25 minutes, uncovering for the last 5 minutes to re-crisp the pork, until 165°F.",
    "makeAhead": "",
    "safety": "The pork is braised far beyond the 145°F minimum for whole cuts, to about 200°F, for tenderness. Cool rice and beans promptly (to 70°F within 2 hours and 41°F within 4 more). Reheat leftovers to 165°F.",
    "chefNotes": "Save every drop of the defatted braising juice; a spoonful at portioning and another at reheating is what keeps day-four carnitas from drying out. Salt quantities assume Diamond Crystal kosher salt; with Morton, reduce the pork salt to 2 tbsp."
  },
  {
    "id": 13,
    "slug": "maple-dijon-pork-tenderloin-with-sweet-potatoes-and-sprouts",
    "side": "meal-prep",
    "title": "Maple-Dijon Pork Tenderloin with Sweet Potatoes and Sprouts",
    "category": "Beef, Pork & Lamb",
    "description": "Seared pork tenderloin lacquered with maple and two mustards, sliced over roasted sweet potatoes and cider-splashed Brussels sprouts, with extra glaze on the side.",
    "servings": 12,
    "yieldNote": "12 portions (about 6 oz pork, 1 cup sweet potatoes and ¾ cup sprouts each)",
    "active": 60,
    "total": 150,
    "tags": [
      "High protein",
      "Seasonal: fall",
      "Gluten-free"
    ],
    "allergens": [],
    "dietary": [
      "Gluten-free",
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "6¼ lb pork tenderloin (about 5 tenderloins), silver skin removed",
      "1½ tbsp kosher salt (for the pork)",
      "2 tsp black pepper (for the pork)",
      "2 tbsp neutral oil (for searing)",
      "¾ cup pure maple syrup",
      "½ cup Dijon mustard",
      "2 tbsp whole-grain mustard",
      "2 tbsp apple cider vinegar (for the glaze)",
      "4 cloves garlic, minced",
      "1 tbsp fresh thyme leaves, chopped",
      "5 lb sweet potatoes, peeled and cut into 1-inch cubes",
      "3 lb Brussels sprouts, trimmed and halved",
      "½ cup olive oil, divided",
      "1 tbsp kosher salt (for the vegetables)",
      "1 tsp black pepper (for the vegetables)",
      "1 tsp smoked paprika",
      "1 tbsp apple cider vinegar (for the sprouts)"
    ],
    "directions": [
      "Pat the tenderloins dry, fold the thin tail ends under and tie with twine so each piece is an even thickness. Season all over with the salt and pepper and refrigerate uncovered on a wire rack for at least 1 hour and up to overnight.",
      "Whisk the maple syrup, both mustards, cider vinegar, garlic and thyme in a small saucepan. Pour half into a bowl for glazing the raw pork. Simmer the other half 2 minutes to mellow the garlic, then set aside as the serving sauce; it never touches raw meat.",
      "Heat the oven to 425°F with racks in the upper-middle and lower-middle positions. Toss the sweet potatoes with ¼ cup olive oil, half the salt, the pepper and the smoked paprika and spread on two rimmed sheet pans without crowding.",
      "Roast the sweet potatoes 30 to 35 minutes, flipping and rotating the pans halfway, until browned at the edges and tender to a paring knife. Move to a cooling rack.",
      "Toss the sprouts with the remaining olive oil and salt, set them cut side down on the two sheet pans and roast 20 to 25 minutes, until the cut faces are deep brown and the centers are just tender. Toss with the cider vinegar while hot.",
      "Heat 1 tbsp neutral oil in a 12-inch skillet over medium-high heat until shimmering. Sear two or three tenderloins at a time, turning every 2 minutes, until browned on all sides, 6 to 8 minutes. Transfer to a wire rack set in a foil-lined rimmed sheet pan and repeat, adding oil as needed.",
      "Brush the pork with half of the raw-pork glaze and roast at 425°F for 10 minutes. Brush with the rest and roast 5 to 10 minutes more, until the thickest part reads 150°F.",
      "Tent loosely with foil and rest 10 minutes; it will be cooked through with no pink and still juicy. Remove the twine and slice ½ inch thick, then pour the resting juices over the slices.",
      "Cool the pork and vegetables in shallow layers until they drop to 70°F, within 2 hours.",
      "Portion about 6 oz sliced pork, 1 cup sweet potatoes and ¾ cup sprouts into each of 12 containers. Pack the simmered serving glaze in 1-oz lidded cups."
    ],
    "equipment": [
      "12-inch skillet",
      "Rimmed sheet pans",
      "Wire rack",
      "Instant-read thermometer",
      "Small saucepan",
      "Kitchen twine",
      "12 meal-prep containers with small side cups"
    ],
    "storage": "Cool uncovered in shallow layers so everything drops to 70°F within 2 hours and to 41°F or below within the next 4 hours, then lid and refrigerate at 40°F or colder. Keeps 4 days. The pork and sweet potatoes can be frozen up to 2 months; Brussels sprouts turn soft after freezing, so keep those refrigerated only.",
    "reheating": "Set the glaze cup aside. Microwave: cover loosely and heat at 70% power for 2½ to 3½ minutes, until the pork reaches 165°F, then spoon on the glaze. Oven: transfer to an oven-safe dish, add 1 tbsp water, cover with foil and heat at 325°F for 15 to 20 minutes, until 165°F. Lower power and a cover keep the lean slices from drying out.",
    "makeAhead": "",
    "safety": "Pork tenderloin is safe at 145°F after a 3-minute rest; this recipe takes it to 150°F and rests 10 so it is cooked through with no pink, which holds up better for meal prep reheating. Keep the brushing glaze that touches raw pork separate from the serving glaze. Reheat leftovers to 165°F.",
    "chefNotes": "Tenderloin is lean and dries out fast, so cut it thicker than you would for the table and add the glaze after reheating, not before. Salt amounts assume Diamond Crystal kosher salt; with Morton, cut the pork salt to 2½ tsp."
  },
  {
    "id": 14,
    "slug": "lamb-shepherd-s-pie",
    "side": "meal-prep",
    "title": "Lamb Shepherd's Pie",
    "category": "Beef, Pork & Lamb",
    "description": "Ground lamb simmered with carrots, peas, rosemary and red wine gravy under a buttery Yukon Gold mash, baked until the peaks turn golden.",
    "servings": 12,
    "yieldNote": "12 portions (two 9-by-13-inch pans, 6 squares each)",
    "active": 75,
    "total": 150,
    "tags": [
      "Freezer-friendly",
      "Kid-friendly",
      "Seasonal: winter"
    ],
    "allergens": [
      "Milk",
      "Wheat"
    ],
    "dietary": [],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "5 lb ground lamb",
      "2 tbsp olive oil",
      "2 large yellow onions, finely diced",
      "4 medium carrots, cut into ¼-inch dice",
      "3 celery stalks, cut into ¼-inch dice",
      "8 cloves garlic, minced",
      "⅓ cup tomato paste",
      "⅓ cup all-purpose flour",
      "1 cup dry red wine",
      "3 cups low-sodium beef broth",
      "2 tbsp fresh rosemary, finely chopped",
      "2 tbsp fresh thyme leaves",
      "2 bay leaves",
      "1½ tbsp kosher salt (for the filling)",
      "2 tsp black pepper (for the filling)",
      "3 cups frozen peas",
      "¼ cup flat-leaf parsley, chopped",
      "7 lb Yukon Gold potatoes, peeled and cut into 2-inch chunks",
      "2 tbsp kosher salt (for the cooking water)",
      "1½ cups whole milk, warmed",
      "12 tbsp unsalted butter, divided",
      "2 tsp kosher salt (for the mash)",
      "½ tsp black pepper (for the mash)"
    ],
    "directions": [
      "Put the potatoes in a large stockpot, cover with cold water by 1 inch and add the salt. Bring to a boil, then simmer 15 to 20 minutes, until a paring knife slides through with no resistance.",
      "Meanwhile, heat a 7-quart Dutch oven over medium-high heat. Brown the lamb in two batches, breaking it into small pieces, 8 to 10 minutes per batch, until well browned and no pink remains. Drain in a colander over a bowl and keep 3 tbsp of the fat.",
      "Return the reserved fat and the olive oil to the pot over medium heat. Add the onions, carrots and celery and cook, stirring often, 8 to 10 minutes, until softened and lightly browned.",
      "Stir in the garlic and tomato paste and cook 2 minutes, until the paste darkens to brick red. Sprinkle in the flour and stir 1 minute to cook out the raw taste.",
      "Pour in the wine, scraping up the browned bits, and boil until reduced by half, 2 to 3 minutes. Add the broth, rosemary, thyme, bay leaves, browned lamb, salt and pepper.",
      "Simmer uncovered, stirring now and then, 15 to 20 minutes, until the gravy is thick enough to coat a spoon. Discard the bay leaves and stir in the frozen peas and parsley. The filling should be thicker than you want to eat it, because it loosens when reheated. Taste and adjust the salt.",
      "Drain the potatoes, return them to the hot pot and steam-dry over low heat 2 minutes. Pass through a ricer or mash until smooth, then stir in the warm milk, 8 tbsp of the butter, the salt and the pepper. Aim for a mash that holds its shape.",
      "Heat the oven to 400°F. Divide the filling between two 9-by-13-inch baking dishes. Spoon the mash around the edges first to seal, fill in the center and spread evenly, then drag a fork across the top to make ridges. Melt the remaining 4 tbsp butter and brush it over the top.",
      "Set the dishes on a rimmed sheet pan and bake 25 to 30 minutes, until the filling bubbles at the edges, the ridges are golden and the center reads 165°F. Broil 2 to 3 minutes for extra color if needed.",
      "Rest 20 minutes so the filling sets, then cool until it drops to 70°F, within 2 hours. Cut each pan into 6 squares and transfer to containers with a wide spatula."
    ],
    "equipment": [
      "7-quart Dutch oven",
      "Large stockpot",
      "Potato ricer",
      "Two 9-by-13-inch baking dishes",
      "Rimmed sheet pan",
      "Instant-read thermometer",
      "12 oven-safe meal-prep containers"
    ],
    "storage": "Cool uncovered in shallow layers so everything drops to 70°F within 2 hours and to 41°F or below within the next 4 hours, then lid and refrigerate at 40°F or colder. Keeps 4 days. Freezes well for up to 3 months; wrap portions tightly and thaw overnight in the refrigerator.",
    "reheating": "Microwave: cover loosely and heat at 70% power for 3 to 4 minutes, then rest 1 minute, until the center reaches 165°F. Oven: place in an oven-safe dish, cover with foil and bake at 375°F for 25 to 30 minutes, uncovering for the last 10 minutes to crisp the top, until 165°F.",
    "makeAhead": "",
    "safety": "Ground lamb must reach 160°F; it is fully browned before assembly, and the baked pie should read 165°F in the center. Reheat leftovers to 165°F.",
    "chefNotes": "Drain the lamb well; its fat carries a strong flavor and will pool on top of the portions if left in. Salt amounts assume Diamond Crystal kosher salt; with Morton, use about two-thirds as much."
  },
  {
    "id": 15,
    "slug": "coastal-salmon-cakes-with-lemon-dill-sauce-and-brown-rice",
    "side": "meal-prep",
    "title": "Coastal Salmon Cakes with Lemon-Dill Sauce and Brown Rice",
    "category": "Seafood",
    "description": "Fresh salmon cakes bound with egg and panko, seared golden and oven-finished, with nutty brown rice and a cool lemon-dill yogurt sauce packed on the side.",
    "servings": 12,
    "yieldNote": "12 portions (2 cakes and 1¼ cups rice each, plus sauce)",
    "active": 80,
    "total": 150,
    "tags": [
      "High protein",
      "Freezer-friendly",
      "Kid-friendly"
    ],
    "allergens": [
      "Fish",
      "Egg",
      "Wheat",
      "Milk"
    ],
    "dietary": [],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "4½ lb skinless salmon fillets, pin bones removed, cut into 1-inch pieces",
      "4 large eggs",
      "½ cup mayonnaise (for the cakes)",
      "2 tbsp Dijon mustard",
      "3 medium shallots, minced",
      "½ cup flat-leaf parsley, finely chopped",
      "¼ cup fresh dill, chopped (for the cakes)",
      "1 tbsp lemon zest (for the cakes)",
      "2 tbsp lemon juice (for the cakes)",
      "2½ tsp kosher salt (for the cakes)",
      "1 tsp black pepper",
      "¼ tsp cayenne pepper",
      "1 cup panko bread crumbs (for the mix)",
      "3 cups panko bread crumbs (for coating)",
      "¾ cup neutral oil, divided",
      "1½ cups plain whole-milk Greek yogurt (for the sauce)",
      "½ cup mayonnaise (for the sauce)",
      "¼ cup fresh dill, chopped (for the sauce)",
      "1 tbsp lemon zest (for the sauce)",
      "3 tbsp lemon juice (for the sauce)",
      "1 clove garlic, finely grated",
      "1 tsp kosher salt (for the sauce)",
      "5 cups long-grain brown rice",
      "2 tbsp kosher salt (for the rice water)",
      "2 tbsp olive oil (for the rice)"
    ],
    "directions": [
      "Bring 6 quarts of water and the salt to a boil in a large pot. Add the brown rice and boil uncovered, stirring occasionally, 28 to 30 minutes, until tender with a slight chew. Drain, return to the pot, cover and rest 10 minutes off the heat, then fluff with the olive oil and spread on a parchment-lined sheet pan to cool.",
      "Whisk the yogurt, mayonnaise, dill, lemon zest, lemon juice, garlic and salt for the sauce. Cover and refrigerate at least 30 minutes so the flavors meld.",
      "Working in four batches, pulse the salmon pieces in a food processor with 3 or 4 one-second pulses, until coarsely chopped into roughly ¼-inch bits. Stop before it turns to paste; some texture keeps the cakes tender.",
      "In a large bowl, whisk the eggs, mayonnaise, Dijon, shallots, parsley, dill, lemon zest, lemon juice, salt, pepper and cayenne. Add the chopped salmon and 1 cup panko and fold gently with a spatula until evenly combined. A handful should hold together when lightly squeezed.",
      "Line two rimmed sheet pans with parchment. Scoop the mixture into 24 portions of about ½ cup and shape each into a 3-inch cake about ¾ inch thick. Press both sides into the coating panko and return to the pans.",
      "Refrigerate the cakes 30 minutes (and up to 4 hours) so the binder sets and they hold their shape in the pan. Meanwhile heat the oven to 400°F and set wire racks inside two clean rimmed sheet pans.",
      "Heat 3 tbsp oil in a 12-inch nonstick or cast-iron skillet over medium-high heat until shimmering. Sear 5 or 6 cakes at a time, without moving them, 2 to 3 minutes per side, until deep golden. Transfer to the racks, wipe out loose crumbs and add fresh oil for each batch.",
      "Bake the seared cakes on the racks 6 to 8 minutes, until the center of a cake reaches at least 155°F (160°F is a safe target).",
      "Let the cakes cool on the racks so the crust stays crisp, until they drop to 70°F, within 2 hours.",
      "Portion 1¼ cups rice and 2 cakes into each of 12 containers. Pack about 3 tbsp sauce in 2-oz lidded cups."
    ],
    "equipment": [
      "Food processor",
      "12-inch nonstick skillet",
      "Large pot and colander",
      "Rimmed sheet pans with wire racks",
      "Instant-read thermometer",
      "12 meal-prep containers with small side cups"
    ],
    "storage": "Cool uncovered in shallow layers so everything drops to 70°F within 2 hours and to 41°F or below within the next 4 hours, then lid and refrigerate at 40°F or colder. Eat within 3 days. The sauce keeps 4 days cold and must stay refrigerated. The cooked cakes freeze up to 2 months on their own; thaw overnight in the refrigerator.",
    "reheating": "Remove the sauce cup first and serve it cold. Reheat gently: fish overcooks quickly, so use reduced power or a low oven with a cover, but still bring it to 165°F. Microwave: sprinkle 1 tbsp water over the rice, cover loosely and heat at 50% power for 2½ to 3½ minutes, until the cakes reach 165°F in the center. Oven (for the crispest cakes): place the cakes on a rack over a sheet pan and the rice in a covered dish with 1 tbsp water, and heat at 350°F for 15 to 18 minutes, until 165°F.",
    "makeAhead": "",
    "safety": "Salmon cakes are chopped fish bound with raw egg: cook until the center reaches at least 155°F (160°F is a safe target). Make the sauce with commercial mayonnaise (pasteurized eggs) and keep it refrigerated. Reheat leftovers to 165°F.",
    "chefNotes": "Pulse the salmon rather than grinding it; overprocessed fish turns into a dense, rubbery puck. Chilling before searing is what keeps 24 cakes intact in the pan. Salt amounts assume Diamond Crystal kosher salt; with Morton, use 1½ tsp in the cakes."
  },
  {
    "id": 16,
    "slug": "miso-glazed-salmon-with-sesame-greens-and-rice",
    "side": "meal-prep",
    "title": "Miso-Glazed Salmon with Sesame Greens and Rice",
    "category": "Seafood",
    "description": "Salmon brushed with a sweet-salty miso and mirin glaze and broiled until it blisters, with garlicky sesame bok choy, broccolini and short-grain rice.",
    "servings": 12,
    "yieldNote": "12 portions (one 5-oz fillet, 1¼ cups rice and about 1 cup greens each)",
    "active": 55,
    "total": 105,
    "tags": [
      "High protein",
      "Dairy-free",
      "Omega-3 rich"
    ],
    "allergens": [
      "Fish",
      "Soy",
      "Wheat",
      "Sesame"
    ],
    "dietary": [
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "12 skinless salmon fillets (5 oz each)",
      "⅔ cup white miso",
      "⅓ cup mirin",
      "3 tbsp light brown sugar",
      "2 tbsp low-sodium soy sauce (for the glaze)",
      "1 tbsp rice vinegar",
      "1 tbsp fresh ginger, finely grated",
      "1 tbsp neutral oil (for the pans)",
      "6 cups short-grain white rice",
      "6¾ cups water (for the rice)",
      "3 lb baby bok choy, halved lengthwise",
      "2 lb broccolini, trimmed",
      "2 tbsp kosher salt (for the blanching water)",
      "2 tbsp neutral oil (for the greens)",
      "6 cloves garlic, thinly sliced",
      "2 tbsp low-sodium soy sauce (for the greens)",
      "2 tbsp toasted sesame oil",
      "3 tbsp toasted sesame seeds",
      "1 bunch scallions, thinly sliced"
    ],
    "directions": [
      "Rinse the rice until the water runs nearly clear, drain, and combine with the water in a heavy 8-quart pot. Bring to a boil, cover, cook on the lowest heat 15 minutes, then rest off the heat, covered, 10 minutes. Fluff and spread on a parchment-lined sheet pan to cool.",
      "Whisk the miso, mirin, brown sugar, soy sauce, rice vinegar and ginger until smooth. Set aside ⅓ of the glaze in a separate cup for finishing; it should never touch raw fish.",
      "Pat the salmon dry and brush the tops and sides with the remaining glaze. Refrigerate 30 minutes, and no more than 2 hours, since the salty miso starts to cure the surface.",
      "Heat the oven to 425°F with a rack in the upper third. Line two rimmed sheet pans with foil and brush with the oil. Set 6 fillets on each pan, 2 inches apart, wiping away any pooled glaze, which burns.",
      "Bake one pan at a time for 6 to 8 minutes, until the fish reads about 135°F in the thickest part. Switch to broil and cook 2 to 3 minutes, watching closely, until the glaze is blistered and browned in spots and the center reaches 145°F and flakes. Brush at once with a thin coat of the reserved glaze.",
      "Bring a large pot of water and the salt to a boil and set up a big bowl of ice water. Blanch the broccolini 1½ minutes and the bok choy 1 minute, in batches, then plunge into the ice water, drain well and pat dry.",
      "Heat the oil in a wok or 12-inch skillet over medium-high heat. Add the garlic and stir 30 seconds until fragrant but not browned. Add half the greens and toss 1 to 2 minutes until hot and glossy; repeat with the rest.",
      "Toss all the greens with the soy sauce and sesame oil and sprinkle with the sesame seeds. Leave them slightly crisp, because they soften further on reheating.",
      "Cool the salmon, rice and greens in shallow layers until they drop to 70°F, within 2 hours.",
      "Portion 1¼ cups rice, 1 salmon fillet and about 1 cup greens into each of 12 containers, and scatter scallions over the top."
    ],
    "equipment": [
      "Heavy 8-quart pot with lid",
      "Rimmed sheet pans",
      "Wok",
      "Large pot for blanching",
      "Instant-read thermometer",
      "Pastry brush",
      "12 meal-prep containers"
    ],
    "storage": "Cool uncovered in shallow layers so everything drops to 70°F within 2 hours and to 41°F or below within the next 4 hours, then lid and refrigerate at 40°F or colder. Eat within 3 days. Do not freeze the greens; the salmon and rice can be frozen up to 1 month, though the fish is best fresh.",
    "reheating": "Reheat gently: fish overcooks quickly, so use reduced power or a low oven with a cover, but still bring it to 165°F. Microwave: sprinkle 1 tbsp water over the rice, cover loosely and heat at 50% power for 3 to 4 minutes, rotating halfway, until the salmon reaches 165°F. Oven: transfer to an oven-safe dish, add 1 tbsp water, cover tightly with foil and heat at 300°F for 18 to 22 minutes, until 165°F.",
    "makeAhead": "",
    "safety": "Cook salmon to 145°F or until opaque and it flakes easily. Keep the finishing glaze separate from the glaze that touches raw fish. Cool cooked rice promptly. Reheat leftovers to 165°F.",
    "chefNotes": "The sugar in the glaze goes from blistered to burnt in under a minute under the broiler, so stay at the oven. The glaze is already salty, so the fish needs no extra salt. Blanching and shocking the greens keeps them green for three days instead of turning olive."
  },
  {
    "id": 17,
    "slug": "pacific-cod-in-tomato-olive-and-caper-sauce-with-quinoa",
    "side": "meal-prep",
    "title": "Pacific Cod in Tomato, Olive and Caper Sauce with Quinoa",
    "category": "Seafood",
    "description": "Flaky Pacific cod baked in a garlicky tomato sauce with Kalamata olives, capers and white wine, served with lemony herbed quinoa.",
    "servings": 12,
    "yieldNote": "12 portions (one 6½-oz cod portion, ½ cup sauce and 1 cup quinoa each)",
    "active": 45,
    "total": 90,
    "tags": [
      "High protein",
      "Gluten-free",
      "Dairy-free"
    ],
    "allergens": [
      "Fish"
    ],
    "dietary": [
      "Gluten-free",
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "5 lb skinless Pacific cod fillets, cut into 12 portions",
      "2 tsp kosher salt (for the fish)",
      "½ tsp black pepper",
      "¼ cup extra-virgin olive oil (for the sauce)",
      "1 large yellow onion, finely diced",
      "8 cloves garlic, thinly sliced",
      "½ tsp red pepper flakes",
      "2 tbsp tomato paste",
      "¾ cup dry white wine",
      "2 cans (28 oz) crushed tomatoes",
      "1 cup pitted Kalamata olives, halved",
      "⅓ cup capers, rinsed",
      "2 tsp dried oregano",
      "1 tsp sugar",
      "1 tsp kosher salt (for the sauce)",
      "2 tsp lemon zest",
      "½ cup flat-leaf parsley, chopped, divided",
      "4 cups quinoa, rinsed well",
      "6 cups water (for the quinoa)",
      "2 tsp kosher salt (for the quinoa)",
      "3 tbsp extra-virgin olive oil (for the quinoa)",
      "3 tbsp lemon juice"
    ],
    "directions": [
      "Rinse the quinoa in a fine-mesh strainer under cold running water, rubbing it with your fingers, until the water runs clear. Drain well.",
      "Heat 1 tbsp of the quinoa oil in a heavy 5-quart pot over medium heat, add the quinoa and toast, stirring, about 3 minutes, until dry and nutty-smelling. Add the water and salt, bring to a boil, cover and simmer on low 18 to 20 minutes, until the water is absorbed. Rest off the heat, covered, 10 minutes.",
      "Fluff the quinoa with a fork, toss with the remaining oil, the lemon juice and half the parsley, and spread on a sheet pan to cool.",
      "For the sauce, heat the olive oil in a 12-inch deep sauté pan over medium heat. Cook the onion 6 to 8 minutes, until soft and just golden, then add the garlic and pepper flakes and cook 1 minute.",
      "Stir in the tomato paste for 2 minutes, until it darkens. Add the wine and boil until reduced by half, about 2 minutes. Add the crushed tomatoes, olives, capers, oregano, sugar and salt and simmer 15 minutes, until slightly thickened but still loose enough to spoon. Stir in the lemon zest.",
      "Heat the oven to 400°F. Pat the cod dry, tuck any thin tail ends underneath so each portion is an even thickness, and season with the salt and pepper.",
      "Spread half the sauce in two 9-by-13-inch baking dishes. Nestle 6 cod portions in each dish, then spoon the remaining sauce over and around the fish, leaving the tops partly exposed.",
      "Bake 15 to 20 minutes, depending on thickness, rotating the dishes halfway, until the thickest piece reads 145°F and the fish just begins to flake. Scatter the remaining parsley over the top.",
      "Let the dishes cool on a rack until they drop to 70°F, within 2 hours.",
      "Portion 1 cup quinoa and 1 cod portion with about ½ cup sauce spooned over the fish into each of 12 containers. The sauce protects the fish from drying out on reheating."
    ],
    "equipment": [
      "12-inch deep sauté pan",
      "Heavy 5-quart pot with lid",
      "Two 9-by-13-inch baking dishes",
      "Fine-mesh strainer",
      "Instant-read thermometer",
      "12 meal-prep containers"
    ],
    "storage": "Cool uncovered in shallow layers so everything drops to 70°F within 2 hours and to 41°F or below within the next 4 hours, then lid and refrigerate at 40°F or colder. Eat within 3 days. The tomato sauce can be made up to 3 days ahead, and the quinoa freezes well for 2 months, but don't freeze the cooked cod.",
    "reheating": "Reheat gently: fish overcooks quickly, so use reduced power or a low oven with a cover, but still bring it to 165°F. Microwave: cover loosely and heat at 50% power for 3 to 4 minutes, rotating halfway, until the cod reaches 165°F. Oven: transfer to an oven-safe dish, cover with foil and heat at 300°F for 18 to 22 minutes, until 165°F.",
    "makeAhead": "",
    "safety": "Cook fish to 145°F or until opaque and it flakes easily. Cool promptly and reheat leftovers to 165°F.",
    "chefNotes": "Buy thick loin portions when you can; thin tail pieces overcook, so fold them under. Rinse capers and taste the sauce before salting, because olives and capers bring plenty. Salt amounts assume Diamond Crystal kosher salt."
  },
  {
    "id": 18,
    "slug": "blackened-rockfish-taco-bowls-with-slaw-and-lime-crema",
    "side": "meal-prep",
    "title": "Blackened Rockfish Taco Bowls with Slaw and Lime Crema",
    "category": "Seafood",
    "description": "Spice-crusted Oregon rockfish seared in cast iron over rice, charred corn and black beans, with crunchy cabbage slaw and lime crema packed separately.",
    "servings": 12,
    "yieldNote": "12 portions (about 5 oz fish, 1 cup rice and ½ cup corn and beans each, plus slaw and crema)",
    "active": 70,
    "total": 100,
    "tags": [
      "High protein",
      "Gluten-free",
      "Local seafood"
    ],
    "allergens": [
      "Fish",
      "Milk"
    ],
    "dietary": [
      "Gluten-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "5 lb skinless rockfish fillets, cut into 12 portions",
      "2 tbsp sweet paprika",
      "1 tbsp smoked paprika",
      "2 tsp garlic powder",
      "2 tsp onion powder",
      "2 tsp dried oregano",
      "2 tsp dried thyme",
      "2 tsp ground cumin",
      "1 tsp cayenne pepper",
      "1 tsp black pepper",
      "1 tbsp kosher salt (for the spice rub)",
      "½ cup neutral oil, divided",
      "4 cups long-grain white rice, rinsed",
      "6 cups water (for the rice)",
      "2 tsp kosher salt (for the rice)",
      "4 cups frozen corn kernels, thawed and patted dry",
      "2 cans (15 oz) black beans, rinsed and drained",
      "2 lb green cabbage, cored and thinly sliced",
      "1 lb red cabbage, cored and thinly sliced",
      "3 medium carrots, shredded",
      "2 medium jalapeños, seeded and minced",
      "2 tsp kosher salt (for the slaw)",
      "1 tsp sugar",
      "½ cup lime juice (for the slaw)",
      "3 tbsp olive oil (for the slaw)",
      "1 bunch cilantro, chopped",
      "2 cups sour cream",
      "1 tbsp lime zest",
      "¼ cup lime juice (for the crema)",
      "1 clove garlic, finely grated",
      "1 tsp kosher salt (for the crema)",
      "2 tbsp water (for the crema)"
    ],
    "directions": [
      "Combine the rice, water, salt and 1 tbsp of the oil in a heavy 5-quart pot and bring to a boil. Cover, cook on low 18 minutes, then rest off the heat, covered, 10 minutes. Fluff and spread on a parchment-lined sheet pan to cool.",
      "Heat a 12-inch cast-iron skillet over high heat, add 1 tbsp oil and char the corn in two batches, undisturbed for 2 minutes and then stirring, 5 to 6 minutes per batch, until spotty brown. Toss with the black beans and spread out to cool.",
      "For the slaw, toss both cabbages, the carrots and the jalapeños with the salt and sugar in a large bowl and let stand 10 minutes to soften slightly. Add the lime juice, olive oil and half the cilantro and toss. Pack into 12 separate 8-oz containers.",
      "Whisk the sour cream, lime zest, lime juice, garlic, salt and water until smooth and pourable. Pack into 12 lidded 2-oz cups and refrigerate.",
      "Mix all the spices and the salt for the rub. Pat the rockfish very dry, fold thin tail ends under, brush all over with 3 tbsp oil and coat every side evenly with the spice mixture, about 2 tsp per portion, using all of it.",
      "Turn the hood fan to high and open a window. Wipe out the skillet and heat it over medium-high heat for 5 minutes, until very hot.",
      "Add 1 tbsp oil and cook 3 or 4 portions at a time, 2 to 3 minutes, until the crust is dark mahogany. Flip and cook 1 to 2 minutes more, until the thickest part reaches 145°F and flakes. Wipe the skillet between batches if the spices start to smoke hard, and add fresh oil.",
      "Transfer the fish to a wire rack and let it cool, along with the rice and corn, until everything drops to 70°F, within 2 hours.",
      "Portion 1 cup rice and ½ cup corn and beans into each of 12 containers and top with a rockfish portion and the remaining cilantro. Keep the slaw and crema containers separate so they stay cold and crunchy."
    ],
    "equipment": [
      "12-inch cast-iron skillet",
      "Heavy 5-quart pot with lid",
      "Rimmed sheet pans",
      "Wire rack",
      "Instant-read thermometer",
      "12 meal-prep containers plus 8-oz and 2-oz side containers"
    ],
    "storage": "Cool uncovered in shallow layers so everything drops to 70°F within 2 hours and to 41°F or below within the next 4 hours, then lid and refrigerate at 40°F or colder. Eat the fish bowls within 3 days. The slaw keeps 4 days (it softens a little each day) and the crema keeps 5 days, both refrigerated. Do not freeze.",
    "reheating": "Set aside the slaw and crema; they are served cold. Reheat gently: fish overcooks quickly, so use reduced power or a low oven with a cover, but still bring it to 165°F. Microwave: sprinkle 1 tbsp water over the rice, cover loosely and heat at 50% power for 2½ to 3½ minutes, until the fish reaches 165°F. Oven: transfer to an oven-safe dish, add 1 tbsp water, cover with foil and heat at 300°F for 15 to 20 minutes, until 165°F. Top with the cold slaw and a drizzle of crema.",
    "makeAhead": "",
    "safety": "Cook fish to 145°F or until opaque and it flakes easily. Keep the sour cream crema refrigerated. Cool cooked rice promptly. Reheat leftovers to 165°F.",
    "chefNotes": "Rockfish fillets are thin and cook in minutes. Blacken over medium-high, not your hottest flame, so the paprika toasts without turning bitter. Salting the cabbage for 10 minutes before dressing keeps the slaw from going watery in the container. Salt amounts assume Diamond Crystal kosher salt."
  },
  {
    "id": 19,
    "slug": "garlic-shrimp-and-broccoli-stir-fry-with-brown-rice",
    "side": "meal-prep",
    "title": "Garlic Shrimp and Broccoli Stir-Fry with Brown Rice",
    "category": "Seafood",
    "description": "Snappy seared shrimp and crisp-tender broccoli in a glossy garlic-ginger sauce, packed with chewy brown rice.",
    "servings": 12,
    "yieldNote": "12 portions (about 1½ cups stir-fry and 1¼ cups rice each)",
    "active": 60,
    "total": 90,
    "tags": [
      "High protein",
      "Dairy-free"
    ],
    "allergens": [
      "Shellfish",
      "Soy",
      "Wheat",
      "Sesame"
    ],
    "dietary": [
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "5 lb large shrimp (21/25 count), peeled and deveined",
      "1 tbsp kosher salt (for the shrimp)",
      "1 tsp baking soda",
      "5 lb broccoli crowns, cut into 1½-inch florets",
      "2 tbsp kosher salt (for the blanching water)",
      "6 tbsp neutral oil, divided",
      "16 cloves garlic, minced",
      "2 tbsp fresh ginger, minced",
      "1 tsp red pepper flakes",
      "1½ cups low-sodium chicken broth",
      "½ cup low-sodium soy sauce",
      "¼ cup oyster sauce",
      "3 tbsp rice vinegar",
      "2 tbsp light brown sugar",
      "3 tbsp cornstarch",
      "1 tbsp toasted sesame oil",
      "½ tsp white pepper",
      "1 bunch scallions, thinly sliced",
      "5 cups long-grain brown rice",
      "2 tbsp kosher salt (for the rice water)"
    ],
    "directions": [
      "Bring 6 quarts of water and 2 tbsp kosher salt to a boil, add the brown rice and boil uncovered 28 to 30 minutes, until tender. Drain, return to the pot, cover off the heat 10 minutes, then fluff and spread on a parchment-lined sheet pan to cool.",
      "Toss the shrimp with 1 tbsp kosher salt and the baking soda and refrigerate 15 minutes to 1 hour; this keeps them plump and snappy. Pat very dry before cooking.",
      "Whisk the broth, soy sauce, oyster sauce, rice vinegar, brown sugar, cornstarch, sesame oil and white pepper in a bowl until the cornstarch dissolves.",
      "Bring a large pot of water and 2 tbsp kosher salt to a boil and set up a big bowl of ice water. Blanch the broccoli in three batches for 1½ minutes each, until bright green and still crisp, then plunge into the ice water, drain and spread on towels to dry.",
      "Heat a wok or 12-inch skillet over high heat until smoking. Add 1 tbsp oil and about 1¼ lb shrimp in a single layer. Sear undisturbed 1 minute, then stir 1 minute more, until pink outside and barely translucent at the center. Transfer to a sheet pan and repeat with the remaining shrimp and oil.",
      "Heat the remaining 2 tbsp oil in a 7-quart Dutch oven over medium heat. Add the garlic, ginger and pepper flakes and stir 30 to 45 seconds, until fragrant and not browned.",
      "Re-whisk the sauce, pour it in and bring to a boil, stirring, until glossy and thickened, about 1 minute.",
      "Fold in the broccoli and shrimp with their juices and cook, tossing, 1 to 2 minutes, just until the shrimp are opaque throughout and everything is coated. Remove from the heat and stir in the scallions.",
      "Spread the stir-fry on rimmed sheet pans right away so the shrimp stop cooking, and cool it with the rice until everything drops to 70°F, within 2 hours.",
      "Portion 1¼ cups rice and about 1½ cups stir-fry, with its sauce, into each of 12 containers."
    ],
    "equipment": [
      "Wok",
      "7-quart Dutch oven",
      "Large pot and colander",
      "Rimmed sheet pans",
      "Whisk",
      "12 meal-prep containers"
    ],
    "storage": "Cool uncovered in shallow layers so everything drops to 70°F within 2 hours and to 41°F or below within the next 4 hours, then lid and refrigerate at 40°F or colder. Eat within 3 days. Not recommended for freezing; the shrimp turn rubbery and the broccoli goes soft.",
    "reheating": "Shrimp overcook very quickly, so reheat gently but still bring the stir-fry to 165°F. Microwave: sprinkle 1 tbsp water over the rice, cover loosely and heat at 50% power for 3 to 4 minutes, stirring halfway, until 165°F. Oven: transfer to an oven-safe dish, add 1 tbsp water, cover with foil and heat at 300°F for 15 to 20 minutes, until 165°F.",
    "makeAhead": "",
    "safety": "Cook shrimp until the flesh is opaque throughout (145°F). Oyster sauce contains shellfish. Cool rice and stir-fry promptly. Reheat leftovers to 165°F.",
    "chefNotes": "Sear the shrimp in small batches in a very hot wok. The final toss in the sauce finishes them, so pulling them early is what keeps them tender after reheating. Choose a soy sauce and oyster sauce labeled gluten-free if you need to; as written, this recipe contains wheat. Salt amounts assume Diamond Crystal kosher salt."
  },
  {
    "id": 20,
    "slug": "lemon-pepper-rockfish-with-herbed-potatoes-and-green-beans",
    "side": "meal-prep",
    "title": "Lemon-Pepper Rockfish with Herbed Potatoes and Green Beans",
    "category": "Seafood",
    "description": "Oregon rockfish roasted under fresh lemon zest and cracked pepper, with crisp herb-tossed baby potatoes and bright shallot green beans.",
    "servings": 12,
    "yieldNote": "12 portions (about 5 oz fish, 1 cup potatoes and 1 cup green beans each)",
    "active": 50,
    "total": 85,
    "tags": [
      "High protein",
      "Gluten-free",
      "Local seafood"
    ],
    "allergens": [
      "Fish"
    ],
    "dietary": [
      "Gluten-free",
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "5 lb skinless rockfish fillets, cut into 12 portions",
      "3 tbsp lemon zest",
      "1 tbsp black peppercorns, coarsely cracked",
      "2½ tsp kosher salt (for the fish)",
      "1 tsp garlic powder",
      "⅓ cup extra-virgin olive oil (for the fish)",
      "¼ cup lemon juice",
      "5 lb baby Yukon Gold potatoes, halved",
      "¼ cup extra-virgin olive oil (for the potatoes)",
      "2 tsp kosher salt (for the potatoes)",
      "1 tsp black pepper (for the potatoes)",
      "4 cloves garlic, minced",
      "½ cup flat-leaf parsley, chopped",
      "¼ cup fresh dill, chopped",
      "¼ cup fresh chives, minced",
      "3 lb green beans, trimmed",
      "2 tbsp kosher salt (for the blanching water)",
      "2 tbsp extra-virgin olive oil (for the beans)",
      "1 medium shallot, minced",
      "½ tsp kosher salt (for the beans)"
    ],
    "directions": [
      "Heat the oven to 425°F with racks in the upper-middle and lower-middle positions. Toss the potatoes with the oil, salt and pepper and arrange cut side down on two rimmed sheet pans.",
      "Roast the potatoes 30 to 35 minutes, rotating the pans halfway, until the cut faces are deep golden and a knife slides in easily. While hot, toss with the garlic, parsley, dill and chives; the heat blooms the garlic without burning it.",
      "Bring a large pot of water and the salt to a boil and set up a big bowl of ice water. Blanch the green beans in two batches for 3 minutes each, until crisp-tender, then plunge into the ice water, drain and dry well.",
      "Heat the olive oil in a 12-inch skillet over medium heat, cook the shallot 1 minute until softened, add the beans and salt and toss 1 to 2 minutes, just until glossy and warmed through.",
      "In a small bowl, rub the lemon zest, cracked pepper, salt and garlic powder together with your fingertips to release the lemon oils.",
      "Line two rimmed sheet pans with parchment and brush with a little of the oil. Pat the rockfish dry, fold thin tail ends under so each portion is an even thickness, and set 6 portions on each pan. Brush with the remaining oil and sprinkle the lemon-pepper mixture evenly over the tops.",
      "Roast 8 to 12 minutes, depending on thickness, until the thickest part reaches 145°F and the flesh is opaque and flakes. Drizzle with the lemon juice as soon as the fish comes out.",
      "Cool the fish, potatoes and beans in shallow layers until they drop to 70°F, within 2 hours.",
      "Portion 1 cup potatoes, 1 cup green beans and 1 rockfish portion into each of 12 containers, spooning any pan juices over the fish."
    ],
    "equipment": [
      "Rimmed sheet pans",
      "12-inch skillet",
      "Large pot for blanching",
      "Instant-read thermometer",
      "Microplane zester",
      "12 meal-prep containers"
    ],
    "storage": "Cool uncovered in shallow layers so everything drops to 70°F within 2 hours and to 41°F or below within the next 4 hours, then lid and refrigerate at 40°F or colder. Eat within 3 days. Do not freeze; the potatoes turn grainy and the fish loses texture.",
    "reheating": "Reheat gently: fish overcooks quickly, so use reduced power or a low oven with a cover, but still bring it to 165°F. Microwave: sprinkle 1 tbsp water over the potatoes, cover loosely and heat at 50% power for 3 to 4 minutes, rotating halfway, until the fish reaches 165°F. Oven: transfer to an oven-safe dish, add 1 tbsp water, cover with foil and heat at 300°F for 15 to 20 minutes, until 165°F. Finish with a squeeze of fresh lemon if you have one.",
    "makeAhead": "",
    "safety": "Cook fish to 145°F or until opaque and it flakes easily. Cool promptly and reheat leftovers to 165°F.",
    "chefNotes": "Fresh zest rubbed with salt is much brighter than store-bought lemon pepper, which is mostly citric acid and salt. Rockfish is lean and thin, so pull it the moment it reaches 145°F; it will reheat more gently. Salt amounts assume Diamond Crystal kosher salt."
  },
  {
    "id": 21,
    "slug": "northwest-seafood-stew-with-cod-shrimp-and-clams",
    "side": "meal-prep",
    "title": "Northwest Seafood Stew with Cod, Shrimp and Clams",
    "category": "Seafood",
    "description": "A cioppino-style tomato and white wine broth loaded with flaky cod, sweet shrimp and tender clams, built to reheat gently all week.",
    "servings": 12,
    "yieldNote": "12 portions (about 2 cups each)",
    "active": 55,
    "total": 95,
    "tags": [
      "High protein",
      "Pacific Northwest",
      "Eat within 3 days"
    ],
    "allergens": [
      "Fish",
      "Shellfish"
    ],
    "dietary": [
      "Gluten-free",
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "⅓ cup extra-virgin olive oil",
      "2 large yellow onions, diced",
      "1 large fennel bulb, cored and diced",
      "2 medium red bell peppers, diced",
      "10 cloves garlic, thinly sliced",
      "3 tbsp tomato paste",
      "1 tsp red pepper flakes",
      "2 tsp dried oregano",
      "3 bay leaves",
      "2½ cups dry white wine, divided",
      "2 cans (28 oz each) whole peeled tomatoes, crushed by hand",
      "6 cups seafood stock (gluten-free)",
      "1 tbsp kosher salt, plus more as needed",
      "1 tsp black pepper",
      "4 lb littleneck clams, scrubbed",
      "3 lb skinless cod fillets, cut into 1½-inch chunks",
      "2 lb large shrimp (21/25), peeled and deveined",
      "2 tbsp lemon juice",
      "1 bunch flat-leaf parsley, chopped"
    ],
    "directions": [
      "Heat the olive oil in a heavy 10- to 12-quart pot over medium heat. Add the onions, fennel, bell peppers and 1 tsp of the salt and cook, stirring often, until soft and translucent but not browned, 10 to 12 minutes.",
      "Add the garlic, tomato paste, red pepper flakes and oregano and cook, stirring, until the paste darkens to brick red and the garlic smells sweet, about 3 minutes.",
      "Pour in 1½ cups of the wine and simmer, scraping the bottom, until reduced by about half, 5 minutes. Add the tomatoes with their juices, the seafood stock, bay leaves, remaining salt and the pepper. Bring to a boil, then simmer gently, partially covered, for 25 minutes so the broth tastes rounded and slightly thickened.",
      "Meanwhile, put the clams and the remaining 1 cup wine in a separate wide pot, cover and steam over high heat, shaking the pot now and then, until the shells open, 5 to 8 minutes. Transfer opened clams to a sheet pan as they pop; discard any that stay shut after 10 minutes.",
      "When the clams are cool enough to handle, pull the meat from the shells and refrigerate it. Pour the clam liquor through a coffee filter or damp paper towel into the broth, leaving any grit behind.",
      "Taste the broth and adjust with salt; it should be well seasoned because the fish will absorb it. Fish out the bay leaves. Keep the broth at a bare simmer, with only an occasional bubble.",
      "Season the cod lightly with salt, slide it into the broth and poach without stirring for 3 minutes. Add the shrimp, nudge everything under the surface and cook until the shrimp are pink and just opaque and the cod flakes at the thickest point and reads 145°F, 2 to 3 minutes more.",
      "Immediately lift the cod and shrimp out with a slotted spoon onto a rimmed sheet pan in a single layer and refrigerate uncovered. Stir the lemon juice into the broth, then set the pot in an ice bath (or divide into shallow pans) and stir until the broth drops below 70°F.",
      "Portion the seafood and clam meat evenly into 12 containers, ladle about 1¼ cups broth over each, sprinkle with parsley, cover and refrigerate."
    ],
    "equipment": [
      "10- to 12-quart heavy pot",
      "Wide lidded pot for steaming clams",
      "Rimmed sheet pans",
      "Slotted spoon",
      "Fine strainer or coffee filter",
      "Instant-read thermometer",
      "12 microwave-safe containers (32 oz)"
    ],
    "storage": "Cool broth in an ice bath and seafood on sheet pans, then portion and refrigerate. Eat within 3 days; seafood quality drops fast after that. The broth alone freezes well for 3 months, but do not freeze the cooked seafood.",
    "reheating": "Reheat gently so the seafood stays tender. Microwave: vent the lid and heat at 50% power for 4 to 5 minutes, stirring halfway, until the broth is steaming and the center reaches 165°F. Oven: transfer to a covered oven-safe dish and heat at 325°F for 20 to 25 minutes to 165°F. Do not boil.",
    "makeAhead": "",
    "safety": "Cook cod to 145°F or until opaque and flaking; cook shrimp until pink and opaque; steam clams until the shells open and discard any that do not. Reheat leftovers to 165°F. Cool from 135°F to 70°F within 2 hours and to 41°F or below within the next 4 hours; refrigerate at 40°F or below.",
    "chefNotes": "Pulling the clams from their shells keeps containers compact and prevents gritty broth; save a few in-shell clams for the top if the client likes the look. Under-season nothing here: a flat broth is the most common failure, so taste after the clam liquor goes in."
  },
  {
    "id": 22,
    "slug": "thai-red-curry-with-shrimp-and-vegetables-over-jasmine-rice",
    "side": "meal-prep",
    "title": "Thai Red Curry with Shrimp and Vegetables over Jasmine Rice",
    "category": "Seafood",
    "description": "Plump shrimp, bell peppers and green beans in a fragrant coconut red curry, packed beside fluffy jasmine rice for easy weekday lunches.",
    "servings": 12,
    "yieldNote": "12 portions (about 1¼ cups curry and 1 cup rice each)",
    "active": 50,
    "total": 70,
    "tags": [
      "Contains coconut",
      "High protein",
      "Spicy"
    ],
    "allergens": [
      "Shellfish",
      "Fish"
    ],
    "dietary": [
      "Gluten-free",
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "4 cups jasmine rice",
      "5 cups water (for the rice)",
      "1½ tsp kosher salt (for the rice)",
      "4 cans (13.5 oz each) full-fat coconut milk, unshaken",
      "⅔ cup Thai red curry paste (shrimp-paste-free)",
      "2 tbsp neutral oil",
      "2 medium yellow onions, halved and sliced",
      "2 tbsp fresh ginger, grated",
      "6 cloves garlic, minced",
      "2 cups low-sodium vegetable broth (gluten-free)",
      "¼ cup fish sauce",
      "3 tbsp light brown sugar",
      "8 makrut lime leaves, torn (optional)",
      "3 medium red bell peppers, sliced ½ inch thick",
      "1 lb green beans, trimmed and cut into 2-inch pieces",
      "2 cans (8 oz each) sliced bamboo shoots, drained",
      "4½ lb large shrimp (21/25), peeled and deveined",
      "¼ cup lime juice",
      "1 bunch Thai basil, leaves picked",
      "1 bunch cilantro, chopped"
    ],
    "directions": [
      "Rinse the rice in a fine strainer until the water runs mostly clear. Combine with the 5 cups water and 1½ tsp salt in a 6-quart pot, bring to a boil, cover, reduce to the lowest heat and cook 18 minutes. Let stand covered off the heat 10 minutes, fluff, then spread on a sheet pan to cool quickly.",
      "Open the coconut milk without shaking and spoon the thick cream from the tops of the cans into a 7- to 8-quart Dutch oven; reserve the thin milk.",
      "Add the oil to the cream and cook over medium-high heat, stirring, until it bubbles hard and the fat starts to separate, 4 to 6 minutes. Add the curry paste and fry, stirring constantly, until deep red and very fragrant, about 3 minutes.",
      "Add the onions, ginger and garlic and cook until the onions just soften, 4 minutes.",
      "Stir in the reserved thin coconut milk, broth, fish sauce, brown sugar and lime leaves. Bring to a simmer and cook 10 minutes to marry the flavors; the sauce should coat a spoon.",
      "Add the green beans and cook 3 minutes, then add the bell peppers and bamboo shoots and cook 2 minutes more. The vegetables should stay crisp-tender because they will soften when reheated.",
      "Add the shrimp, submerge them and simmer gently, stirring once or twice, just until pink and opaque throughout, 3 to 4 minutes. Take the pot off the heat right away.",
      "Stir in the lime juice and taste: it should be salty, slightly sweet and sour. Adjust with up to 1 tbsp more fish sauce or a pinch of sugar. Fold in the basil and cilantro.",
      "Transfer the curry to shallow pans and cool to below 70°F within 2 hours, stirring occasionally. Pack 1 cup rice and about 1¼ cups curry into each of 12 divided containers and refrigerate."
    ],
    "equipment": [
      "7- to 8-quart Dutch oven",
      "6-quart pot with lid",
      "Fine-mesh strainer",
      "Rimmed sheet pans",
      "Instant-read thermometer",
      "12 divided meal-prep containers"
    ],
    "storage": "Keep curry and rice in separate compartments so the rice doesn't turn soggy. Refrigerate up to 3 days. The curry sauce (without shrimp) freezes for 2 months; cooked shrimp turns rubbery if frozen and reheated.",
    "reheating": "Microwave: sprinkle the rice with 1 tbsp water, vent the lid and heat the curry at 50% power for 3 to 4 minutes, stirring halfway, then heat everything on full power in 30-second bursts until the center reaches 165°F. Oven: combine curry and rice in a covered oven-safe dish with 2 tbsp water and heat at 325°F for 20 to 25 minutes to 165°F.",
    "makeAhead": "",
    "safety": "Cook shrimp until pink and opaque throughout (145°F). Cool rice quickly and refrigerate within 2 hours to prevent Bacillus cereus growth. Reheat to 165°F. Many red curry pastes contain shrimp paste; this recipe already contains shellfish and fish sauce (fish). Cool from 135°F to 70°F within 2 hours and to 41°F or below within the next 4 hours; refrigerate at 40°F or below.",
    "chefNotes": "Frying the paste in cracked coconut cream is what gives the curry depth; do not rush it. Curry pastes vary widely in heat and salt, so start with ⅔ cup and add more only after tasting."
  },
  {
    "id": 23,
    "slug": "red-lentil-coconut-dal-with-spinach-and-basmati-rice",
    "side": "meal-prep",
    "title": "Red Lentil Coconut Dal with Spinach and Basmati Rice",
    "category": "Vegetarian",
    "description": "Silky red lentils simmered with coconut milk, ginger and warm spices, finished with spinach and a sizzling cumin tadka over fragrant basmati.",
    "servings": 12,
    "yieldNote": "12 portions (about 1¼ cups dal and 1 cup rice each)",
    "active": 40,
    "total": 75,
    "tags": [
      "Vegan",
      "Freezer-friendly",
      "Contains coconut"
    ],
    "allergens": [],
    "dietary": [
      "Gluten-free",
      "Dairy-free",
      "Vegetarian",
      "Vegan"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "4 cups basmati rice",
      "5 cups water (for the rice)",
      "2 tsp kosher salt (for the rice)",
      "2 lb red lentils, rinsed",
      "10 cups water (for the dal)",
      "2 tsp ground turmeric",
      "¼ cup neutral oil, divided",
      "2 large yellow onions, finely diced",
      "8 cloves garlic, minced",
      "3 tbsp fresh ginger, grated",
      "2 serrano chiles, minced",
      "1 tbsp ground cumin",
      "1 tbsp ground coriander",
      "2 tsp garam masala",
      "½ tsp cayenne pepper",
      "1 can (14.5 oz) diced tomatoes",
      "2 cans (13.5 oz each) full-fat coconut milk",
      "4 tsp kosher salt (for the dal)",
      "1 lb baby spinach",
      "3 tbsp lemon juice",
      "2 tsp cumin seeds",
      "1 tsp black mustard seeds",
      "1 bunch cilantro, chopped"
    ],
    "directions": [
      "Rinse the basmati until the water runs clear, then soak in cold water for 20 minutes and drain well.",
      "Combine the lentils, 10 cups water and turmeric in an 8-quart pot. Bring to a boil, skim off the foam, then simmer uncovered, stirring now and then, until the lentils collapse into a thick purée, 20 to 25 minutes.",
      "While the lentils cook, bring the 5 cups rice water and 2 tsp salt to a boil in a 6-quart pot, add the drained rice, stir once, cover and cook on the lowest heat for 15 minutes. Rest covered 10 minutes, fluff and spread on a sheet pan to cool.",
      "Heat 2 tbsp of the oil in a large skillet over medium heat. Cook the onions until golden at the edges, 10 to 12 minutes. Add the garlic, ginger and serranos and cook 2 minutes, then add the ground cumin, coriander, garam masala and cayenne and stir for 30 seconds until fragrant.",
      "Add the tomatoes and cook, mashing, until jammy and the oil starts to separate, about 5 minutes. Scrape everything into the lentils.",
      "Stir in the coconut milk and 4 tsp salt and simmer 10 minutes, stirring often so it doesn't catch. The dal should be pourable but thick, like a loose porridge; add water ½ cup at a time if needed.",
      "Stir in the spinach by the handful until just wilted, about 2 minutes, then add the lemon juice. Taste and adjust salt.",
      "For the tadka, heat the remaining 2 tbsp oil in a small skillet over medium-high heat until shimmering. Add the cumin and mustard seeds and cook until the mustard seeds pop and the cumin darkens a shade, 30 to 45 seconds. Pour the sizzling oil over the dal and stir in.",
      "Cool the dal in shallow pans to below 70°F within 2 hours. Pack 1 cup rice and 1¼ cups dal into each of 12 containers and top with cilantro."
    ],
    "equipment": [
      "8-quart pot",
      "6-quart pot with lid",
      "12-inch skillet",
      "Small skillet",
      "Rimmed sheet pans",
      "12 divided meal-prep containers"
    ],
    "storage": "Refrigerate up to 4 days with rice and dal in separate compartments. The dal freezes well for 3 months (freeze without rice).",
    "reheating": "The dal thickens as it chills, so stir in 2 to 3 tbsp water before heating. Microwave: vent the lid and heat 3 to 4 minutes, stirring halfway, until 165°F throughout. Oven: combine in a covered oven-safe dish with a splash of water and heat at 325°F for 20 to 25 minutes to 165°F.",
    "makeAhead": "",
    "safety": "Reheat to 165°F. Cool cooked rice quickly and refrigerate within 2 hours to prevent Bacillus cereus growth. Cool from 135°F to 70°F within 2 hours and to 41°F or below within the next 4 hours; refrigerate at 40°F or below.",
    "chefNotes": "Salt the dal only after the lentils have broken down; it keeps them cooking evenly. Pack the cilantro in a small side cup so it tastes fresh on day four."
  },
  {
    "id": 24,
    "slug": "mushroom-and-lentil-shepherd-s-pie",
    "side": "meal-prep",
    "title": "Mushroom and Lentil Shepherd's Pie",
    "category": "Vegetarian",
    "description": "Simmered lentils and deeply browned mushrooms in a red wine and thyme gravy, blanketed with buttery Yukon Gold mash and baked golden.",
    "servings": 12,
    "yieldNote": "12 portions (two 9x13-inch pans, about 1½ cups each)",
    "active": 75,
    "total": 135,
    "tags": [
      "Freezer-friendly",
      "Kid-friendly",
      "Make-ahead"
    ],
    "allergens": [
      "Milk",
      "Wheat",
      "Soy"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "1 lb brown lentils, picked over and rinsed",
      "7 cups water (for the lentils)",
      "2 bay leaves",
      "1 tsp kosher salt (for the lentils)",
      "6 lb Yukon Gold potatoes, peeled and cut into 2-inch chunks",
      "2 tbsp kosher salt (for the potato water)",
      "12 tbsp unsalted butter, divided",
      "1½ cups whole milk, warmed",
      "2 tsp kosher salt (for the mash)",
      "1 tsp white pepper",
      "¼ cup olive oil, divided",
      "2½ lb cremini mushrooms, quartered and chopped",
      "2 large yellow onions, diced",
      "4 medium carrots, diced",
      "4 celery stalks, diced",
      "8 cloves garlic, minced",
      "¼ cup tomato paste",
      "⅓ cup all-purpose flour",
      "1 cup dry red wine",
      "4 cups low-sodium vegetable broth",
      "3 tbsp soy sauce",
      "1 tbsp fresh thyme leaves, chopped",
      "1 tbsp fresh rosemary, minced",
      "2 tsp kosher salt (for the filling)",
      "1 tsp black pepper",
      "2 cups frozen peas"
    ],
    "directions": [
      "Combine the lentils, 7 cups water, bay leaves and 1 tsp salt in a 4-quart saucepan. Bring to a boil, then simmer gently until tender but still holding their shape, 20 to 25 minutes. Drain, discard the bay leaves and set aside.",
      "Meanwhile, put the potatoes in a large pot, cover by 1 inch with cold water and add 2 tbsp salt. Bring to a boil and simmer until a knife slides through with no resistance, 15 to 18 minutes. Drain well and return to the hot pot for 1 minute to steam off moisture.",
      "Rice or mash the potatoes, then beat in 8 tbsp of the butter, the warm milk, 2 tsp salt and the white pepper until smooth. The mash should be stiff enough to hold a peak so it doesn't sink into the filling.",
      "Heat 2 tbsp of the oil in a large Dutch oven over high heat. Add half the mushrooms and cook, stirring only occasionally, until their liquid evaporates and they are deeply browned, 10 to 12 minutes. Transfer to a bowl and repeat with the remaining oil and mushrooms.",
      "Reduce the heat to medium, add 2 tbsp of the butter, the onions, carrots and celery and cook until softened, 8 to 10 minutes. Add the garlic and tomato paste and cook, stirring, until the paste darkens, 2 minutes. Sprinkle in the flour and stir for 1 minute.",
      "Pour in the wine, scraping up the browned bits, and simmer until nearly evaporated, 2 minutes. Whisk in the broth and soy sauce, add the thyme, rosemary, 2 tsp salt and the pepper and simmer until the gravy coats a spoon, about 8 minutes.",
      "Stir in the mushrooms and cooked lentils and simmer together 5 minutes so the lentils absorb the gravy. Off the heat, fold in the frozen peas. Taste and adjust seasoning. Heat the oven to 400°F.",
      "Divide the filling between two 9x13-inch baking dishes. Spoon the mash over the top, spread it to the edges to seal, and rake the surface with a fork. Melt the remaining 2 tbsp butter and brush it over the top.",
      "Set the dishes on rimmed sheet pans and bake until the filling bubbles at the edges and the peaks are golden, 25 to 30 minutes; broil 2 to 3 minutes for more color if needed. The center should read 165°F.",
      "Rest 20 minutes, then cut each pan into 6 portions and transfer to containers. Cool uncovered to below 70°F before lidding and refrigerating."
    ],
    "equipment": [
      "Large Dutch oven",
      "4-quart saucepan",
      "Large stockpot",
      "Potato ricer or masher",
      "Two 9x13-inch baking dishes",
      "Instant-read thermometer",
      "12 oven-safe meal-prep containers"
    ],
    "storage": "Cool within 2 hours and refrigerate up to 4 days. Freezes well for 3 months; thaw overnight in the refrigerator.",
    "reheating": "Microwave: vent the lid and heat 3 to 4 minutes at 70% power, then in 30-second bursts until the center reaches 165°F. Oven: uncover, set on a sheet pan and heat at 350°F for 25 to 30 minutes (40 to 45 minutes from frozen, covered with foil for the first half) until 165°F in the center and the top recrisps.",
    "makeAhead": "",
    "safety": "Bake and reheat to 165°F in the center. Cool from 135°F to 70°F within 2 hours and to 41°F or below within the next 4 hours; refrigerate at 40°F or below.",
    "chefNotes": "Brown the mushrooms in two batches with space in the pan; crowded mushrooms steam and the gravy tastes thin. Lentils are simmered separately in water, never browned dry, so they stay tender and don't split into mush in the gravy."
  },
  {
    "id": 25,
    "slug": "black-bean-and-sweet-potato-enchiladas",
    "side": "meal-prep",
    "title": "Black Bean and Sweet Potato Enchiladas",
    "category": "Vegetarian",
    "description": "Corn tortillas rolled around roasted sweet potato, black beans and Monterey Jack, smothered in a smoky homemade red chile sauce and baked bubbly.",
    "servings": 12,
    "yieldNote": "12 portions (2 enchiladas each; two 9x13-inch pans)",
    "active": 60,
    "total": 120,
    "tags": [
      "Freezer-friendly",
      "Gluten-free",
      "Kid-friendly"
    ],
    "allergens": [
      "Milk"
    ],
    "dietary": [
      "Gluten-free",
      "Vegetarian"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "3 lb sweet potatoes, peeled and cut into ½-inch dice",
      "¼ cup olive oil (for the sweet potatoes)",
      "2 tsp ground cumin (for the sweet potatoes)",
      "1 tsp chili powder (for the sweet potatoes)",
      "2 tsp kosher salt (for the sweet potatoes)",
      "3 tbsp olive oil (for the sauce)",
      "¼ cup chili powder (for the sauce)",
      "2 tsp ground cumin (for the sauce)",
      "1 tsp dried oregano",
      "1 tsp smoked paprika",
      "4 cloves garlic, minced (for the sauce)",
      "2 tbsp tomato paste",
      "1 can (15 oz) tomato sauce",
      "4 cups low-sodium vegetable broth (gluten-free)",
      "2 tbsp cornstarch",
      "2 tsp kosher salt (for the sauce)",
      "1 tbsp apple cider vinegar",
      "1 tbsp olive oil (for the filling)",
      "1 large yellow onion, diced",
      "2 medium poblano peppers, diced",
      "4 cloves garlic, minced (for the filling)",
      "3 cans (15 oz each) black beans, rinsed and drained",
      "2 tbsp lime juice",
      "1 bunch cilantro, chopped",
      "1 lb Monterey Jack cheese, shredded and divided",
      "24 corn tortillas (6-inch, 100% corn, labeled gluten-free)",
      "1 tbsp neutral oil (for the tortillas)"
    ],
    "directions": [
      "Heat the oven to 425°F. Toss the sweet potatoes with ¼ cup oil, 2 tsp cumin, 1 tsp chili powder and 2 tsp salt, spread on two rimmed sheet pans and roast, stirring once, until tender and browned at the edges, 25 to 30 minutes. Reduce the oven to 375°F.",
      "For the sauce, heat 3 tbsp oil in a 4-quart saucepan over medium heat. Add the ¼ cup chili powder, cumin, oregano, smoked paprika and garlic and stir for 45 seconds until fragrant and darkened; do not let it scorch. Stir in the tomato paste and cook 1 minute.",
      "Whisk in the tomato sauce and 3½ cups of the broth. Whisk the cornstarch into the remaining ½ cup broth and add it. Simmer, whisking, until slightly thickened, about 10 minutes. Stir in 2 tsp salt and the vinegar. You should have about 6 cups.",
      "For the filling, heat 1 tbsp oil in a large skillet over medium-high heat and cook the onion and poblanos until soft, 7 minutes. Add the garlic for 1 minute. Transfer to a large bowl with the roasted sweet potatoes and black beans and lightly mash about a quarter of the mixture so it holds together.",
      "Stir in the lime juice, half the cilantro, 1 cup of the enchilada sauce and 8 oz of the cheese. Taste and add salt if needed.",
      "Spread 1 cup sauce across the bottom of each of two 9x13-inch baking dishes.",
      "Brush the tortillas lightly with the 1 tbsp oil, stack in two piles, wrap in damp paper towels and microwave 60 to 90 seconds until pliable so they roll without cracking.",
      "Fill each tortilla with a scant ½ cup filling, roll snugly and place seam-side down, 12 per dish in two rows. Pour the remaining sauce evenly over the top, covering the tortilla edges, and scatter with the remaining 8 oz cheese.",
      "Cover with foil and bake 20 minutes, then uncover and bake until the sauce bubbles and the cheese is spotty brown, 12 to 15 minutes; the center should read 165°F.",
      "Rest 15 minutes, sprinkle with the remaining cilantro and portion 2 enchiladas per container. Cool uncovered to below 70°F before lidding."
    ],
    "equipment": [
      "2 rimmed sheet pans",
      "4-quart saucepan",
      "12-inch skillet",
      "Two 9x13-inch baking dishes",
      "Whisk",
      "Instant-read thermometer",
      "12 oven-safe meal-prep containers"
    ],
    "storage": "Refrigerate up to 4 days. Freeze individual portions up to 3 months; thaw overnight in the refrigerator before reheating.",
    "reheating": "Microwave: add 1 tbsp water, cover loosely and heat 2½ to 3 minutes at 70% power, then in 30-second bursts to 165°F in the center. Oven: cover with foil and heat at 350°F for 20 minutes, uncover and heat 5 to 10 minutes more to 165°F.",
    "makeAhead": "",
    "safety": "Bake and reheat to 165°F in the center. Cool from 135°F to 70°F within 2 hours and to 41°F or below within the next 4 hours; refrigerate at 40°F or below. Use 100% corn tortillas to keep this gluten-free; some brands blend in wheat flour.",
    "chefNotes": "Warm corn tortillas are the difference between neat rolls and a cracked mess; keep them wrapped until the moment you fill them. Make sure every tortilla edge is under sauce or it will dry and curl in the oven."
  },
  {
    "id": 26,
    "slug": "chickpea-and-vegetable-tagine-with-couscous",
    "side": "meal-prep",
    "title": "Chickpea and Vegetable Tagine with Couscous",
    "category": "Vegetarian",
    "description": "A warmly spiced Moroccan stew of chickpeas, butternut squash, carrots and apricots in a harissa-tomato broth, served with fluffy lemon couscous.",
    "servings": 12,
    "yieldNote": "12 portions (about 1½ cups tagine and ¾ cup couscous each)",
    "active": 45,
    "total": 90,
    "tags": [
      "Vegan",
      "Freezer-friendly",
      "High fiber"
    ],
    "allergens": [
      "Wheat"
    ],
    "dietary": [
      "Dairy-free",
      "Vegetarian",
      "Vegan"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "¼ cup olive oil",
      "2 large yellow onions, diced",
      "8 cloves garlic, minced",
      "2 tbsp fresh ginger, grated",
      "1 tbsp ground cumin",
      "1 tbsp ground coriander",
      "2 tsp sweet paprika",
      "1 tsp ground turmeric",
      "1 tsp ground cinnamon",
      "¼ tsp cayenne pepper",
      "2 tbsp tomato paste",
      "2 tbsp harissa paste",
      "1 can (28 oz) diced tomatoes",
      "6 cups low-sodium vegetable broth",
      "2 lb butternut squash, peeled and cut into 1-inch cubes",
      "1 lb carrots, cut into ¾-inch coins",
      "4 cans (15 oz each) chickpeas, rinsed and drained",
      "¾ cup dried apricots, quartered",
      "1 tbsp kosher salt (for the tagine)",
      "2 medium zucchini, cut into 1-inch chunks",
      "1 cup pitted green olives, halved",
      "2 tbsp lemon juice (for the tagine)",
      "1 bunch cilantro, chopped",
      "4 cups couscous",
      "5 cups water (for the couscous)",
      "2 tbsp olive oil (for the couscous)",
      "2 tsp kosher salt (for the couscous)",
      "1 tbsp lemon zest (for the couscous)"
    ],
    "directions": [
      "Heat ¼ cup oil in a 7- to 8-quart Dutch oven over medium heat. Cook the onions until soft and lightly golden, 8 to 10 minutes.",
      "Add the garlic and ginger and cook 1 minute. Add the cumin, coriander, paprika, turmeric, cinnamon and cayenne and stir 30 seconds until fragrant, then stir in the tomato paste and 1 tbsp harissa and cook until brick red, 2 minutes.",
      "Add the tomatoes and broth, scraping the bottom of the pot, then add the squash, carrots, chickpeas, apricots and 1 tbsp salt. Bring to a boil.",
      "Reduce to a gentle simmer, cover with the lid slightly ajar and cook until the carrots are just tender and the squash yields to a knife but still holds its shape, 20 to 25 minutes.",
      "Add the zucchini and olives and simmer uncovered until the zucchini is barely tender and the broth has thickened slightly, 8 to 10 minutes. Undercook the zucchini a little; it softens on reheating.",
      "Stir in the lemon juice, taste and adjust with salt and up to 1 tbsp more harissa. The broth should taste bright, sweet-spiced and savory.",
      "For the couscous, bring the 5 cups water, 2 tbsp oil, 2 tsp salt and the lemon zest to a boil. Put the couscous in a large heatproof bowl or hotel pan, pour the boiling water over, stir once, cover tightly and let stand 10 minutes. Fluff thoroughly with a fork and spread out to cool.",
      "Cool the tagine in shallow pans to below 70°F within 2 hours. Pack ¾ cup couscous and about 1½ cups tagine into each of 12 divided containers and top with cilantro."
    ],
    "equipment": [
      "7- to 8-quart Dutch oven",
      "Large heatproof bowl or hotel pan",
      "Kettle or saucepan",
      "Rimmed sheet pans",
      "Fork for fluffing",
      "12 divided meal-prep containers"
    ],
    "storage": "Keep couscous and tagine in separate compartments. Refrigerate up to 4 days. The tagine freezes well for 3 months; make couscous fresh or freeze it separately.",
    "reheating": "Microwave: sprinkle the couscous with 1 tbsp water, vent the lid and heat 3 to 4 minutes, stirring the tagine halfway, until 165°F throughout. Oven: combine in a covered oven-safe dish with 2 tbsp water and heat at 325°F for 20 to 25 minutes to 165°F.",
    "makeAhead": "",
    "safety": "Reheat to 165°F. Cool from 135°F to 70°F within 2 hours and to 41°F or below within the next 4 hours; refrigerate at 40°F or below.",
    "chefNotes": "Cut the squash and carrots to the sizes given so they finish together; small squash cubes turn to mush by day three. Harissa heat varies by brand, so add the second tablespoon only after tasting."
  },
  {
    "id": 27,
    "slug": "baked-ziti-with-ricotta-and-spinach",
    "side": "meal-prep",
    "title": "Baked Ziti with Ricotta and Spinach",
    "category": "Vegetarian",
    "description": "Slightly underdone ziti tossed in garlicky marinara, layered with herbed spinach ricotta and mozzarella, then baked until bubbling and golden.",
    "servings": 12,
    "yieldNote": "12 portions (two 9x13-inch pans, about 1¾ cups each)",
    "active": 50,
    "total": 110,
    "tags": [
      "Freezer-friendly",
      "Kid-friendly",
      "Make-ahead"
    ],
    "allergens": [
      "Milk",
      "Egg",
      "Wheat"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "¼ cup extra-virgin olive oil",
      "1 large yellow onion, finely diced",
      "10 cloves garlic, minced",
      "1 tsp red pepper flakes",
      "2 tsp dried oregano",
      "3 cans (28 oz each) crushed tomatoes",
      "1 cup water",
      "1 tbsp kosher salt (for the sauce)",
      "1 tsp sugar",
      "1 bunch basil, torn",
      "2 lb ziti",
      "3 tbsp kosher salt (for the pasta water)",
      "2 packages (10 oz each) frozen chopped spinach, thawed and squeezed dry",
      "2 lb whole-milk ricotta",
      "2 large eggs",
      "1½ cups grated vegetarian Parmesan-style cheese (microbial rennet), divided",
      "1½ tsp kosher salt (for the ricotta)",
      "1 tsp black pepper",
      "¼ tsp ground nutmeg",
      "1½ lb low-moisture whole-milk mozzarella, shredded and divided"
    ],
    "directions": [
      "Heat the oil in a large Dutch oven over medium heat. Cook the onion until soft, 6 to 8 minutes. Add the garlic, red pepper flakes and oregano and cook until the garlic is fragrant but not browned, 1 minute.",
      "Add the crushed tomatoes, water, 1 tbsp salt and the sugar. Simmer, stirring occasionally, until slightly thickened, 20 minutes. Stir in the basil. You want a loose sauce; the pasta will drink it up in the oven and in the fridge.",
      "Meanwhile, bring 6 quarts water and 3 tbsp salt to a boil in a 12-quart stockpot. Cook the ziti 3 minutes less than the package time so it is firm and chalky at the center. Drain without rinsing.",
      "In a bowl, stir together the spinach, ricotta, eggs, 1 cup of the Parmesan-style cheese, 1½ tsp salt, pepper and nutmeg until evenly green-flecked.",
      "Heat the oven to 375°F. Toss the drained ziti with all but 3 cups of the sauce and half the mozzarella.",
      "Spread ½ cup of the reserved sauce in each of two 9x13-inch baking dishes. Add a quarter of the pasta to each dish, dollop half the ricotta mixture over each in spoonfuls, then cover with the remaining pasta.",
      "Spoon the rest of the reserved sauce over the tops, making sure the pasta at the edges is coated, and scatter with the remaining mozzarella and Parmesan-style cheese.",
      "Cover with foil (tented so it doesn't touch the cheese) and bake 20 minutes. Uncover and bake until the cheese is browned in spots and the sauce bubbles at the edges, 15 to 20 minutes; the center should read 165°F.",
      "Rest 20 minutes so the layers set, then cut each pan into 6 portions. Cool uncovered to below 70°F before lidding and refrigerating."
    ],
    "equipment": [
      "Large Dutch oven",
      "12-quart stockpot",
      "Colander",
      "Two 9x13-inch baking dishes",
      "Aluminum foil",
      "Instant-read thermometer",
      "12 oven-safe meal-prep containers"
    ],
    "storage": "Refrigerate up to 4 days. Freezes well for 3 months; thaw overnight in the refrigerator.",
    "reheating": "Microwave: drizzle with 1 tbsp water, cover loosely and heat 3 minutes at 70% power, then in 30-second bursts to 165°F in the center. Oven: cover with foil and heat at 350°F for 25 minutes, then uncover for 5 minutes to 165°F (45 to 50 minutes from frozen).",
    "makeAhead": "",
    "safety": "The ricotta filling contains raw egg; bake until the center reaches 165°F (above the 160°F needed for egg dishes). Reheat to 165°F. Cool from 135°F to 70°F within 2 hours and to 41°F or below within the next 4 hours; refrigerate at 40°F or below.",
    "chefNotes": "Undercooking the pasta and keeping the sauce loose is what keeps meal-prep ziti from turning dry and gummy by day three. Squeeze the spinach in a clean towel until almost no liquid comes out, or the ricotta layer weeps."
  },
  {
    "id": 28,
    "slug": "vegetable-minestrone-with-white-beans",
    "side": "meal-prep",
    "title": "Vegetable Minestrone with White Beans",
    "category": "Vegetarian",
    "description": "A hearty Italian vegetable soup with cannellini beans, kale and potatoes in a tomato broth, with ditalini packed separately so it never goes mushy.",
    "servings": 12,
    "yieldNote": "12 portions (about 1¾ cups soup and ½ cup pasta each)",
    "active": 40,
    "total": 85,
    "tags": [
      "Vegan",
      "Freezer-friendly",
      "High fiber"
    ],
    "allergens": [
      "Wheat"
    ],
    "dietary": [
      "Dairy-free",
      "Vegetarian",
      "Vegan"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "¼ cup extra-virgin olive oil, plus more for finishing",
      "2 large yellow onions, diced",
      "4 medium carrots, diced",
      "4 celery stalks, diced",
      "8 cloves garlic, minced",
      "3 tbsp tomato paste",
      "2 tsp dried oregano",
      "1 tsp dried thyme",
      "½ tsp red pepper flakes",
      "2 bay leaves",
      "1 can (28 oz) diced tomatoes",
      "12 cups low-sodium vegetable broth",
      "1 lb Yukon Gold potatoes, cut into ½-inch dice",
      "1 tbsp kosher salt (for the soup)",
      "1 tsp black pepper",
      "8 oz green beans, cut into 1-inch pieces",
      "2 medium zucchini, cut into ½-inch dice",
      "3 cans (15 oz each) cannellini beans, rinsed and drained",
      "1 bunch lacinato kale, stemmed and chopped",
      "2 tbsp red wine vinegar",
      "1 bunch basil, torn",
      "12 oz ditalini pasta",
      "3 tbsp kosher salt (for the pasta water)",
      "1 tbsp olive oil (for the pasta)"
    ],
    "directions": [
      "Heat ¼ cup oil in an 8- to 10-quart pot over medium heat. Add the onions, carrots and celery and cook, stirring occasionally, until soft and lightly golden, 10 to 12 minutes.",
      "Add the garlic, tomato paste, oregano, thyme and red pepper flakes and cook, stirring, until the paste darkens, 2 minutes.",
      "Add the diced tomatoes, broth, bay leaves, potatoes, 1 tbsp salt and the pepper. Bring to a boil, then simmer uncovered until the potatoes are just tender, 15 minutes.",
      "Add the green beans and simmer 5 minutes, then add the zucchini, cannellini beans and kale and simmer until the kale is tender and the zucchini is just cooked through, 8 to 10 minutes.",
      "Mash about 1 cup of the beans against the side of the pot and stir them in to give the broth body. Remove the bay leaves, stir in the vinegar and basil, and taste for salt.",
      "Meanwhile, bring 5 quarts water and 3 tbsp salt to a boil. Cook the ditalini 1 minute less than the package time, drain, rinse briefly under cold water to stop the cooking, and toss with 1 tbsp oil so it doesn't clump.",
      "Cool the soup in shallow pans or an ice bath to below 70°F within 2 hours.",
      "Portion about 1¾ cups soup into each of 12 containers and pack ½ cup pasta separately in a small container or a divided compartment."
    ],
    "equipment": [
      "8- to 10-quart pot",
      "Large saucepan for pasta",
      "Colander",
      "Rimmed sheet pans or ice bath",
      "12 soup containers (32 oz)",
      "12 small containers for pasta"
    ],
    "storage": "Keep the pasta separate from the soup, or it swells and turns the soup to porridge. Refrigerate up to 4 days. The soup (without pasta) freezes for 3 months.",
    "reheating": "Microwave: heat the soup, vented, for 3 to 4 minutes, stirring halfway; add the pasta for the last 30 seconds and heat until the soup reaches 165°F. Stovetop or oven: heat the soup in a covered saucepan or oven-safe dish (325°F for 20 to 25 minutes) to 165°F, then stir in the pasta and let it warm through for 1 minute. Finish with a drizzle of olive oil.",
    "makeAhead": "",
    "safety": "Reheat to 165°F. Cool from 135°F to 70°F within 2 hours and to 41°F or below within the next 4 hours; refrigerate at 40°F or below.",
    "chefNotes": "Cooking the vegetables in stages keeps each one at the right texture after reheating. For non-vegan clients, a spoonful of pesto or grated Parmesan on top at serving is a great upgrade (add Milk and Tree nuts to the label if so)."
  },
  {
    "id": 29,
    "slug": "tofu-and-vegetable-stir-fry-with-peanut-sauce",
    "side": "meal-prep",
    "title": "Tofu and Vegetable Stir-Fry with Peanut Sauce",
    "category": "Vegetarian",
    "description": "Crisp oven-roasted tofu and snappy broccoli, peppers and snap peas over jasmine rice, with a gingery peanut sauce packed on the side.",
    "servings": 12,
    "yieldNote": "12 portions (about 1½ cups stir-fry, 1 cup rice and 3 tbsp sauce each)",
    "active": 60,
    "total": 90,
    "tags": [
      "Vegan",
      "High protein",
      "Sauce on the side"
    ],
    "allergens": [
      "Peanuts",
      "Soy",
      "Wheat",
      "Sesame"
    ],
    "dietary": [
      "Dairy-free",
      "Vegetarian",
      "Vegan"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "5 packages (14 oz each) extra-firm tofu, drained",
      "3 tbsp soy sauce (for the tofu)",
      "¼ cup cornstarch",
      "¼ cup neutral oil (for the tofu)",
      "4 cups jasmine rice",
      "5 cups water (for the rice)",
      "1½ tsp kosher salt (for the rice)",
      "1¼ cups creamy peanut butter",
      "½ cup soy sauce (for the sauce)",
      "⅓ cup rice vinegar",
      "¼ cup maple syrup",
      "2 tbsp toasted sesame oil",
      "2 tbsp sriracha",
      "2 tbsp fresh ginger, grated (for the sauce)",
      "4 cloves garlic, grated (for the sauce)",
      "3 tbsp lime juice",
      "1 cup hot water (for the sauce)",
      "3 tbsp neutral oil (for the vegetables)",
      "2 lb broccoli florets, cut bite-size",
      "4 medium carrots, thinly sliced on the diagonal",
      "3 medium red bell peppers, sliced",
      "1 lb sugar snap peas, trimmed",
      "4 cloves garlic, minced (for the vegetables)",
      "1 tbsp fresh ginger, minced (for the vegetables)",
      "2 tbsp soy sauce (for the vegetables)",
      "1 bunch scallions, sliced",
      "½ cup roasted peanuts, chopped"
    ],
    "directions": [
      "Heat the oven to 425°F with racks in the upper and lower thirds. Wrap the tofu blocks in towels, set a sheet pan and a few cans on top and press 20 minutes. Cut into ¾-inch cubes.",
      "Toss the tofu gently with 3 tbsp soy sauce, then with the cornstarch until coated. Divide ¼ cup oil between two rimmed sheet pans, add the tofu in a single layer and roast, flipping once and rotating the pans, until golden and crisp on most sides, 30 to 35 minutes.",
      "Meanwhile, rinse the rice until the water runs mostly clear. Combine with 5 cups water and 1½ tsp salt in a 6-quart pot, bring to a boil, cover and cook on the lowest heat 18 minutes. Rest covered 10 minutes, fluff and spread on a sheet pan to cool.",
      "For the peanut sauce, whisk the peanut butter, ½ cup soy sauce, vinegar, maple syrup, sesame oil, sriracha, ginger, garlic and lime juice in a bowl, then whisk in the hot water a little at a time until smooth and pourable, like heavy cream.",
      "Heat 1 tbsp of the oil in a wok or 12-inch skillet over high heat until just smoking. Stir-fry the carrots and broccoli in two batches: add half and stir-fry 2 minutes, then add 1 tbsp water, cover and steam 1 minute until bright green and crisp-tender. Transfer to a sheet pan and repeat with the rest.",
      "Add another 1 tbsp oil, then the bell peppers and snap peas and stir-fry until blistered in spots but still crunchy, 2 to 3 minutes. Add to the sheet pan.",
      "Add the last 1 tbsp oil, the garlic and ginger and stir 20 seconds, then add 2 tbsp soy sauce and pour the mixture over the vegetables and tofu on the sheet pans; toss to coat. Keep everything slightly underdone; it will soften on reheating.",
      "Spread on sheet pans to cool quickly. Pack 1 cup rice and about 1½ cups tofu and vegetables into each of 12 containers, scatter with scallions, and pack 3 tbsp peanut sauce and a spoonful of chopped peanuts in small lidded cups."
    ],
    "equipment": [
      "Wok or 12-inch skillet",
      "3 rimmed sheet pans",
      "6-quart pot with lid",
      "Mixing bowl and whisk",
      "Clean kitchen towels",
      "12 meal-prep containers with 2-oz sauce cups"
    ],
    "storage": "Keep the peanut sauce and peanuts separate so the tofu stays crisp. Refrigerate up to 4 days. The sauce thickens when cold; stir well before using. Not recommended for freezing.",
    "reheating": "Microwave: sprinkle the rice with 1 tbsp water, vent the lid and heat 2½ to 3 minutes, stirring halfway, until 165°F. Oven: spread the tofu, vegetables and rice in a covered oven-safe dish with 2 tbsp water and heat at 350°F for 15 to 20 minutes to 165°F. Warm the sauce 20 seconds, stir, and pour over just before eating.",
    "makeAhead": "",
    "safety": "Reheat to 165°F. Cool cooked rice quickly and refrigerate within 2 hours to prevent Bacillus cereus growth. Contains peanuts; keep the sauce labeled and away from other clients' meals. Cool from 135°F to 70°F within 2 hours and to 41°F or below within the next 4 hours; refrigerate at 40°F or below.",
    "chefNotes": "Roasting the tofu on sheet pans instead of frying it in batches gets 5 packages crisp at once and holds that texture better in the fridge. For a gluten-free version, swap tamari for the soy sauce and remove Wheat from the label."
  },
  {
    "id": 30,
    "slug": "stuffed-peppers-with-quinoa-black-beans-and-corn",
    "side": "meal-prep",
    "title": "Stuffed Peppers with Quinoa, Black Beans and Corn",
    "category": "Vegetarian",
    "description": "Tender bell peppers packed with smoky quinoa, black beans, corn and fire-roasted tomatoes, topped with melted Monterey Jack.",
    "servings": 12,
    "yieldNote": "12 portions (1 whole stuffed pepper each)",
    "active": 45,
    "total": 100,
    "tags": [
      "Gluten-free",
      "High fiber",
      "Kid-friendly"
    ],
    "allergens": [
      "Milk"
    ],
    "dietary": [
      "Gluten-free",
      "Vegetarian"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "12 large bell peppers, mixed colors",
      "1 tbsp olive oil (for the peppers)",
      "1 tsp kosher salt (for the peppers)",
      "2 cups quinoa, rinsed well",
      "3 cups low-sodium vegetable broth (gluten-free)",
      "2 tbsp olive oil (for the filling)",
      "1 large yellow onion, diced",
      "2 jalapeños, seeded and minced",
      "4 cloves garlic, minced",
      "2 tbsp chili powder",
      "2 tsp ground cumin",
      "1 tsp smoked paprika",
      "1 tsp dried oregano",
      "3 cans (15 oz each) black beans, rinsed and drained",
      "1 lb frozen corn kernels, thawed",
      "1 can (14.5 oz) fire-roasted diced tomatoes",
      "2 tsp kosher salt (for the filling)",
      "3 tbsp lime juice",
      "1 bunch cilantro, chopped",
      "12 oz Monterey Jack cheese, shredded and divided",
      "1 cup water (for the baking dishes)"
    ],
    "directions": [
      "Heat the oven to 400°F. Cut the tops off the peppers, pull out the cores and ribs, and trim a thin slice off any wobbly bottoms so they stand upright without making a hole. Rub with 1 tbsp oil and 1 tsp salt.",
      "Stand the peppers cut-side down on a rimmed sheet pan and roast 12 minutes to soften them slightly and drive off some moisture. Turn them upright to cool. Reduce the oven to 375°F.",
      "Meanwhile, combine the quinoa and broth in a 3-quart saucepan, bring to a boil, cover and simmer on low until the liquid is absorbed and the grains show their little tails, 15 minutes. Rest covered 5 minutes and fluff.",
      "Heat 2 tbsp oil in a large Dutch oven or 12-inch skillet over medium heat. Cook the onion and jalapeños until soft, 6 to 8 minutes. Add the garlic, chili powder, cumin, smoked paprika and oregano and stir 1 minute until fragrant.",
      "Add the black beans, corn, tomatoes with their juice and 2 tsp salt and simmer 5 minutes until most of the liquid is absorbed. Off the heat, fold in the quinoa, lime juice, half the cilantro and 8 oz of the cheese. Taste and adjust salt; the filling should be boldly seasoned.",
      "Pour ½ cup water into each of two 9x13-inch baking dishes. Stand 6 peppers in each dish and pack the filling in firmly, mounding it slightly; spoon any extra filling into the gaps between peppers.",
      "Cover tightly with foil and bake until the peppers are tender when pierced with a knife, 30 to 35 minutes.",
      "Uncover, top with the remaining 4 oz cheese and bake until melted and lightly browned, 10 to 12 minutes; the center of the filling should read 165°F.",
      "Sprinkle with the remaining cilantro and cool uncovered to below 70°F within 2 hours. Pack 1 pepper per container, spooning any filling and juices from the dish around it."
    ],
    "equipment": [
      "Rimmed sheet pan",
      "3-quart saucepan with lid",
      "Large Dutch oven or 12-inch skillet",
      "Two 9x13-inch baking dishes",
      "Aluminum foil",
      "Instant-read thermometer",
      "12 oven-safe meal-prep containers"
    ],
    "storage": "Refrigerate up to 4 days. Can be frozen up to 2 months, though the peppers will soften; thaw overnight in the refrigerator.",
    "reheating": "Microwave: add 1 tbsp water, cover loosely and heat 2½ to 3 minutes at 70% power, then in 30-second bursts to 165°F in the center of the filling. Oven: cover with foil and heat at 350°F for 20 to 25 minutes to 165°F, uncovering for the last 5 minutes.",
    "makeAhead": "",
    "safety": "Bake and reheat until the center of the filling reaches 165°F. Cool from 135°F to 70°F within 2 hours and to 41°F or below within the next 4 hours; refrigerate at 40°F or below.",
    "chefNotes": "Pre-roasting the peppers cut-side down is the key to tender shells without a watery filling. Rinse the quinoa thoroughly to remove its bitter saponin coating, even if the bag says pre-washed."
  },
  {
    "id": 101,
    "slug": "dungeness-crab-cakes-with-meyer-lemon-aioli",
    "side": "private-chef",
    "title": "Dungeness Crab Cakes with Meyer Lemon Aioli",
    "category": "Starters",
    "description": "Sweet Oregon Dungeness crab barely bound and seared golden, served with a bright Meyer lemon aioli and a tangle of lemony greens.",
    "servings": 6,
    "yieldNote": "Serves 6 (12 cakes, 2 per guest)",
    "active": 45,
    "total": 105,
    "tags": [
      "Pacific Northwest",
      "Make-ahead",
      "Seafood"
    ],
    "allergens": [
      "Shellfish",
      "Egg",
      "Wheat",
      "Milk"
    ],
    "dietary": [],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "1½ lb Dungeness crab meat, picked over for shell and gently squeezed dry",
      "⅓ cup mayonnaise (for the cakes)",
      "1 large egg",
      "2 tsp Dijon mustard",
      "1 tbsp Meyer lemon juice (for the cakes)",
      "1 tsp Meyer lemon zest (for the cakes)",
      "1 small shallot, very finely minced",
      "2 tbsp minced chives",
      "2 tbsp minced flat-leaf parsley",
      "½ tsp sweet paprika",
      "⅛ tsp cayenne pepper",
      "½ tsp kosher salt (for the cakes)",
      "¾ cup panko breadcrumbs (for the cakes)",
      "1 cup panko breadcrumbs, for coating",
      "3 tbsp neutral oil, such as grapeseed",
      "2 tbsp unsalted butter",
      "¾ cup mayonnaise (for the aioli)",
      "1 clove garlic, finely grated",
      "1 tbsp extra-virgin olive oil (for the aioli)",
      "2 tbsp Meyer lemon juice (for the aioli)",
      "1 tsp Meyer lemon zest (for the aioli)",
      "¼ tsp kosher salt (for the aioli)",
      "3 oz baby arugula",
      "1 tsp extra-virgin olive oil (for the greens)",
      "1 Meyer lemon, cut into 6 wedges",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Make the aioli: whisk the ¾ cup mayonnaise with the grated garlic, olive oil, Meyer lemon juice, zest and ¼ tsp salt until smooth. This is a mayonnaise-based aioli, so it uses commercially made mayonnaise (made with pasteurized eggs) instead of raw yolks. Cover and refrigerate at least 30 minutes so the garlic mellows.",
      "Spread the crab on a sheet pan and pick through it once more with your fingertips for shell and cartilage, keeping the lumps as whole as possible. Blot with paper towels; wet crab makes loose cakes.",
      "In a large bowl whisk the ⅓ cup mayonnaise, egg, Dijon, lemon juice and zest, shallot, chives, parsley, paprika, cayenne and ½ tsp salt.",
      "Add the crab and scatter the ¾ cup panko over it. Fold with a rubber spatula just until everything is coated; stop before the lumps break down. The mix should barely hold together when squeezed.",
      "Using a ⅓-cup measure, portion 12 mounds onto a parchment-lined sheet pan. Gently pat each into a cake about 2½ inches wide and ¾ inch thick.",
      "Put the coating panko in a shallow dish. Press each cake lightly into the crumbs on both sides and around the edge, then return to the sheet pan. Refrigerate uncovered at least 30 minutes (up to 8 hours) so the binder sets and the cakes hold in the pan.",
      "Heat the oven to 400°F. Heat 1½ tbsp oil and 1 tbsp butter in a 12-inch skillet (cast iron or heavy nonstick) over medium heat until the butter foams. Cook 6 cakes without moving them until deep golden, about 3 minutes; flip carefully with a thin spatula and brown the second side, 2 to 3 minutes more. Transfer to a rack set on a sheet pan and repeat with the remaining fat and cakes.",
      "Slide the rack into the oven for 4 to 5 minutes, until the centers read 160°F on an instant-read thermometer (the binder contains egg).",
      "Meanwhile toss the arugula with 1 tsp olive oil and a pinch of kosher salt.",
      "To plate: swoosh a tablespoon of aioli across one side of each warm plate with the back of a spoon. Lean two crab cakes against each other on the swoosh, tuck a small nest of arugula alongside, add a Meyer lemon wedge, and finish the cakes with a pinch of flaky salt. Pass extra aioli at the table."
    ],
    "equipment": [
      "12-inch cast-iron or heavy nonstick skillet",
      "Rimmed sheet pans with a wire rack",
      "⅓-cup measure",
      "Thin fish spatula",
      "Instant-read thermometer",
      "Rubber spatula"
    ],
    "storage": "Refrigerate leftover cooked cakes within 2 hours, covered, up to 2 days; aioli keeps 4 days. Reheat cakes on a rack in a 375°F oven for 8 to 10 minutes to 165°F so the crust stays crisp.",
    "reheating": "",
    "makeAhead": "Day before (commissary): pick the crab, make the aioli, and mince the shallot and herbs; store separately and cold. Up to 8 hours ahead: mix, form and crumb the cakes, then hold them uncovered on a parchment-lined sheet pan at 41°F or below. At the client's home: sear 15 minutes before the course, finish in the oven, and plate.",
    "safety": "Keep crab and formed cakes at 41°F or below until cooking. Cook cakes until the centers reach 160°F because the binder contains raw egg. The aioli is made with commercially prepared mayonnaise (pasteurized eggs), so it contains no raw yolk; keep it refrigerated until service. Cool leftovers to 70°F within 2 hours and to 41°F within 4 more.",
    "chefNotes": "Squeeze the crab gently in a clean towel rather than pressing hard; you want it dry, not shredded. If a test cake falls apart, add 1 to 2 tbsp more panko rather than more mayonnaise."
  },
  {
    "id": 102,
    "slug": "oysters-on-the-half-shell-with-champagne-mignonette",
    "side": "private-chef",
    "title": "Oysters on the Half Shell with Champagne Mignonette",
    "category": "Starters",
    "description": "Briny Pacific oysters shucked to order and served ice-cold with a sharp shallot and Champagne mignonette and fresh lemon.",
    "servings": 6,
    "yieldNote": "Serves 6 (36 oysters, 6 per guest)",
    "active": 40,
    "total": 100,
    "tags": [
      "Raw bar",
      "Pacific Northwest",
      "Seasonal: fall–spring"
    ],
    "allergens": [
      "Shellfish"
    ],
    "dietary": [
      "Gluten-free",
      "Dairy-free"
    ],
    "image": "/cookbook/pc/oysters-on-the-half-shell-with-champagne-mignonette.webp",
    "photoCredit": {
      "author": "Mitili Mitili",
      "source": "Unsplash",
      "page": "https://unsplash.com/photos/a-plate-of-oysters-with-lemon-wedges-on-a-table-d4uM0nxZwYE"
    },
    "ingredients": [
      "36 live Pacific oysters, such as Netarts Bay, scrubbed",
      "½ cup Champagne vinegar",
      "¼ cup dry sparkling wine",
      "2 small shallots, very finely minced",
      "1 tsp coarsely cracked black pepper",
      "¼ tsp kosher salt",
      "10 lb crushed ice",
      "2 lemons, cut into wedges",
      "1 bunch chervil, for garnish"
    ],
    "directions": [
      "When the oysters arrive, check that every shell is tightly closed (or snaps shut when tapped) and feels heavy for its size; discard any that are gaping, cracked or smell off. Keep the shellstock tag with the date of service and file it for 90 days.",
      "Store oysters cup side down in a bowl or perforated pan under a damp towel at 33°F to 41°F. Never seal them in plastic or submerge them in fresh water or melting ice; they need air and will die in fresh water.",
      "Make the mignonette at least 1 hour ahead: stir the vinegar, sparkling wine, shallots, cracked pepper and salt in a small bowl. Chill. The shallots soften and turn faintly pink as they steep.",
      "Just before shucking, scrub each shell under cold running water with a stiff brush to remove grit and mud so nothing falls onto the meat.",
      "Shuck: fold a heavy kitchen towel and grip the oyster flat side up, cup side down, with the hinge pointing toward you. Insert the tip of an oyster knife into the hinge and rock and twist the handle (don't push hard) until the hinge pops.",
      "Wipe the blade clean, then slide it flat along the underside of the top shell to sever the upper adductor muscle; lift off and discard the top shell. Keep the oyster level so you save its liquor.",
      "Slide the knife under the oyster to cut the bottom adductor so it slips free on the half shell. Pick out any shell chips with the knife tip, and smell each one: it should smell like clean seawater. Discard any that are dry, shriveled or smell sour.",
      "Shuck no more than 20 minutes before serving and set each oyster directly onto the ice as you go so the meat stays below 41°F.",
      "To plate: fill a chilled platter or six chilled rimmed plates with crushed ice and nestle 6 oysters per guest level in the ice like the spokes of a wheel. Set a small ramekin of mignonette with a tiny spoon in the center, tuck lemon wedges and chervil sprigs between the shells, and serve immediately with oyster forks."
    ],
    "equipment": [
      "Oyster knife",
      "Heavy kitchen towel or cut-resistant glove",
      "Stiff scrub brush",
      "Chilled serving platter or rimmed plates",
      "Small ramekins with tiny spoons",
      "Oyster forks"
    ],
    "storage": "Shucked oysters don't keep; discard any left on the ice after 1 hour of service. Leftover live, unshucked oysters can be held cup side down under a damp towel at 33°F to 41°F for up to 3 days. Mignonette keeps 1 week refrigerated.",
    "reheating": "",
    "makeAhead": "Day before (commissary): make the mignonette, cut lemon wedges, and chill the serving platters. Receive oysters as close to the event as possible and transport them in a cooler with ice packs (not loose ice), cup side down under a damp towel. At the client's home: scrub, then shuck to order no more than 20 minutes before the course and plate directly on ice.",
    "safety": "Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions. Raw oysters can carry Vibrio bacteria and norovirus; people with liver disease, diabetes, a weakened immune system, or who are pregnant should eat oysters only when fully cooked. Buy from certified shippers with shellstock tags, keep oysters at 41°F or below, and never serve an oyster that was dead before shucking.",
    "chefNotes": "Smaller Pacific oysters (2½ to 3½ inches) are easiest for guests and cleanest to shuck; Kumamotos are a great addition. If a hinge won't give, try the side of the shell near the adductor instead of forcing it."
  },
  {
    "id": 103,
    "slug": "smoked-salmon-rillettes-with-grilled-bread",
    "side": "private-chef",
    "title": "Smoked Salmon Rillettes with Grilled Bread",
    "category": "Starters",
    "description": "Gently poached and smoked salmon folded with butter, crème fraîche, herbs and lemon, sealed in ramekins and served with charred sourdough.",
    "servings": 6,
    "yieldNote": "Serves 6 (six 4-oz ramekins)",
    "active": 40,
    "total": 190,
    "tags": [
      "Make-ahead",
      "Pacific Northwest",
      "Seafood"
    ],
    "allergens": [
      "Fish",
      "Milk",
      "Wheat"
    ],
    "dietary": [],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "2 cups water",
      "½ cup dry white wine",
      "1 bay leaf",
      "1 tsp kosher salt (for poaching)",
      "12 oz skinless fresh salmon fillet, such as coho, pin bones removed",
      "6 oz cold-smoked salmon, finely diced",
      "6 tbsp unsalted butter, softened (for the rillettes)",
      "¼ cup crème fraîche",
      "1 small shallot, very finely minced",
      "2 tbsp lemon juice",
      "1 tsp lemon zest",
      "2 tbsp minced chives",
      "1 tbsp chopped dill, plus fronds for garnish",
      "1 tbsp capers, rinsed and chopped",
      "½ tsp kosher salt (for the rillettes)",
      "¼ tsp ground white pepper",
      "3 tbsp unsalted butter, melted (for sealing)",
      "1 large loaf country sourdough bread, cut into 12 slices ½ inch thick",
      "3 tbsp extra-virgin olive oil",
      "1 clove garlic, halved",
      "1 small English cucumber, thinly sliced",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Combine the water, wine, bay leaf and 1 tsp salt in a 10-inch straight-sided skillet and bring to a bare simmer, about 170°F; small bubbles should just break the surface.",
      "Slip in the fresh salmon, cover, and poach over the lowest heat until the thickest part reaches 145°F and flakes, 8 to 10 minutes depending on thickness. Lift out onto a plate and cool 15 minutes, then refrigerate until cold, about 20 minutes. Discard the liquid.",
      "In a medium bowl beat the softened butter and crème fraîche with a rubber spatula until smooth and creamy. Stir in the shallot, lemon juice and zest, chives, dill, capers, ½ tsp salt and the white pepper.",
      "Flake the cold poached salmon into the bowl in small pieces, removing any gray bloodline, then add the diced smoked salmon. Fold and gently mash with a fork until evenly combined but still textured; it should look like coarse pâté, not a paste. Taste and adjust salt and lemon.",
      "Pack the mixture into six 4-oz ramekins, tapping them on the counter to remove air pockets, and smooth the tops. Pour about 1½ tsp melted butter over each to seal, add a small dill frond, and refrigerate at least 2 hours, until firm.",
      "Pull the ramekins from the refrigerator 20 minutes before serving; rillettes are best cool, not fridge-cold, when the butter is spreadable.",
      "Heat a grill pan or grill to medium-high. Brush the bread on both sides with olive oil and grill until well marked and crisp at the edges, about 1½ minutes per side. Rub one side of each slice lightly with the cut garlic and sprinkle with flaky salt.",
      "To plate: set a ramekin on one side of each board or plate with a small spreading knife, fan a few cucumber slices beside it, and lean two slices of warm grilled bread (halved on the bias) against the ramekin."
    ],
    "equipment": [
      "10-inch straight-sided skillet with lid",
      "Instant-read thermometer",
      "Six 4-oz ramekins",
      "Grill pan or outdoor grill",
      "Mixing bowls and rubber spatula",
      "Pastry brush"
    ],
    "storage": "Butter-sealed rillettes keep up to 4 days refrigerated at 41°F or below; once opened, eat within 2 days. Grilled bread does not keep well; store it airtight at room temperature and re-toast.",
    "reheating": "",
    "makeAhead": "One to two days ahead (commissary): poach the salmon, mix the rillettes, pack and butter-seal the ramekins, and chill. Slice bread the morning of. At the client's home: temper the ramekins 20 minutes, grill the bread just before the course, and plate.",
    "safety": "Poach fresh salmon to 145°F or until opaque and flaky. Cold-smoked salmon is a ready-to-eat product that is not cooked; keep it at 41°F or below. Pregnant guests, older adults and people with weakened immune systems are advised to avoid refrigerated smoked seafood because of Listeria risk. Cool poached salmon to 70°F within 2 hours and to 41°F within 4 more.",
    "chefNotes": "Keep the poaching water well below a simmer; boiling makes the salmon dry and chalky, and the rillettes will taste grainy. Season a little more aggressively than you think, since cold food tastes less salty."
  },
  {
    "id": 104,
    "slug": "wild-mushroom-toast-with-thyme-and-aged-gouda",
    "side": "private-chef",
    "title": "Wild Mushroom Toast with Thyme and Aged Gouda",
    "category": "Starters",
    "description": "Deeply browned wild mushrooms, chanterelles when in season, glossed with sherry and crème fraîche on garlicky toast under a veil of aged Gouda.",
    "servings": 6,
    "yieldNote": "Serves 6 (1 toast each)",
    "active": 40,
    "total": 45,
    "tags": [
      "Vegetarian",
      "Seasonal: fall",
      "Pacific Northwest"
    ],
    "allergens": [
      "Milk",
      "Wheat"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "image": "/cookbook/pc/wild-mushroom-toast-with-thyme-and-aged-gouda.webp",
    "photoCredit": {
      "author": "Valeria Boltneva",
      "source": "Pexels",
      "page": "https://www.pexels.com/photo/a-plate-with-a-piece-of-meat-and-mushrooms-on-it-28292004/"
    },
    "ingredients": [
      "1½ lb mixed wild mushrooms, such as chanterelles, maitake and oyster, cleaned and torn into bite-size pieces",
      "2 tbsp neutral oil, such as grapeseed",
      "4 tbsp unsalted butter, divided",
      "2 medium shallots, minced",
      "3 cloves garlic, minced",
      "1 tbsp fresh thyme leaves",
      "1 tsp kosher salt",
      "½ tsp freshly ground black pepper",
      "¼ cup dry sherry",
      "⅓ cup crème fraîche",
      "1 tsp lemon juice",
      "6 slices country sourdough bread, cut ¾ inch thick",
      "2 tbsp extra-virgin olive oil",
      "1 clove garlic, halved",
      "3 oz aged Gouda, finely grated",
      "1 tbsp minced chives",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Clean the mushrooms with a soft brush or damp towel; chanterelles hide grit in their gills, so swish them briefly in cold water if needed and dry thoroughly. Tear or slice into roughly 1-inch pieces so they cook evenly.",
      "Heat 1 tbsp oil in a 12-inch skillet over medium-high heat until shimmering. Add half the mushrooms in a single layer and cook without stirring for 3 minutes. Chanterelles will release water first; keep cooking until it evaporates and the mushrooms sizzle and brown, 6 to 8 minutes total. Transfer to a bowl and repeat with the remaining oil and mushrooms.",
      "Return all the mushrooms to the pan, lower the heat to medium, and add 2 tbsp butter, the shallots, garlic, thyme, salt and pepper. Cook, stirring, until the shallots soften and smell sweet, about 2 minutes.",
      "Add the sherry and scrape up the browned bits; simmer until almost dry, about 1 minute. Stir in the crème fraîche and the remaining 2 tbsp butter until the mushrooms are glossy and lightly coated. Add the lemon juice, taste, and adjust salt. Keep warm off the heat.",
      "Heat the broiler with a rack 6 inches from the element. Brush both sides of the bread with olive oil and toast on a sheet pan under the broiler until golden and crisp outside but still tender in the center, about 1½ minutes per side. Rub one side of each toast with the cut garlic.",
      "Pile the mushrooms generously onto the garlic side of each toast, spooning any pan sauce over the top so it soaks in.",
      "Shower the Gouda over the mushrooms and slide the toasts back under the broiler just until the cheese melts and begins to bubble, 45 to 60 seconds. Watch closely.",
      "To plate: cut each toast in half on the diagonal and set the halves slightly offset in the center of a warm plate. Scatter chives and a few thyme leaves over the top, add a pinch of flaky salt, and serve right away while the toast is still crisp."
    ],
    "equipment": [
      "12-inch stainless or cast-iron skillet",
      "Rimmed sheet pan",
      "Pastry brush",
      "Mushroom brush",
      "Microplane or fine grater",
      "Serrated bread knife"
    ],
    "storage": "Refrigerate leftover mushroom topping within 2 hours up to 3 days; store toast separately. Rewarm the mushrooms in a skillet until steaming (165°F) and assemble on fresh toast.",
    "reheating": "",
    "makeAhead": "Day before (commissary): clean and tear the mushrooms, mince shallots and garlic, pick thyme, grate the Gouda, and slice the bread; store each separately (mushrooms in a paper-towel-lined container, not sealed plastic). At the client's home: brown the mushrooms up to 1 hour ahead and hold at room temperature, then rewarm with the butter and crème fraîche, toast the bread, and broil just before serving.",
    "safety": "Only use wild mushrooms bought from a licensed, reputable forager or market; never serve foraged mushrooms that have not been positively identified. Cook mushrooms thoroughly. For strictly vegetarian guests, choose a Gouda made with microbial (non-animal) rennet.",
    "chefNotes": "Crowding the pan steams mushrooms instead of browning them, so cook in batches even if it feels slow. Salt after browning, not before, or the mushrooms will weep and stew."
  },
  {
    "id": 105,
    "slug": "summer-corn-and-heirloom-tomato-bruschetta",
    "side": "private-chef",
    "title": "Summer Corn and Heirloom Tomato Bruschetta",
    "category": "Starters",
    "description": "Crisp garlic crostini piled with blistered cherry tomatoes, charred sweet corn and a heap of fresh basil ribbons, served family-style on a board.",
    "servings": 6,
    "yieldNote": "Serves 6 (24 crostini, 4 per guest)",
    "active": 35,
    "total": 40,
    "tags": [
      "Vegan",
      "Seasonal: summer",
      "Crowd-pleaser"
    ],
    "allergens": [
      "Wheat"
    ],
    "dietary": [
      "Vegan",
      "Vegetarian",
      "Dairy-free"
    ],
    "image": "/gallery/salad-prep.webp",
    "photoCredit": {
      "author": "Chef Casey Barella",
      "source": "Driftline",
      "page": ""
    },
    "ingredients": [
      "1 large baguette, sliced on the bias ½ inch thick (24 slices)",
      "¼ cup extra-virgin olive oil (for the bread)",
      "1 clove garlic, halved",
      "1½ lb heirloom cherry tomatoes, mixed colors",
      "3 tbsp extra-virgin olive oil (for the tomatoes)",
      "3 ears sweet corn, kernels cut from the cob (about 2 cups)",
      "1 tbsp extra-virgin olive oil (for the corn)",
      "1 small shallot, minced",
      "1 clove garlic, thinly sliced",
      "1 tsp kosher salt",
      "½ tsp freshly ground black pepper",
      "1 tsp sherry vinegar",
      "1 bunch basil, cut in chiffonade",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Heat the oven to 400°F. Arrange the baguette slices on a rimmed sheet pan, brush both sides with ¼ cup olive oil, and bake until golden and crisp at the edges but with a little give in the center, 10 to 12 minutes, rotating the pan once. While warm, rub the tops lightly with the cut garlic clove.",
      "Heat a 12-inch cast-iron skillet over high heat until it just begins to smoke. Add 3 tbsp olive oil and the cherry tomatoes in a single layer (work in two batches if needed).",
      "Let the tomatoes sit undisturbed for 1 minute, then shake the pan occasionally until the skins blister, char in spots and a few start to burst, 4 to 5 minutes. Tip into a bowl with all their juices.",
      "Return the skillet to high heat with 1 tbsp olive oil. Add the corn kernels in an even layer and cook without stirring until some kernels char and pop, about 2 minutes, then toss and cook 1 minute more.",
      "Lower the heat to medium, add the shallot and sliced garlic, and cook just until fragrant and softened, about 1 minute. Scrape the corn into the bowl with the tomatoes.",
      "Season with the kosher salt, pepper and sherry vinegar and fold gently so most tomatoes stay whole; the burst ones make a light dressing. Let stand 5 minutes, then fold in about half the basil.",
      "To plate: line the crostini up in two or three rows on a large wooden board. Spoon the warm tomato-corn mixture over each toast just before serving so the bread stays crisp, letting a few tomatoes and kernels tumble onto the board. Pile the remaining basil chiffonade over the top, sprinkle with flaky salt, and serve at once."
    ],
    "equipment": [
      "12-inch cast-iron skillet",
      "Rimmed sheet pan",
      "Serrated bread knife",
      "Pastry brush",
      "Large wooden serving board"
    ],
    "storage": "Leftover topping keeps refrigerated up to 2 days (the basil will darken); store crostini airtight at room temperature up to 3 days. Serve the topping at room temperature on re-crisped toasts.",
    "reheating": "",
    "makeAhead": "Day before (commissary): bake and garlic-rub the crostini and store them airtight; cut the corn off the cob and mince the shallot. At the client's home: blister the tomatoes and char the corn up to 1 hour ahead and hold at room temperature; cut the basil and assemble on the board only when guests sit down.",
    "safety": "Wash tomatoes and corn before prepping. Hold the cooked tomato and corn topping no more than 2 hours at room temperature, then refrigerate or discard.",
    "chefNotes": "The skillet must be ripping hot before the tomatoes go in; a cooler pan stews them instead of blistering the skins. Cut the basil at the last minute with a very sharp knife so it stays bright green."
  },
  {
    "id": 106,
    "slug": "roasted-butternut-squash-soup-with-brown-butter",
    "side": "private-chef",
    "title": "Roasted Butternut Squash Soup with Brown Butter",
    "category": "Soups & Salads",
    "description": "Silky roasted butternut squash soup finished at the table with nutty brown butter, crisp sage and toasted Oregon hazelnuts.",
    "servings": 6,
    "yieldNote": "Serves 6 (about 1¼ cups each)",
    "active": 40,
    "total": 95,
    "tags": [
      "Make-ahead",
      "Seasonal: fall",
      "Vegetarian"
    ],
    "allergens": [
      "Milk",
      "Tree nuts"
    ],
    "dietary": [
      "Vegetarian",
      "Gluten-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "1 large butternut squash (about 3½ lb), peeled, seeded and cut into 1-inch chunks",
      "2 tbsp extra-virgin olive oil",
      "1 tsp kosher salt (for roasting)",
      "2 tbsp unsalted butter (for the soup)",
      "1 medium yellow onion, diced",
      "2 cloves garlic, smashed",
      "1 tsp chopped fresh sage",
      "5 cups low-sodium gluten-free vegetable stock",
      "½ cup heavy cream",
      "1 tsp kosher salt (for the soup)",
      "⅛ tsp freshly grated nutmeg",
      "1 tsp sherry vinegar",
      "½ cup hazelnuts",
      "6 tbsp unsalted butter (for the brown butter)",
      "12 fresh sage leaves",
      "2 tbsp crème fraîche",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Heat the oven to 425°F. Toss the squash with the olive oil and 1 tsp salt and spread in a single layer on two rimmed sheet pans lined with parchment. Roast, flipping once halfway, until tender and well caramelized at the edges, 35 to 40 minutes.",
      "While the squash roasts, toast the hazelnuts on a small sheet pan in the same oven until the skins crack and the nuts are golden inside, 8 to 10 minutes. Rub them in a towel to remove most of the skins, cool, and coarsely chop.",
      "Melt 2 tbsp butter in a heavy 5- to 6-quart Dutch oven over medium heat. Add the onion and cook, stirring, until soft and translucent but not browned, 6 to 8 minutes. Add the garlic and chopped sage and cook 1 minute.",
      "Add the roasted squash, scraping any browned bits from the parchment into the pot, and the stock. Bring to a simmer, then cook gently, partially covered, for 15 minutes to marry the flavors.",
      "Purée in batches in a blender (fill no more than halfway and vent the lid under a towel) until completely smooth, about 1 minute per batch. For restaurant silkiness, pass it through a fine-mesh strainer.",
      "Return the soup to the pot and stir in the cream, 1 tsp salt, nutmeg and sherry vinegar. It should coat a spoon but still pour easily; thin with a splash of stock if needed. Taste and adjust salt. Hold hot, at 135°F or above, over low heat.",
      "Make the brown butter just before serving: melt 6 tbsp butter in a small light-colored saucepan over medium heat. Swirl as it foams; when the foam subsides and the milk solids turn golden brown and smell nutty, 4 to 5 minutes, add the sage leaves and fry until crisp, about 30 seconds. Lift the leaves onto a paper towel and pour the brown butter into a small warm pitcher.",
      "Stir the crème fraîche with 1 tsp water so it drizzles easily.",
      "To plate: ladle about 1¼ cups soup into each warm shallow bowl. Drizzle a thin ring of crème fraîche, spoon about 2 tsp brown butter (with its toasted solids) over the surface, scatter chopped hazelnuts in a small pile slightly off center, lean two crisp sage leaves against them, and finish with a pinch of flaky salt."
    ],
    "equipment": [
      "Two rimmed sheet pans",
      "5- to 6-quart Dutch oven",
      "High-speed blender",
      "Fine-mesh strainer",
      "Small light-colored saucepan",
      "Ladle"
    ],
    "storage": "Cool soup to 70°F within 2 hours and 41°F within 4 more; refrigerate up to 4 days or freeze (before adding cream) up to 3 months. Reheat to 165°F. Store hazelnuts airtight at room temperature.",
    "reheating": "",
    "makeAhead": "One to two days ahead (commissary): roast the squash, make and purée the soup (hold back the cream), chill quickly in an ice bath and pack in quart containers; toast and chop the hazelnuts. At the client's home: reheat the soup gently to 165°F, stir in the cream, fry the sage and brown the butter in the last 10 minutes, and plate.",
    "safety": "Reheat soup made ahead to 165°F, then hold at 135°F or above for service. Cool leftovers to 70°F within 2 hours and to 41°F within 4 more. Hazelnuts are a tree nut; keep garnishes separate for allergic guests.",
    "chefNotes": "Roasting rather than simmering the squash is where the depth comes from, so push it until the edges are truly brown. Brown butter goes from golden to burnt in seconds; use a light-colored pan so you can see the solids."
  },
  {
    "id": 107,
    "slug": "roasted-beet-and-citrus-salad-with-goat-cheese-and-hazelnuts",
    "side": "private-chef",
    "title": "Roasted Beet and Citrus Salad with Goat Cheese and Hazelnuts",
    "category": "Soups & Salads",
    "description": "Jewel-toned roasted beets and juicy citrus segments with creamy goat cheese, toasted hazelnuts and a bright shallot-citrus vinaigrette.",
    "servings": 6,
    "yieldNote": "Serves 6",
    "active": 40,
    "total": 120,
    "tags": [
      "Make-ahead",
      "Seasonal: winter",
      "Gluten-free"
    ],
    "allergens": [
      "Milk",
      "Tree nuts"
    ],
    "dietary": [
      "Vegetarian",
      "Gluten-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "1 lb small red beets, scrubbed and trimmed",
      "1 lb small golden beets, scrubbed and trimmed",
      "1 tbsp extra-virgin olive oil (for roasting)",
      "½ tsp kosher salt (for roasting)",
      "1 tbsp sherry vinegar (for the beets)",
      "2 navel oranges",
      "2 blood oranges",
      "1 ruby red grapefruit",
      "1 small shallot, finely minced",
      "1 tbsp sherry vinegar (for the vinaigrette)",
      "1 tsp Dijon mustard",
      "1 tsp honey",
      "½ tsp kosher salt (for the vinaigrette)",
      "¼ tsp freshly ground black pepper",
      "⅓ cup extra-virgin olive oil (for the vinaigrette)",
      "½ cup hazelnuts",
      "5 oz fresh goat cheese, well chilled",
      "2 oz baby arugula",
      "1 bunch mint, leaves picked",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Heat the oven to 400°F. Keeping red and golden beets separate so the colors don't bleed, toss each batch with half the olive oil and roasting salt and wrap in its own foil packet. Roast on a sheet pan until a paring knife slides into the largest beet with no resistance, 45 to 60 minutes.",
      "Toast the hazelnuts on a small pan in the same oven until fragrant and golden, 8 to 10 minutes. Rub off the skins in a towel and roughly chop.",
      "When the beets are cool enough to handle, rub off the skins with paper towels (wear gloves for the red ones). Cut into ½-inch wedges, keeping colors in separate bowls, and toss each with half of the 1 tbsp sherry vinegar. Marinate at least 20 minutes.",
      "Supreme the citrus: cut the top and bottom off each fruit, then slice away the peel and white pith following the curve of the fruit. Working over a bowl, cut between the membranes to release the segments. Squeeze the membranes to collect the juice; reserve 3 tbsp.",
      "Make the vinaigrette: combine the shallot, 3 tbsp reserved citrus juice and 1 tbsp sherry vinegar in a small bowl and let sit 10 minutes to soften the shallot. Whisk in the Dijon, honey, salt and pepper, then stream in the ⅓ cup olive oil while whisking until emulsified.",
      "Crumble the cold goat cheese into large, irregular pieces with your fingers; it holds its shape best straight from the refrigerator.",
      "Just before plating, toss the arugula with 1 tbsp vinaigrette. Dress the golden beets and then the red beets separately with about 1 tbsp vinaigrette each.",
      "To plate: on each chilled plate, arrange golden beets, then red beets, then citrus segments in a loose, overlapping arc, alternating colors. Tuck a small handful of arugula into the gaps, dot with 4 or 5 pieces of goat cheese, and scatter hazelnuts and torn mint over the top. Spoon a little more vinaigrette around the plate and finish with flaky salt."
    ],
    "equipment": [
      "Rimmed sheet pan and aluminum foil",
      "Sharp paring knife",
      "Chef's knife and cutting board",
      "Mixing bowls",
      "Small whisk",
      "Disposable gloves"
    ],
    "storage": "Dressed salad doesn't keep. Refrigerate leftover roasted beets and citrus separately, covered, up to 4 days; the vinaigrette keeps 5 days.",
    "reheating": "",
    "makeAhead": "One to two days ahead (commissary): roast, peel and cut the beets and marinate them in separate containers; toast and chop the hazelnuts; make the vinaigrette. Morning of: supreme the citrus and refrigerate in its juice. At the client's home: bring beets to cool room temperature for 20 minutes, dress, and plate just before the course.",
    "safety": "Keep cut citrus, cooked beets and goat cheese refrigerated at 41°F or below until plating. Cool roasted beets to 70°F within 2 hours and to 41°F within 4 more. Hazelnuts are a tree nut; plate without them for allergic guests.",
    "chefNotes": "Always plate golden beets before red ones, and dress them in separate bowls, or everything turns pink. Salt the beets well: they need more than you think to taste vibrant."
  },
  {
    "id": 108,
    "slug": "little-gem-caesar-with-anchovy-dressing-and-garlic-croutons",
    "side": "private-chef",
    "title": "Little Gem Caesar with Anchovy Dressing and Garlic Croutons",
    "category": "Soups & Salads",
    "description": "Crisp Little Gem hearts coated in a punchy anchovy-Parmesan dressing, with crunchy garlic croutons and plenty of shaved Parmigiano.",
    "servings": 6,
    "yieldNote": "Serves 6",
    "active": 35,
    "total": 45,
    "tags": [
      "Make-ahead",
      "Classic",
      "Crowd-pleaser"
    ],
    "allergens": [
      "Egg",
      "Fish",
      "Milk",
      "Wheat"
    ],
    "dietary": [],
    "image": "/cookbook/pc/little-gem-caesar-with-anchovy-dressing-and-garlic-croutons.webp",
    "photoCredit": {
      "author": "damla selen demir",
      "source": "Pexels",
      "page": "https://www.pexels.com/photo/fresh-caesar-salad-with-parmesan-cheese-33158331/"
    },
    "ingredients": [
      "6 oz day-old ciabatta, torn into ¾-inch pieces",
      "3 tbsp extra-virgin olive oil (for the croutons)",
      "1 clove garlic, finely grated (for the croutons)",
      "¼ tsp kosher salt (for the croutons)",
      "2 large pasteurized egg yolks",
      "6 fillets oil-packed anchovy, patted dry and minced",
      "2 cloves garlic, finely grated (for the dressing)",
      "2 tbsp lemon juice",
      "1 tsp Dijon mustard",
      "½ cup neutral oil, such as grapeseed",
      "¼ cup extra-virgin olive oil (for the dressing)",
      "1 oz Parmigiano-Reggiano, finely grated (for the dressing)",
      "½ tsp freshly ground black pepper",
      "¼ tsp kosher salt (for the dressing)",
      "1 tbsp cold water",
      "6 heads Little Gem lettuce, outer leaves removed",
      "2 oz Parmigiano-Reggiano, shaved (for garnish)",
      "1 lemon, cut into 6 wedges"
    ],
    "directions": [
      "Heat the oven to 375°F. Toss the torn ciabatta with 3 tbsp olive oil, the grated garlic and ¼ tsp salt on a rimmed sheet pan. Bake, tossing once, until golden and crunchy all the way through, 12 to 15 minutes. Cool on the pan.",
      "Make the dressing with pasteurized-in-shell egg yolks (heat-treated eggs sold in cartons of whole eggs), so the yolks are not raw. In a medium bowl, mash the anchovies and garlic into a paste with a fork, then whisk in the yolks, lemon juice and Dijon.",
      "Set the bowl on a damp towel. Whisking constantly, add the neutral oil a few drops at a time until the dressing starts to thicken, then in a thin stream. Whisk in the olive oil the same way; it will be thick like mayonnaise.",
      "Whisk in the grated Parmigiano, pepper, salt and 1 tbsp cold water to loosen to a thick but pourable consistency. Taste: it should be boldly salty and tangy. Refrigerate until needed.",
      "Separate the Little Gem leaves, keeping the small inner hearts whole or halved lengthwise. Wash in cold water, spin completely dry, and chill in a towel-lined container; dry leaves let the dressing cling.",
      "Just before serving, put the leaves in a large chilled bowl, add about ⅔ cup dressing, and toss with your hands, gently massaging so every leaf is coated.",
      "Add half the croutons and toss once more so they pick up some dressing.",
      "To plate: on each chilled plate, stack the leaves upright and slightly overlapping, cupped sides up, building height with the hearts in the center. Tuck the remaining croutons among the leaves, cover generously with shaved Parmigiano and a few grinds of pepper, and set a lemon wedge on the side. Pass extra dressing."
    ],
    "equipment": [
      "Rimmed sheet pan",
      "Salad spinner",
      "Medium mixing bowl and balloon whisk",
      "Microplane",
      "Vegetable peeler for shaving cheese",
      "Large chilled salad bowl"
    ],
    "storage": "Dressed salad doesn't keep. Leftover dressing keeps 3 days refrigerated at 41°F or below; croutons keep airtight at room temperature for 5 days.",
    "reheating": "",
    "makeAhead": "Day before (commissary): bake the croutons and store airtight; make the dressing and refrigerate in a sealed container; shave the Parmigiano. Morning of: wash, dry and chill the lettuce in towels. At the client's home: whisk the dressing to recombine, toss and plate within minutes of serving.",
    "safety": "The dressing is made with pasteurized-in-shell egg yolks, so it contains no raw egg. If pasteurized eggs are unavailable, whisk the yolks with the lemon juice in a bowl over barely simmering water until the mixture reaches 160°F and thickens, then cool before adding oil. Keep the dressing at 41°F or below and discard after 3 days.",
    "chefNotes": "Mince anchovies on the board with the garlic and a pinch of salt before whisking so they dissolve completely and no one bites into a fishy chunk. Tear the bread rather than cubing it; the rough edges get crunchier."
  },
  {
    "id": 109,
    "slug": "pear-arugula-and-blue-cheese-salad-with-candied-walnuts",
    "side": "private-chef",
    "title": "Pear, Arugula and Blue Cheese Salad with Candied Walnuts",
    "category": "Soups & Salads",
    "description": "Peppery arugula and crisp endive with ripe Oregon pears, creamy blue cheese and crackly candied walnuts in a Champagne-honey vinaigrette.",
    "servings": 6,
    "yieldNote": "Serves 6",
    "active": 30,
    "total": 45,
    "tags": [
      "Seasonal: fall",
      "Gluten-free",
      "Pacific Northwest"
    ],
    "allergens": [
      "Milk",
      "Tree nuts"
    ],
    "dietary": [
      "Vegetarian",
      "Gluten-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "1 cup walnut halves",
      "¼ cup granulated sugar",
      "1 tbsp unsalted butter",
      "¼ tsp kosher salt (for the walnuts)",
      "⅛ tsp cayenne pepper",
      "1 small shallot, finely minced",
      "2 tbsp Champagne vinegar",
      "1 tsp Dijon mustard",
      "2 tsp honey",
      "½ tsp kosher salt (for the vinaigrette)",
      "¼ tsp freshly ground black pepper",
      "⅓ cup extra-virgin olive oil",
      "3 ripe but firm Comice pears",
      "1 tbsp lemon juice",
      "5 oz baby arugula",
      "2 heads Belgian endive, leaves separated",
      "4 oz Oregon blue cheese, crumbled",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Line a sheet pan with parchment. Toast the walnuts in a 10-inch nonstick skillet over medium heat, stirring, until fragrant, about 4 minutes.",
      "Add the sugar, butter, ¼ tsp salt and cayenne. Stir constantly as the sugar melts and turns a light amber that coats the nuts, 3 to 5 minutes. Immediately spread the walnuts on the parchment and separate them with two forks. Cool completely, about 15 minutes, until crisp; break up any clusters.",
      "Make the vinaigrette: combine the shallot and Champagne vinegar and let stand 10 minutes. Whisk in the Dijon, honey, ½ tsp salt and pepper, then stream in the olive oil while whisking until emulsified.",
      "Just before plating, quarter and core the pears and cut each quarter into 3 thin wedges. Toss gently with the lemon juice to keep them from browning.",
      "Cut the larger endive leaves in half lengthwise and leave small ones whole.",
      "In a large chilled bowl, toss the arugula and endive with about ¼ cup vinaigrette until just coated; the leaves should glisten, not drip.",
      "Add half the pears and half the blue cheese and toss once more, gently.",
      "To plate: mound the greens high in the center of each chilled plate. Fan 3 or 4 of the remaining pear wedges against one side of the mound, tuck in the rest of the blue cheese in large crumbles, and scatter 6 to 8 candied walnuts over the top. Drizzle a few drops of vinaigrette on the pears and finish with a pinch of flaky salt."
    ],
    "equipment": [
      "10-inch nonstick skillet",
      "Rimmed sheet pan with parchment",
      "Small whisk and bowl",
      "Chef's knife and cutting board",
      "Large chilled salad bowl"
    ],
    "storage": "Dressed salad doesn't keep. Candied walnuts keep airtight at room temperature up to 2 weeks; vinaigrette keeps 1 week refrigerated.",
    "reheating": "",
    "makeAhead": "Up to 1 week ahead (commissary): candy the walnuts and store airtight with a paper towel. Day before: make the vinaigrette, crumble the blue cheese, and wash and dry the arugula. At the client's home: slice the pears no more than 30 minutes before serving, then dress and plate to order.",
    "safety": "Keep blue cheese and washed greens refrigerated at 41°F or below until plating. Walnuts are a tree nut; the candying pan and parchment should not touch other guests' plates if someone is allergic.",
    "chefNotes": "Pull the walnuts the moment the sugar turns amber; it goes bitter fast. Choose pears that give slightly at the neck but are still firm, so they slice cleanly."
  },
  {
    "id": 110,
    "slug": "seared-sea-scallops-with-beurre-blanc-and-sweet-pea-pur-e",
    "side": "private-chef",
    "title": "Seared Sea Scallops with Beurre Blanc and Sweet Pea Purée",
    "category": "Mains",
    "description": "Golden, caramelized sea scallops on bright mint-pea purée with a silky white-wine butter sauce and glossy Pinot Noir dots.",
    "servings": 6,
    "yieldNote": "Serves 6 (4 scallops each)",
    "active": 60,
    "total": 75,
    "tags": [
      "Seafood",
      "Elegant",
      "Seasonal: spring"
    ],
    "allergens": [
      "Shellfish",
      "Milk"
    ],
    "dietary": [
      "Gluten-free"
    ],
    "image": "/gallery/scallops.webp",
    "photoCredit": {
      "author": "Chef Casey Barella",
      "source": "Driftline",
      "page": ""
    },
    "ingredients": [
      "24 dry-packed U-10 sea scallops, side muscle removed",
      "1 tsp kosher salt, divided",
      "½ tsp freshly ground white pepper",
      "3 tbsp grapeseed oil",
      "1 lb frozen sweet peas (for the purée)",
      "2 tbsp unsalted butter (for the purée)",
      "1 medium shallot, minced (for the purée)",
      "¼ cup heavy cream (for the purée)",
      "8 fresh mint leaves (for the purée)",
      "½ cup dry white wine (for the sauce)",
      "3 tbsp white wine vinegar (for the sauce)",
      "1 medium shallot, finely minced (for the sauce)",
      "2 tbsp heavy cream (for the sauce)",
      "12 tbsp cold unsalted butter, cut into ½-inch cubes (for the sauce)",
      "1 tsp fresh lemon juice (for the sauce)",
      "1 cup Pinot Noir (for the reduction)",
      "2 tbsp granulated sugar (for the reduction)",
      "1 oz microgreens, for garnish",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Make the Pinot Noir reduction: simmer the wine and sugar in a small saucepan over medium heat until it reduces to about 3 tablespoons and coats a spoon like thin syrup, 12 to 15 minutes. Cool; it thickens as it cools. Transfer to a squeeze bottle.",
      "Make the pea purée: melt the 2 tablespoons butter in a medium saucepan over medium heat and sweat the shallot until soft, about 2 minutes. Add the peas and ¼ cup water, cover, and cook until the peas are just tender and still bright green, 3 to 4 minutes.",
      "Transfer peas and their liquid to a blender with the cream, mint, and ¼ teaspoon kosher salt. Blend on high until completely smooth, about 1 minute, adding a splash of water if needed to reach a thick, spoonable consistency. Pass through a fine-mesh sieve for a restaurant finish and keep warm, covered.",
      "Pat the scallops very dry on paper towels, then lay them on a towel-lined sheet pan and refrigerate uncovered for at least 30 minutes so the surfaces dry further; this is what gives a deep crust.",
      "Start the beurre blanc: in a small, heavy saucepan combine the wine, vinegar, and minced shallot. Simmer over medium heat until only about 2 tablespoons of liquid remain, 6 to 8 minutes. Add the 2 tablespoons cream and bring back to a bare simmer.",
      "Lower the heat to low and whisk in the cold butter a few cubes at a time, adding more only as each addition turns creamy rather than melting clear. Keep the sauce between 120°F and 140°F; if it gets hotter it will break. Season with ¼ teaspoon kosher salt and the lemon juice, strain if you want it perfectly smooth, and hold in a warmed thermos or a bowl over warm (not simmering) water.",
      "Season the scallops on both sides with the remaining ½ teaspoon kosher salt and the white pepper. Heat a 12-inch cast-iron or carbon-steel skillet over high heat until the oil shimmers and just begins to smoke, using 1½ tablespoons oil per batch.",
      "Sear the scallops in two batches of 12, flat side down with space between each, without moving them until a deep golden crust forms, 1½ to 2 minutes. Flip and cook 30 to 60 seconds more, until the sides are opaque but the center is still slightly translucent (about 115°F to 120°F for medium-rare). Transfer to a warm plate; wipe the pan and repeat.",
      "Plate on warm white plates: swoosh 2 heaped tablespoons of pea purée across the center, arrange 4 scallops seared side up along it, and spoon about 2 tablespoons of beurre blanc around (not over) the scallops. Dot 5 or 6 small beads of Pinot Noir reduction into the sauce, top each scallop with a small tuft of microgreens and a few flakes of sea salt, and serve immediately."
    ],
    "equipment": [
      "12-inch cast-iron or carbon-steel skillet",
      "Small heavy saucepan",
      "Blender",
      "Fine-mesh sieve",
      "Squeeze bottle",
      "Instant-read thermometer"
    ],
    "storage": "Seared scallops are best eaten immediately; refrigerate leftovers within 2 hours and eat within 1 day (the texture will firm up). Beurre blanc does not reheat well; discard leftovers. Pea purée keeps 2 days refrigerated.",
    "reheating": "",
    "makeAhead": "Day before: make the Pinot Noir reduction and the pea purée (cool quickly, refrigerate in a sealed container, press plastic onto the surface to keep it green). At the client's home: dry the scallops on towels as soon as you arrive, reduce the wine-vinegar base up to 2 hours ahead, then mount the butter 20 minutes before plating and hold it in a warm thermos. Reheat the purée gently and sear the scallops to order.",
    "safety": "Scallops are cooked until the exterior is seared and the flesh is mostly opaque; FDA guidance for shellfish is to cook until the flesh is opaque (145°F). Consumer advisory: consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness. Buy scallops from a reputable source and keep them at or below 38°F until cooking.",
    "chefNotes": "Buy dry-packed scallops; wet (phosphate-treated) scallops weep liquid and will steam instead of sear. Kosher salt quantities assume Diamond Crystal; use about half as much Morton."
  },
  {
    "id": 111,
    "slug": "braised-short-ribs-with-creamy-polenta-and-gremolata",
    "side": "private-chef",
    "title": "Braised Short Ribs with Creamy Polenta and Gremolata",
    "category": "Mains",
    "description": "Red wine–braised short ribs glazed in their own reduced jus, set over soft Parmesan polenta and finished with fresh lemon-parsley gremolata.",
    "servings": 6,
    "yieldNote": "Serves 6",
    "active": 60,
    "total": 270,
    "tags": [
      "Make-ahead",
      "Comfort food",
      "Seasonal: fall"
    ],
    "allergens": [
      "Milk"
    ],
    "dietary": [
      "Gluten-free"
    ],
    "image": "/gallery/shortrib.webp",
    "photoCredit": {
      "author": "Chef Casey Barella",
      "source": "Driftline",
      "page": ""
    },
    "ingredients": [
      "6 lb bone-in beef short ribs (English cut, about 2 inches thick)",
      "2 tbsp kosher salt, divided",
      "2 tsp freshly ground black pepper",
      "3 tbsp grapeseed oil",
      "2 medium yellow onions, diced",
      "2 medium carrots, diced",
      "2 celery ribs, diced",
      "6 cloves garlic, smashed",
      "2 tbsp tomato paste",
      "3 cups dry red wine",
      "3 cups low-sodium beef stock (gluten-free)",
      "4 sprigs fresh thyme",
      "2 bay leaves",
      "1 tbsp red wine vinegar",
      "1½ cups coarse-ground polenta (for the polenta)",
      "4 cups water (for the polenta)",
      "2 cups whole milk (for the polenta)",
      "3 tbsp unsalted butter (for the polenta)",
      "2 oz Parmigiano-Reggiano, finely grated (for the polenta)",
      "1 bunch flat-leaf parsley, leaves finely chopped (for the gremolata)",
      "1 medium lemon, zested (for the gremolata)",
      "1 clove garlic, grated (for the gremolata)",
      "1 tbsp extra-virgin olive oil (for the gremolata)",
      "½ oz micro red amaranth, for garnish"
    ],
    "directions": [
      "Season the short ribs all over with 1½ tablespoons kosher salt and the pepper. For best results do this the day before and refrigerate uncovered on a rack; otherwise let them sit 45 minutes at room temperature. Heat the oven to 300°F.",
      "Heat the oil in a 7-quart Dutch oven over medium-high heat. Brown the ribs in batches on all meaty sides until deeply mahogany, 8 to 10 minutes per batch, without crowding. Move to a sheet pan and pour off all but 2 tablespoons of fat.",
      "Lower the heat to medium, add the onions, carrots, celery, and garlic, and cook, scraping the fond, until softened and lightly browned, about 8 minutes. Stir in the tomato paste and cook until it darkens to brick red, about 2 minutes.",
      "Pour in the wine, bring to a boil, and reduce by half, about 10 minutes. Add the stock, thyme, and bay leaves, then nestle the ribs back in bone side up with any juices; the liquid should come about three-quarters of the way up the meat.",
      "Bring to a simmer, cover, and braise in the oven until a paring knife slides into the meat with no resistance and the bones pull out cleanly, 3 to 3½ hours. Turn the ribs once halfway through.",
      "Carefully lift the ribs onto a sheet pan, slip out the bones and any connective tissue, and trim each piece into a neat rectangle. Strain the braising liquid through a fine-mesh sieve, pressing on the vegetables, then skim off the fat (a fat separator makes this fast).",
      "Boil the strained liquid in a wide saucepan until reduced to about 1½ cups and it lightly coats a spoon, 15 to 20 minutes. Stir in the vinegar and season with salt if needed. Return the ribs to a snug baking dish, spoon over half the jus, and glaze in a 400°F oven for 8 to 10 minutes, basting twice, until shiny and hot through (at least 165°F if reheated).",
      "Meanwhile make the polenta: bring the water, milk, and remaining ½ tablespoon kosher salt to a simmer in a heavy 4-quart saucepan. Whisk in the polenta in a slow stream, then cook over low heat, stirring every few minutes and scraping the corners, until the grains are tender and creamy, 35 to 45 minutes. Stir in the butter and Parmesan and loosen with hot water or milk to a soft, pourable consistency.",
      "Make the gremolata just before serving: mix the parsley, lemon zest, grated garlic, and olive oil with a pinch of salt.",
      "Plate in warm shallow bowls: spoon about ¾ cup polenta into the center and tap the bowl so it spreads into a round. Set one glazed short rib on top, spoon 2 tablespoons of hot jus over and around, scatter a teaspoon of gremolata across the rib, and crown it with a small pinch of micro red amaranth."
    ],
    "equipment": [
      "7-quart Dutch oven",
      "Heavy 4-quart saucepan",
      "Fine-mesh sieve",
      "Fat separator",
      "Sheet pan",
      "Instant-read thermometer"
    ],
    "storage": "Refrigerate leftover short ribs in their jus within 2 hours for up to 4 days; they freeze well for 3 months. Leftover polenta sets firm; refrigerate up to 3 days and reheat with a splash of milk, or slice and pan-fry.",
    "reheating": "",
    "makeAhead": "Braise one or two days ahead: this dish improves overnight. Cool the ribs in the strained liquid (to 70°F within 2 hours, 41°F within 4 more), refrigerate, then lift off the solidified fat, bone and trim the cold ribs neatly, and reduce the jus. Make the gremolata components (chop parsley, zest lemon) the morning of. At the client's home: glaze-reheat the ribs covered at 325°F for 25 minutes then uncovered at 400°F with jus to 165°F, and cook the polenta fresh (it holds 30 minutes covered with a film of milk on top).",
    "safety": "Braised short ribs are cooked far beyond the 145°F whole-cut minimum; reheated ribs and jus must reach 165°F. Cool braises quickly: to 70°F within 2 hours and to 41°F within the next 4 hours, using shallow pans or an ice bath.",
    "chefNotes": "Ask the butcher for single-bone English-cut ribs about 2 inches thick so each guest gets one clean rectangular portion. Salt amounts assume Diamond Crystal kosher salt; halve them for Morton."
  },
  {
    "id": 112,
    "slug": "roasted-king-salmon-saffron-orzo-and-balsamic-glaze",
    "side": "private-chef",
    "title": "Roasted King Salmon, Saffron Orzo and Balsamic Glaze",
    "category": "Mains",
    "description": "Buttery roasted king salmon over creamy golden saffron orzo with roasted asparagus and broccolini, finished with dots of sweet balsamic glaze.",
    "servings": 6,
    "yieldNote": "Serves 6",
    "active": 50,
    "total": 70,
    "tags": [
      "Seafood",
      "Pacific Northwest",
      "Seasonal: spring"
    ],
    "allergens": [
      "Fish",
      "Wheat",
      "Milk"
    ],
    "dietary": [],
    "image": "/gallery/salmon.webp",
    "photoCredit": {
      "author": "Chef Casey Barella",
      "source": "Driftline",
      "page": ""
    },
    "ingredients": [
      "6 fillets skin-on king salmon (6 oz each), pin bones removed",
      "1¾ tsp kosher salt, divided",
      "¾ tsp freshly ground black pepper, divided",
      "3 tbsp extra-virgin olive oil, divided",
      "1 bunch asparagus, woody ends snapped off",
      "1 bunch broccolini, stems trimmed",
      "1½ cups orzo (for the orzo)",
      "½ tsp saffron threads (for the orzo)",
      "4 cups low-sodium chicken stock, kept hot (for the orzo)",
      "2 tbsp unsalted butter, divided (for the orzo)",
      "1 medium shallot, minced (for the orzo)",
      "¼ cup dry white wine (for the orzo)",
      "1 oz Parmigiano-Reggiano, finely grated (for the orzo)",
      "1 tsp lemon zest (for the orzo)",
      "1 cup balsamic vinegar (for the glaze)",
      "1 tbsp honey (for the glaze)",
      "1 tbsp chopped chives, for garnish"
    ],
    "directions": [
      "Make the balsamic glaze: simmer the vinegar and honey in a small saucepan over medium-low heat until reduced to about ⅓ cup and it coats the back of a spoon, 15 to 20 minutes. Watch closely at the end; it thickens further as it cools. Transfer to a squeeze bottle.",
      "Heat the oven to 425°F with racks in the upper and lower thirds. Crumble the saffron into ½ cup of the hot stock and let it steep at least 10 minutes.",
      "Pat the salmon dry and season with 1 teaspoon kosher salt and ½ teaspoon pepper. Toss the asparagus and broccolini on a sheet pan with 1½ tablespoons olive oil and ½ teaspoon salt, spreading them in one layer.",
      "Start the orzo: melt 1 tablespoon butter in a 3-quart saucepan over medium heat. Add the orzo and toast, stirring, until it smells nutty and some grains turn golden, about 3 minutes. Add the shallot and cook 1 minute, then pour in the wine and stir until absorbed.",
      "Add the saffron stock and 1 cup of the remaining hot stock and simmer, stirring often, adding more stock ½ cup at a time as it is absorbed, until the orzo is tender with a slight bite and loose and creamy, 10 to 12 minutes. You may not need all the stock.",
      "While the orzo cooks, set the salmon skin side down on a parchment-lined sheet pan, brush with the remaining 1½ tablespoons olive oil, and roast on the upper rack with the vegetables on the lower rack. Roast the vegetables until tender-crisp with browned tips, 8 to 10 minutes.",
      "Roast the salmon until the thickest part flakes under gentle pressure and registers 125°F for moist, medium flesh, 9 to 12 minutes depending on thickness; rest 3 minutes, when carryover brings it up a few degrees.",
      "Finish the orzo off the heat with the remaining 1 tablespoon butter, the Parmesan, lemon zest, remaining ¼ teaspoon salt, and ¼ teaspoon pepper. It should slowly spread when spooned; loosen with a splash of stock if needed.",
      "Plate on warm plates: spoon about ⅔ cup orzo slightly off-center and let it settle, lean 3 asparagus spears and 2 broccolini stalks across one side, and set the salmon on top, skin side down. Dot 6 to 8 beads of balsamic glaze around the plate, scatter chives over the fish, and serve at once."
    ],
    "equipment": [
      "2 rimmed sheet pans",
      "3-quart saucepan",
      "Small saucepan",
      "Squeeze bottle",
      "Parchment paper",
      "Instant-read thermometer"
    ],
    "storage": "Refrigerate leftover salmon and orzo separately within 2 hours for up to 2 days. Salmon is best eaten cold over greens rather than reheated; the orzo reheats with a splash of stock.",
    "reheating": "",
    "makeAhead": "Day before: make the balsamic glaze (keeps a week at room temperature), trim the asparagus and broccolini, mince the shallot, and portion the salmon, then refrigerate everything covered. At the client's home: steep the saffron, roast the vegetables and salmon, and cook the orzo during the final 20 minutes so it stays loose and creamy.",
    "safety": "FDA recommends cooking fish to 145°F or until the flesh is opaque and flakes easily; this recipe pulls king salmon at about 125°F for a moist, medium center. Consumer advisory: consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness. Cook to 145°F for guests who are pregnant, elderly, or immunocompromised.",
    "chefNotes": "King salmon is rich and forgiving; if using leaner coho or sockeye, pull it 2 to 3 minutes earlier. Salt assumes Diamond Crystal kosher salt."
  },
  {
    "id": 113,
    "slug": "pan-roasted-halibut-with-chanterelles-and-brown-butter",
    "side": "private-chef",
    "title": "Pan-Roasted Halibut with Chanterelles and Brown Butter",
    "category": "Mains",
    "description": "Thick Pacific halibut seared golden and basted with thyme butter, served over sautéed chanterelles with a nutty lemon–brown butter sauce.",
    "servings": 6,
    "yieldNote": "Serves 6",
    "active": 40,
    "total": 50,
    "tags": [
      "Seafood",
      "Pacific Northwest",
      "Seasonal: fall"
    ],
    "allergens": [
      "Fish",
      "Milk"
    ],
    "dietary": [
      "Gluten-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "6 fillets skinless Pacific halibut (6 oz each, about 1 inch thick)",
      "1¾ tsp kosher salt, divided",
      "½ tsp freshly ground white pepper",
      "3 tbsp grapeseed oil, divided",
      "4 tbsp unsalted butter (for basting)",
      "4 sprigs fresh thyme",
      "2 cloves garlic, smashed",
      "1 lb fresh chanterelle mushrooms, cleaned and torn into bite-size pieces",
      "1 medium shallot, minced",
      "1 tbsp fresh thyme leaves",
      "2 tbsp dry sherry",
      "6 tbsp unsalted butter (for the brown butter)",
      "1½ tbsp fresh lemon juice",
      "2 tbsp chopped chives",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Heat the oven to 400°F. Pat the halibut very dry, season all over with 1 teaspoon kosher salt and the white pepper, and let sit 15 minutes while you prep.",
      "Cook the chanterelles: heat a 12-inch skillet over medium-high heat and add the mushrooms to the dry pan. Cook, stirring occasionally, until they release their liquid and it evaporates, 5 to 7 minutes.",
      "Add 1 tablespoon oil, the shallot, and thyme leaves to the mushrooms and sauté until the chanterelles are golden at the edges, about 4 minutes. Deglaze with the sherry, season with ½ teaspoon kosher salt, and keep warm.",
      "Sear the fish in two 12-inch ovenproof skillets, or one at a time: heat 1 tablespoon oil per pan over medium-high until shimmering. Lay in 3 fillets, presentation side down, and cook without moving until deeply golden, 3 to 4 minutes.",
      "Flip the fillets, add 2 tablespoons basting butter, 2 thyme sprigs, and 1 garlic clove to each pan, and move to the oven for 3 to 5 minutes, until the center is opaque and a thin skewer slides in with no resistance (about 130°F to 135°F; carryover finishes it).",
      "Return the pans to medium heat briefly and spoon the foaming butter over the fish 5 or 6 times. Move the fillets to a warm plate.",
      "Make the brown butter: melt the 6 tablespoons butter in a small light-colored saucepan over medium heat, swirling, until the milk solids turn hazelnut brown and it smells toasty, 4 to 5 minutes. Immediately take it off the heat, add the lemon juice (it will sputter), ¼ teaspoon kosher salt, and the chives.",
      "Plate in warm shallow bowls: make a bed of chanterelles in the center, set a halibut fillet golden side up on top, and spoon about 1 tablespoon brown butter over the fish and mushrooms, letting the browned solids fall onto the fillet. Finish with a few flakes of sea salt and serve right away."
    ],
    "equipment": [
      "Two 12-inch ovenproof skillets",
      "Small light-colored saucepan",
      "Fish spatula",
      "Instant-read thermometer",
      "Pastry brush for cleaning mushrooms"
    ],
    "storage": "Refrigerate leftover halibut and mushrooms within 2 hours and eat within 1 to 2 days; halibut dries out when reheated, so flake it cold into a salad or warm gently at 275°F.",
    "reheating": "",
    "makeAhead": "Day before: clean and tear the chanterelles (store in a paper bag, not plastic), mince the shallot, pick thyme, and portion the halibut on a paper-towel-lined tray, tightly covered. At the client's home: sauté the chanterelles up to 1 hour ahead and rewarm, then sear and roast the fish and brown the butter in the last 15 minutes.",
    "safety": "Cook fish to 145°F or until the flesh is opaque throughout and separates easily with a fork (FDA). The fish here is pulled when just opaque at about 130°F to 135°F and carryover heat continues cooking it; for guests who are pregnant, elderly, or immunocompromised, cook to 145°F. Consumer advisory: consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness.",
    "chefNotes": "Clean chanterelles with a soft brush or damp towel; if they are very gritty, swish briefly in water and dry-sauté longer. Salt assumes Diamond Crystal kosher salt."
  },
  {
    "id": 114,
    "slug": "hazelnut-crusted-rack-of-lamb-with-pinot-noir-reduction",
    "side": "private-chef",
    "title": "Hazelnut-Crusted Rack of Lamb with Pinot Noir Reduction",
    "category": "Mains",
    "description": "Rosy roasted rack of lamb in a crisp Oregon hazelnut and herb crust, carved into double chops and served with a glossy Pinot Noir sauce.",
    "servings": 6,
    "yieldNote": "Serves 6 (4 ribs each)",
    "active": 45,
    "total": 75,
    "tags": [
      "Pacific Northwest",
      "Elegant",
      "Holiday"
    ],
    "allergens": [
      "Tree nuts",
      "Milk"
    ],
    "dietary": [
      "Gluten-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "3 frenched racks of lamb (8 bones each, about 1½ lb each), fat trimmed to ⅛ inch",
      "2 tsp kosher salt, divided",
      "1 tsp freshly ground black pepper",
      "2 tbsp grapeseed oil",
      "3 tbsp Dijon mustard",
      "1 cup hazelnuts, toasted, skinned and finely chopped (for the crust)",
      "2 tbsp chopped flat-leaf parsley (for the crust)",
      "1 tbsp minced fresh rosemary (for the crust)",
      "2 tsp fresh thyme leaves (for the crust)",
      "1 clove garlic, grated (for the crust)",
      "2 tbsp extra-virgin olive oil (for the crust)",
      "2 medium shallots, minced (for the sauce)",
      "2 cups Oregon Pinot Noir (for the sauce)",
      "2 cups low-sodium beef stock (gluten-free) (for the sauce)",
      "3 sprigs fresh thyme (for the sauce)",
      "1 tsp honey (for the sauce)",
      "3 tbsp cold unsalted butter, cubed (for the sauce)"
    ],
    "directions": [
      "Season the racks all over with 1½ teaspoons kosher salt and the pepper; let them sit at room temperature for 30 minutes. Heat the oven to 425°F.",
      "Make the crust: mix the hazelnuts, parsley, rosemary, thyme leaves, garlic, olive oil, and remaining ½ teaspoon salt in a bowl until it clumps like damp sand when pressed.",
      "Heat the grapeseed oil in a 12-inch skillet over medium-high heat. Sear the racks fat side down until golden, 3 to 4 minutes, then briefly sear the ends and meaty underside, about 1 minute each. Transfer to a rack set in a sheet pan, fat side up, and cool for 5 minutes. Save the skillet for the sauce.",
      "Start the sauce: pour off all but 1 tablespoon fat from the skillet, add the shallots, and cook over medium heat until soft, 2 minutes. Add the Pinot Noir and thyme sprigs, scrape up the browned bits, and boil until reduced by about two-thirds, 10 to 12 minutes.",
      "Add the stock and honey and continue boiling until the sauce reduces to about ¾ cup and lightly coats a spoon, 12 to 15 minutes more. Strain into a small saucepan and set aside.",
      "Brush the fat side of each rack with a thin layer of Dijon, then press the hazelnut mixture firmly over the mustard in an even ¼-inch coat. Wrap the exposed bones in foil strips to prevent scorching.",
      "Roast on the rack until an instant-read thermometer in the center of the eye reads 125°F for medium-rare (about 135°F for medium), 15 to 20 minutes. If the crust browns before the meat is ready, tent loosely with foil. Rest 10 minutes; the temperature will climb about 5°F.",
      "Just before carving, rewarm the sauce to a simmer, take it off the heat, and whisk in the cold butter a few cubes at a time until glossy. Taste and season with a pinch of salt.",
      "Plate on warm plates: carve each rack between the bones into double chops with a sharp slicing knife, keeping the crust intact. Pool 2 tablespoons of Pinot Noir sauce slightly off-center, lean two double chops against each other in the sauce with the bones crossing upward, and serve with the pink interior facing the guest."
    ],
    "equipment": [
      "12-inch skillet",
      "Rimmed sheet pan with wire rack",
      "Small saucepan",
      "Fine-mesh strainer",
      "Instant-read thermometer",
      "Sharp slicing knife"
    ],
    "storage": "Refrigerate leftover lamb within 2 hours for up to 3 days. Rewarm slices gently at 275°F just until warm to avoid overcooking, or serve cold; the crust softens once chilled.",
    "reheating": "",
    "makeAhead": "Day before: toast and skin the hazelnuts, make the crust mixture (refrigerate; bring to room temperature before using), trim and french the racks, and make the Pinot Noir reduction through the straining step. At the client's home: season and sear the racks 1 hour before dinner, apply mustard and crust, and roast so they finish resting just as the plates go out; mount the sauce with butter at the last minute.",
    "safety": "USDA recommends whole cuts of lamb reach 145°F with a 3-minute rest; this recipe is cooked to 125°F (medium-rare) or 135°F (medium) at the chef's recommendation. Consumer advisory: consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness. Roast to 145°F on request.",
    "chefNotes": "Rub the toasted hazelnuts in a kitchen towel while warm to remove most of the papery skins, then chop by hand for a crust with texture (a processor makes it pasty). Salt assumes Diamond Crystal kosher salt."
  },
  {
    "id": 115,
    "slug": "wild-mushroom-risotto-with-parmesan-and-thyme",
    "side": "private-chef",
    "title": "Wild Mushroom Risotto with Parmesan and Thyme",
    "category": "Mains",
    "description": "Creamy Carnaroli risotto built on porcini-enriched vegetable stock, folded with seared wild mushrooms, fresh thyme, and nutty aged Parmesan.",
    "servings": 6,
    "yieldNote": "Serves 6 as a main (about 1½ cups each)",
    "active": 50,
    "total": 60,
    "tags": [
      "Vegetarian main",
      "Pacific Northwest",
      "Seasonal: fall"
    ],
    "allergens": [
      "Milk"
    ],
    "dietary": [
      "Gluten-free",
      "Vegetarian"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "½ oz dried porcini mushrooms",
      "8 cups low-sodium vegetable stock (gluten-free)",
      "1½ lb mixed wild mushrooms (chanterelle, maitake, oyster), cleaned and torn",
      "3 tbsp extra-virgin olive oil, divided",
      "7 tbsp unsalted butter, divided",
      "2 tsp kosher salt, divided",
      "2 medium shallots, finely diced",
      "3 cloves garlic, minced",
      "2 cups Carnaroli rice",
      "¾ cup dry white wine",
      "1 tbsp fresh thyme leaves, plus small sprigs for garnish",
      "3 oz vegetarian Parmesan-style cheese (microbial rennet), finely grated, plus shavings for garnish",
      "1 tsp fresh lemon juice",
      "½ tsp freshly ground black pepper"
    ],
    "directions": [
      "Bring the vegetable stock and dried porcini to a simmer in a saucepan, then keep it at a bare simmer over low heat. After 15 minutes, lift out the porcini, chop them finely, and set aside; leave any grit behind in the bottom of the pot.",
      "Sear the wild mushrooms in two batches: heat 1 tablespoon oil and 1 tablespoon butter in a 12-inch skillet over medium-high heat, add half the mushrooms in one layer, and cook without stirring for 3 minutes, then toss until browned and tender, 3 to 4 minutes more. Season each batch with ¼ teaspoon salt and set aside, reserving a few handsome pieces for garnish.",
      "In a heavy 5-quart Dutch oven or wide saucepan, heat the remaining 1 tablespoon oil and 1 tablespoon butter over medium heat. Cook the shallots with ½ teaspoon salt until soft and translucent, about 4 minutes, then add the garlic and chopped porcini for 1 minute.",
      "Add the rice and toast, stirring, until the edges of the grains turn translucent and it smells lightly nutty, 2 to 3 minutes. Pour in the wine and stir until almost completely absorbed.",
      "Add 2 ladles (about 1 cup) of hot stock and stir steadily until the liquid is nearly absorbed and a spoon drawn through leaves a clear trail. Keep adding stock about ¾ cup at a time, stirring often, at a lively simmer.",
      "After 15 minutes, taste a grain. Continue adding stock in smaller amounts until the rice is tender but still has a slight bite at the center, 18 to 22 minutes total. Stir in the seared mushrooms (except the garnish pieces) and thyme leaves with the last addition of stock.",
      "Take the pot off the heat. Beat in the remaining 4 tablespoons butter, the grated Parmesan, lemon juice, pepper, and remaining 1 teaspoon salt, stirring vigorously for 30 seconds until glossy. Add a final splash of hot stock so the risotto flows in slow waves (all'onda); rest 1 minute.",
      "Plate in warm shallow bowls: spoon in about 1½ cups and tap the bottom of each bowl so it spreads flat. Top with the reserved seared mushrooms, a few Parmesan shavings, a thyme sprig, and a thread of olive oil. Serve immediately; risotto tightens as it sits."
    ],
    "equipment": [
      "Heavy 5-quart Dutch oven or wide saucepan",
      "12-inch skillet",
      "Medium saucepan for stock",
      "Ladle",
      "Wooden spoon",
      "Microplane"
    ],
    "storage": "Refrigerate leftover risotto within 2 hours for up to 3 days. It will set firm; reheat with a splash of stock, or form into cakes, bread them, and pan-fry.",
    "reheating": "",
    "makeAhead": "Day before: make the porcini-enriched stock and chill it, clean and tear the mushrooms (store in a paper bag), and dice the shallots. At the client's home: sear the mushrooms up to 2 hours ahead. For a dinner party, par-cook the risotto: take it about 12 minutes into the stock additions, spread it thin on a sheet pan and refrigerate; 10 minutes before serving, return it to the pot with hot stock and finish the last 6 to 8 minutes, then add mushrooms, butter and cheese.",
    "safety": "Hold hot risotto at 135°F or above; if par-cooking, cool the spread rice to 70°F within 2 hours and to 41°F within 4 more. Reheated leftovers should reach 165°F.",
    "chefNotes": "Traditional Parmigiano-Reggiano uses animal rennet; for vegetarian guests buy a Parmesan-style cheese labeled vegetarian (microbial) rennet. Carnaroli holds its shape better than Arborio; do not rinse the rice. Salt assumes Diamond Crystal kosher salt."
  },
  {
    "id": 116,
    "slug": "crispy-smashed-potatoes-with-garlic-and-herbs",
    "side": "private-chef",
    "title": "Crispy Smashed Potatoes with Garlic and Herbs",
    "category": "Sides",
    "description": "Creamy little Yukon Golds boiled, smashed and roasted until shatteringly crisp, then tossed with garlic chips, herbs and lemon zest.",
    "servings": 6,
    "yieldNote": "Serves 6",
    "active": 30,
    "total": 90,
    "tags": [
      "Vegan",
      "Gluten-free",
      "Make-ahead"
    ],
    "allergens": [],
    "dietary": [
      "Vegan",
      "Vegetarian",
      "Gluten-free",
      "Dairy-free"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "2½ lb small Yukon Gold potatoes (about 1½ inches wide), scrubbed",
      "2 tbsp kosher salt (for the cooking water)",
      "½ cup extra-virgin olive oil, divided",
      "4 cloves garlic, thinly sliced",
      "2 sprigs rosemary",
      "1 tbsp fresh thyme leaves",
      "1 tsp kosher salt (for seasoning)",
      "½ tsp freshly ground black pepper",
      "2 tbsp chopped flat-leaf parsley",
      "1 tsp lemon zest",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Put the potatoes in a large pot, cover with 1 inch of cold water, and add 2 tbsp kosher salt. Bring to a boil, then simmer until a paring knife slides into the center with no resistance, 18 to 22 minutes.",
      "Drain well and spread the potatoes on a rack or towel for 10 minutes so the surfaces steam dry; dry potatoes crisp, wet ones stick.",
      "Meanwhile make garlic oil: warm 6 tbsp olive oil and the sliced garlic in a small saucepan over medium-low heat, swirling, until the garlic is pale golden, 4 to 5 minutes. Add the rosemary sprigs for the last 30 seconds. Strain the oil into a bowl; spread the garlic chips and rosemary on a paper towel. The chips will darken slightly as they cool.",
      "Heat the oven to 450°F with a rack in the lower-middle position. Brush a rimmed sheet pan with 2 tbsp olive oil.",
      "Arrange the potatoes on the pan with space between them. Using the bottom of a measuring cup or a flat glass, press each one to about ½ inch thick so it cracks open but stays in one piece.",
      "Brush the tops generously with about 3 tbsp of the garlic oil and sprinkle with the thyme, 1 tsp salt and the pepper.",
      "Roast until the bottoms are deep golden and crisp, 25 minutes. Flip each potato with a thin metal spatula, brush with the remaining garlic oil, and roast until both sides are crunchy and the edges are browned, 10 to 15 minutes more.",
      "Crumble the crisp rosemary leaves off the stems and combine with the garlic chips, parsley and lemon zest.",
      "To plate: stack the potatoes, crispiest side up, in a warm shallow serving bowl or in a neat overlapping row alongside the main on each plate. Scatter the garlic-herb mixture over the top and finish with flaky salt. Serve hot."
    ],
    "equipment": [
      "Large pot",
      "Colander and wire rack",
      "Rimmed sheet pan",
      "Small saucepan",
      "Flat-bottomed measuring cup",
      "Thin metal spatula"
    ],
    "storage": "Refrigerate leftovers within 2 hours in a covered container up to 3 days. Re-crisp on a sheet pan in a 425°F oven for 10 to 12 minutes until hot (165°F).",
    "reheating": "",
    "makeAhead": "Day before (commissary): boil, drain and steam-dry the potatoes, cool them to 41°F, and refrigerate uncovered on a sheet pan; make the garlic oil and chips and chop the parsley. At the client's home: smash the cold potatoes (they hold together better chilled), oil and roast at 450°F for 40 to 45 minutes so they're done as the main comes off the heat.",
    "safety": "Cool boiled potatoes to 70°F within 2 hours and 41°F within 4 more if made ahead. Store garlic-infused oil in the refrigerator and use within 4 days; never keep it at room temperature, which risks botulism.",
    "chefNotes": "Diamond Crystal kosher salt is assumed; if using Morton, cut the salt by about half. Don't move the potatoes during the first 25 minutes; a good crust needs uninterrupted contact with the hot pan."
  },
  {
    "id": 117,
    "slug": "charred-broccolini-with-lemon-and-chili",
    "side": "private-chef",
    "title": "Charred Broccolini with Lemon and Chili",
    "category": "Sides",
    "description": "Tender broccolini charred hard in a hot skillet, then tossed with garlic-chili oil, lemon zest, and a squeeze of fresh lemon.",
    "servings": 6,
    "yieldNote": "Serves 6",
    "active": 15,
    "total": 25,
    "tags": [
      "Quick",
      "Vegan",
      "Pairs with seafood"
    ],
    "allergens": [],
    "dietary": [
      "Gluten-free",
      "Dairy-free",
      "Vegetarian",
      "Vegan"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "3 bunches broccolini, ends trimmed and thick stems halved lengthwise",
      "4 tbsp extra-virgin olive oil, divided",
      "1¼ tsp kosher salt, divided",
      "1 tbsp kosher salt (for the blanching water)",
      "3 cloves garlic, thinly sliced",
      "1 Fresno chile, thinly sliced into rings",
      "½ tsp crushed red pepper flakes",
      "1 medium lemon, zested and juiced",
      "Flaky sea salt, for finishing"
    ],
    "directions": [
      "Bring a large pot of water to a boil with the 1 tablespoon blanching salt and set up a bowl of ice water. Blanch the broccolini for 60 seconds, just until bright green, then shock it in the ice water, drain, and dry very thoroughly on towels. Dry stalks char; wet ones steam.",
      "Toss the dried broccolini with 2 tablespoons olive oil and 1 teaspoon kosher salt.",
      "Heat a 12-inch cast-iron skillet over high heat until it is smoking hot, about 4 minutes. Add half the broccolini in a single layer and press it down with a spatula or a smaller pan.",
      "Cook without moving until deeply charred in spots, 2 to 3 minutes, then turn and char the other side, 1 to 2 minutes more; the thick stems should be tender when pierced with a paring knife. Transfer to a platter and repeat with the second batch.",
      "Lower the heat to medium, let the pan cool for 1 minute, and add the remaining 2 tablespoons olive oil with the garlic, Fresno chile, and red pepper flakes. Cook, swirling, until the garlic is pale golden and fragrant, 45 to 60 seconds; do not let it brown dark.",
      "Take the pan off the heat, stir in 1½ tablespoons lemon juice and the remaining ¼ teaspoon kosher salt, then return all the broccolini to the pan and toss to coat.",
      "Plate by arranging the stalks in a loose, parallel stack on a warm platter or alongside each main, florets all facing one direction. Spoon the garlic, chile rings, and oil over the top, finish with the lemon zest and a pinch of flaky salt, and serve warm or at room temperature."
    ],
    "equipment": [
      "12-inch cast-iron skillet",
      "Large pot",
      "Ice bath bowl",
      "Tongs",
      "Microplane"
    ],
    "storage": "Refrigerate leftovers within 2 hours for up to 3 days; serve cold or at room temperature, or chop into grain salads and pasta.",
    "reheating": "",
    "makeAhead": "Up to one day ahead: blanch, shock, and thoroughly dry the broccolini, then refrigerate on towel-lined trays; slice the garlic and chile and zest the lemon (keep zest covered). At the client's home: char in batches up to 30 minutes before serving and hold at room temperature, then warm the garlic-chili oil and toss just before plating.",
    "safety": "No special temperature requirements for vegetables; hold cooked broccolini below 41°F or above 135°F, and refrigerate within 2 hours.",
    "chefNotes": "Blanching first means the stems cook through in the time it takes to char the florets. Salt assumes Diamond Crystal kosher salt; the blanching water salt is for seasoning and is not eaten in full."
  },
  {
    "id": 118,
    "slug": "marionberry-cobbler-with-vanilla-bean-whipped-cream",
    "side": "private-chef",
    "title": "Marionberry Cobbler with Vanilla Bean Whipped Cream",
    "category": "Desserts",
    "description": "Jammy Oregon marionberries baked in individual ramekins under tender cream biscuits, served warm with vanilla bean whipped cream.",
    "servings": 6,
    "yieldNote": "Serves 6 (one 8-oz ramekin each)",
    "active": 30,
    "total": 85,
    "tags": [
      "Pacific Northwest",
      "Seasonal: summer",
      "Make-ahead"
    ],
    "allergens": [
      "Wheat",
      "Milk"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "image": "",
    "photoCredit": {
      "author": "",
      "source": "",
      "page": ""
    },
    "ingredients": [
      "1½ lb marionberries, fresh or frozen (do not thaw)",
      "⅓ cup granulated sugar (for the filling)",
      "2 tbsp cornstarch (for the filling)",
      "1 tsp lemon zest (for the filling)",
      "1 tbsp fresh lemon juice (for the filling)",
      "¼ tsp kosher salt (for the filling)",
      "1½ cups all-purpose flour (for the biscuits)",
      "3 tbsp granulated sugar (for the biscuits)",
      "2 tsp baking powder (for the biscuits)",
      "½ tsp kosher salt (for the biscuits)",
      "6 tbsp cold unsalted butter, cut into ½-inch cubes (for the biscuits)",
      "¾ cup cold heavy cream, plus 1 tbsp for brushing (for the biscuits)",
      "2 tbsp turbinado sugar (for the biscuits)",
      "1½ cups cold heavy cream (for the whipped cream)",
      "2 tbsp powdered sugar (for the whipped cream)",
      "1 vanilla bean, split and seeds scraped (for the whipped cream)"
    ],
    "directions": [
      "Heat the oven to 375°F with a rack in the center. Set six 8-ounce ovenproof ramekins on a foil-lined rimmed sheet pan to catch drips.",
      "Make the filling: in a large bowl, whisk the ⅓ cup sugar, cornstarch, and ¼ teaspoon salt together to prevent lumps, then gently fold in the berries, lemon zest, and lemon juice. Divide evenly among the ramekins, scraping in any sugar left in the bowl.",
      "Bake the filling alone for 15 minutes (20 if frozen) so it starts bubbling before the topping goes on; this keeps the underside of the biscuits from turning gummy.",
      "Meanwhile make the biscuit dough: whisk the flour, 3 tablespoons sugar, baking powder, and ½ teaspoon salt. Cut in the cold butter with your fingertips or a pastry blender until the largest pieces are pea-size.",
      "Pour in ¾ cup cream and stir with a fork just until a shaggy dough forms with no dry flour. Divide into 6 equal mounds (a heaping ⅓ cup each) and pat each into a rough 3-inch round about ¾ inch thick.",
      "Set one biscuit on each bubbling ramekin, leaving a small gap at the edge for steam. Brush the tops with 1 tablespoon cream and sprinkle with the turbinado sugar.",
      "Bake until the biscuits are deep golden, a skewer comes out clean, and the filling bubbles thickly around the edges, 25 to 30 minutes. Cool on a rack at least 20 minutes so the juices thicken.",
      "Whip the whipped cream: combine the cold cream, powdered sugar, and vanilla seeds in a chilled bowl and whip to soft, billowy peaks, 2 to 3 minutes by stand mixer on medium-high. Refrigerate until serving.",
      "Plate each warm ramekin on a small plate lined with a folded napkin or doily to keep it from sliding. Top with a generous spoonful of vanilla bean whipped cream, set slightly off-center so the purple juices show, and garnish with a few fresh berries if in season."
    ],
    "equipment": [
      "Six 8-ounce ovenproof ramekins",
      "Rimmed sheet pan",
      "Pastry blender",
      "Stand mixer with whisk",
      "Large mixing bowl",
      "Wire rack"
    ],
    "storage": "Cover and keep leftover cobbler at room temperature up to 1 day or refrigerate up to 3 days. Whipped cream keeps 1 day refrigerated; rewhisk briefly before using.",
    "reheating": "",
    "makeAhead": "Day before: mix the biscuit dry ingredients with the cut-in butter and refrigerate in a zip-top bag; mix the filling dry ingredients separately. At the client's home: toss the berries, par-bake, stir in the cream, and top while the mains are served; bake so the cobblers come out as plates are cleared (they need 20 minutes to rest). Cobblers can also be baked 3 to 4 hours ahead and rewarmed at 325°F for 10 minutes. Whip the cream up to 4 hours ahead and hold in the refrigerator.",
    "safety": "No raw egg in this recipe. Keep whipped cream refrigerated at 41°F or below and discard if left out more than 2 hours.",
    "chefNotes": "Frozen marionberries work beautifully year-round; bake them straight from frozen and add 5 minutes to the first bake. Salt assumes Diamond Crystal kosher salt."
  },
  {
    "id": 119,
    "slug": "flourless-chocolate-hazelnut-torte",
    "side": "private-chef",
    "title": "Flourless Chocolate Hazelnut Torte",
    "category": "Desserts",
    "description": "A dense, fudgy dark chocolate torte made with Oregon hazelnut meal, dusted with powdered sugar and served with lightly sweetened cream.",
    "servings": 6,
    "yieldNote": "Serves 6 to 8 (one 8-inch torte)",
    "active": 30,
    "total": 180,
    "tags": [
      "Make-ahead",
      "Pacific Northwest",
      "Chocolate"
    ],
    "allergens": [
      "Milk",
      "Egg",
      "Tree nuts",
      "Soy"
    ],
    "dietary": [
      "Gluten-free",
      "Vegetarian"
    ],
    "image": "/cookbook/pc/flourless-chocolate-hazelnut-torte.webp",
    "photoCredit": {
      "author": "Taras Chuiko",
      "source": "Pexels",
      "page": "https://www.pexels.com/photo/homemade-delicious-pie-11663198/"
    },
    "ingredients": [
      "8 oz bittersweet chocolate (70%), chopped",
      "10 tbsp unsalted butter, cut into pieces",
      "1 tbsp unsweetened cocoa powder, plus more for the pan",
      "5 large eggs, room temperature",
      "¾ cup granulated sugar",
      "1 tsp vanilla extract",
      "¼ tsp kosher salt",
      "1 cup finely ground hazelnut meal",
      "¼ cup hazelnuts, toasted, skinned and chopped, for garnish",
      "1 tbsp powdered sugar, for dusting",
      "1 cup cold heavy cream (for serving)",
      "1 tbsp granulated sugar (for serving)",
      "6 oz fresh raspberries, for garnish"
    ],
    "directions": [
      "Heat the oven to 325°F with a rack in the center. Butter an 8-inch springform pan, line the bottom with a parchment round, butter the parchment, and dust the sides with cocoa powder.",
      "Melt the chocolate and butter together in a heatproof bowl set over barely simmering water, stirring until smooth. Remove from the heat and whisk in the 1 tablespoon cocoa and the salt; cool to about 100°F, warm to the touch.",
      "In a stand mixer with the whisk, beat the eggs, sugar, and vanilla on medium-high until pale, tripled in volume, and a ribbon falling from the whisk holds for 3 seconds, 6 to 8 minutes. This air is the only lift the torte gets.",
      "Fold about one-third of the egg foam into the chocolate to lighten it, then fold the chocolate mixture back into the remaining foam in two additions with a large spatula, cutting down through the center and turning the bowl, until only faint streaks remain.",
      "Sprinkle the hazelnut meal over the batter and fold just until evenly combined, keeping as much volume as possible. Scrape into the pan and smooth the top.",
      "Set the pan on a sheet pan and bake until the edges are set and slightly cracked, the center wobbles only slightly when nudged, and an instant-read thermometer in the center reads 160°F, 35 to 45 minutes.",
      "Cool in the pan on a rack for 30 minutes (the center will sink a little; that is expected), then run a thin knife around the edge and release the ring. Cool completely, at least 1½ hours, before slicing.",
      "Whip the cream with 1 tablespoon sugar to soft peaks. Dust the torte with powdered sugar through a fine sieve and slice with a hot, dry knife, wiping it between cuts.",
      "Plate each slice slightly off-center on a dessert plate with its point toward the guest. Add a quenelle or spoonful of whipped cream beside it, scatter chopped toasted hazelnuts over the cream, and finish with 3 or 4 raspberries."
    ],
    "equipment": [
      "8-inch springform pan",
      "Stand mixer with whisk",
      "Heatproof bowl and saucepan (double boiler)",
      "Large rubber spatula",
      "Instant-read thermometer",
      "Fine-mesh sieve"
    ],
    "storage": "Keep the torte covered at room temperature up to 2 days or refrigerated up to 5 days; bring to room temperature before serving for the best texture. It freezes well, wrapped, for 1 month.",
    "reheating": "",
    "makeAhead": "Bake one or two days ahead; the texture becomes denser and more truffle-like overnight. Cool completely, wrap well, and refrigerate or keep in a cool spot. Toast and chop the garnish hazelnuts ahead too. At the client's home: take the torte out of the refrigerator 1 hour before dessert, dust with powdered sugar, whip the cream, and slice and plate to order.",
    "safety": "This torte contains eggs; bake until the center reaches 160°F. Chill leftovers within 2 hours.",
    "chefNotes": "Many bittersweet chocolates contain soy lecithin and may be processed with milk; check the label for guests with allergies (Soy is listed here to be safe). Salt assumes Diamond Crystal kosher salt."
  },
  {
    "id": 120,
    "slug": "meyer-lemon-panna-cotta-with-berry-compote",
    "side": "private-chef",
    "title": "Meyer Lemon Panna Cotta with Berry Compote",
    "category": "Desserts",
    "description": "A barely set, silky cream custard perfumed with fragrant Meyer lemon, topped with a bright, jammy mixed berry compote.",
    "servings": 6,
    "yieldNote": "Serves 6 (6-oz glasses or ramekins)",
    "active": 30,
    "total": 390,
    "tags": [
      "Make-ahead",
      "Elegant",
      "Seasonal: spring"
    ],
    "allergens": [
      "Milk"
    ],
    "dietary": [
      "Gluten-free"
    ],
    "image": "/cookbook/pc/meyer-lemon-panna-cotta-with-berry-compote.webp",
    "photoCredit": {
      "author": "Mateus Campos Felipe",
      "source": "Unsplash",
      "page": "https://unsplash.com/photos/three-clear-short-stem-wine-glasses-on-black-surface--XazBwHUtJs"
    },
    "ingredients": [
      "¼ cup cold whole milk (for blooming)",
      "3¼ tsp unflavored powdered gelatin (about 1½ envelopes)",
      "3 cups heavy cream",
      "1 cup whole milk",
      "½ cup granulated sugar",
      "3 medium Meyer lemons, zested in wide strips with a peeler",
      "2 tbsp fresh Meyer lemon juice",
      "⅛ tsp kosher salt",
      "12 oz mixed berries (marionberries, raspberries, blueberries) (for the compote)",
      "¼ cup granulated sugar (for the compote)",
      "1 tbsp fresh Meyer lemon juice (for the compote)",
      "6 small fresh mint leaves, for garnish"
    ],
    "directions": [
      "Pour the ¼ cup cold milk into a small bowl, sprinkle the gelatin evenly over the surface, and let it bloom for 10 minutes until spongy.",
      "Combine the cream, 1 cup milk, sugar, Meyer lemon peel strips, and salt in a medium saucepan. Heat over medium, stirring to dissolve the sugar, until steaming with small bubbles at the edge (about 180°F); do not boil.",
      "Take the pan off the heat, cover, and steep for 20 minutes to extract the lemon oils.",
      "Rewarm the cream to steaming, then remove from the heat and whisk in the bloomed gelatin until completely dissolved, about 1 minute. Strain through a fine-mesh sieve into a large measuring cup and discard the peel.",
      "Set the cup in an ice bath and stir gently until the mixture cools to about 60°F and just starts to thicken slightly, 10 to 15 minutes; this keeps the lemon from separating. Stir in the 2 tablespoons Meyer lemon juice.",
      "Divide among six 6-ounce glasses or lightly oiled ramekins, cover, and refrigerate until set with a gentle wobble, at least 6 hours or overnight.",
      "Make the compote: combine the berries, ¼ cup sugar, and 1 tablespoon lemon juice in a small saucepan. Simmer over medium heat until the berries release their juice and about half have broken down into a loose jam, 5 to 7 minutes. Cool completely and refrigerate.",
      "Plate: if serving in glasses, spoon 2 tablespoons of chilled compote over each panna cotta and top with a mint leaf. If unmolding, dip each ramekin in hot water for 5 seconds, run a thin knife around the rim, invert onto a chilled plate, and spoon compote over the top so it runs down the sides; garnish with a mint leaf and a little fine Meyer lemon zest."
    ],
    "equipment": [
      "Medium saucepan",
      "Fine-mesh sieve",
      "Large measuring cup",
      "Six 6-ounce glasses or ramekins",
      "Ice bath bowl",
      "Vegetable peeler"
    ],
    "storage": "Keep panna cotta covered in the refrigerator up to 3 days; add the compote just before serving. Compote keeps 5 days refrigerated.",
    "reheating": "",
    "makeAhead": "Make the panna cotta and compote one day ahead (panna cotta needs at least 6 hours to set), cover, and refrigerate. Transport in a cooler at 41°F or below, keeping glasses upright in a lined box. At the client's home: keep refrigerated until dessert, then top with compote and garnish, or unmold, just before serving.",
    "safety": "Contains no eggs. Keep panna cotta and compote refrigerated at 41°F or below and do not leave out more than 2 hours. Contains gelatin (animal-derived), so it is not vegetarian.",
    "chefNotes": "If Meyer lemons are out of season, use 2 regular lemons plus 1 small orange for the zest to mimic their floral sweetness. Do not boil the cream after adding gelatin; high heat weakens the set."
  }
];

export const mealPrepRecipes = recipes.filter((recipe) => recipe.side === "meal-prep");
export const privateChefRecipes = recipes.filter((recipe) => recipe.side === "private-chef");
export const findRecipe = (id: number) => recipes.find((recipe) => recipe.id === id);
export const findRecipeByTitle = (title: string) => recipes.find((recipe) => recipe.title === title);
