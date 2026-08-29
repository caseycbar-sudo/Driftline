export type Recipe = {
  id:number; title:string; category:string; main:string; starch:string; vegetables:string;
  profile:string; allergens:string[]; tags:string[]; active:number; total:number;
  image:string; ingredients:string[]; directions:string[]; equipment:string[];
  storage:string; reheating:string; safety:string; pairings:string[];
};

const profiles:Record<string,string[]> = {
  lemon:["2 tbsp fresh lemon juice","1 tbsp lemon zest","3 cloves garlic, minced","2 tsp dried oregano","1 tsp Dijon mustard"],
  cider:["1½ cups unsweetened apple cider","1 tbsp Dijon mustard","1 tsp dried thyme","2 cloves garlic, minced","1 tbsp cider vinegar"],
  tomato:["1 can (28 oz) crushed tomatoes","3 cloves garlic, minced","1 tsp dried basil","1 tsp dried oregano","½ tsp red pepper flakes"],
  greek:["¼ cup fresh lemon juice","3 cloves garlic, minced","2 tsp oregano","1 tsp smoked paprika","½ cup plain Greek yogurt"],
  mustard:["3 tbsp Dijon mustard","2 tbsp honey","2 tbsp cider vinegar","1 tsp garlic powder","½ tsp smoked paprika"],
  shawarma:["2 tsp cumin","2 tsp smoked paprika","1 tsp coriander","½ tsp turmeric","¼ tsp cinnamon"],
  tuscan:["1 cup low-sodium chicken stock","½ cup grated Parmesan","3 cloves garlic, minced","1 tsp Italian seasoning","½ cup sun-dried tomatoes"],
  bbq:["¾ cup low-sugar barbecue sauce","2 tbsp cider vinegar","1 tsp smoked paprika","½ tsp garlic powder"],
  enchilada:["1½ cups red enchilada sauce","2 tsp cumin","1 tsp oregano","1 can (4 oz) diced green chiles"],
  curry:["1 can (13.5 oz) light coconut milk","2 tbsp mild curry paste","1 tbsp grated ginger","1 tbsp lime juice"],
  taco:["2 tsp cumin","2 tsp chili powder","1 tsp smoked paprika","1 tsp garlic powder","½ cup mild salsa"],
  italian:["1 can (15 oz) tomato sauce","3 cloves garlic, minced","2 tsp Italian seasoning","¼ cup grated Parmesan"],
  herb:["2 tbsp chopped rosemary","2 tbsp chopped parsley","3 cloves garlic, minced","2 tbsp lemon juice"],
  verde:["1½ cups salsa verde","1 tsp cumin","1 tbsp lime juice","½ cup chopped cilantro"],
  sesame:["¼ cup low-sodium soy sauce","1 tbsp toasted sesame oil","1 tbsp grated ginger","2 cloves garlic, minced","1 tbsp rice vinegar"],
  moroccan:["2 tsp cumin","1 tsp coriander","1 tsp paprika","½ tsp cinnamon","1 tbsp lemon juice"],
  pesto:["½ cup basil pesto","2 tbsp lemon juice","¼ cup grated Parmesan"],
  buffalo:["½ cup buffalo sauce","1 tbsp honey","1 tsp garlic powder"],
  wine:["1½ cups low-sodium beef stock","½ cup dry red wine","1 tbsp tomato paste","1 tsp thyme"],
  korean:["¼ cup low-sodium soy sauce","2 tbsp pear or apple puree","1 tbsp sesame oil","1 tbsp ginger","2 cloves garlic, minced"],
  balsamic:["¼ cup balsamic vinegar","1 cup low-sodium stock","1 tbsp Dijon mustard","1 tsp thyme"],
  maple:["2 tbsp pure maple syrup","2 tbsp Dijon mustard","1 tbsp cider vinegar","1 tsp rosemary"],
  cajun:["2 tsp smoked paprika","1 tsp oregano","1 tsp thyme","½ tsp cayenne","½ tsp garlic powder"],
  dill:["3 tbsp chopped fresh dill","2 tbsp lemon juice","2 cloves garlic, minced","1 tsp Dijon mustard"],
  creole:["1 can (15 oz) diced tomatoes","1 cup low-sodium stock","2 tsp Creole seasoning","½ cup diced onion","½ cup diced celery"],
  teriyaki:["¼ cup low-sodium soy sauce","2 tbsp rice vinegar","1 tbsp honey","1 tbsp ginger","2 cloves garlic, minced"],
  miso:["3 tbsp white miso","1 tbsp honey","1 tbsp rice vinegar","1 tsp sesame oil","1 tbsp grated ginger"],
  tahini:["¼ cup tahini","3 tbsp lemon juice","1 clove garlic, minced","3 tbsp warm water"],
  peanut:["¼ cup natural peanut butter","2 tbsp low-sodium soy sauce","2 tbsp lime juice","1 tbsp ginger","½ tsp chili flakes"],
  chipotle:["1 tbsp minced chipotle in adobo","1 can (15 oz) tomato sauce","1 tsp cumin","1 tbsp lime juice"],
};

type Seed=[string,string,string,string,string,string[],string[]];
const poultry:Seed[]=[
["Lemon Herb Chicken with Orzo","chicken breast","whole-wheat orzo","zucchini and spinach","lemon",[],["High protein"]],
["Cider-Braised Chicken","chicken thighs","Yukon potatoes","green beans","cider",[],["Gluten-free"]],
["Chicken Cacciatore","chicken thighs","brown rice","bell peppers and mushrooms","tomato",[],["Gluten-free"]],
["Greek Chicken Bowls","chicken breast","quinoa","cucumber and roasted tomatoes","greek",["Dairy"],["High protein"]],
["Honey Mustard Chicken","chicken breast","brown rice","broccoli","mustard",[],["Gluten-free"]],
["Chicken Shawarma Rice","chicken thighs","basmati rice","cauliflower and carrots","shawarma",[],["Dairy-free"]],
["Tuscan Chicken and White Beans","chicken breast","cannellini beans","spinach and tomatoes","tuscan",["Dairy"],["High fiber"]],
["BBQ Chicken Sweet Potatoes","chicken breast","sweet potatoes","green beans","bbq",[],["Gluten-free"]],
["Chicken Enchilada Bake","chicken breast","corn tortillas","bell peppers and black beans","enchilada",[],["Freezer-friendly"]],
["Coconut Curry Chicken","chicken thighs","jasmine rice","broccoli and snap peas","curry",[],["Dairy-free"]],
["Turkey Meatloaf","lean ground turkey","mashed potatoes","roasted carrots","tomato",["Egg"],["Freezer-friendly"]],
["Turkey Taco Bowls","lean ground turkey","brown rice","corn and black beans","taco",[],["Gluten-free"]],
["Turkey Bolognese","lean ground turkey","whole-wheat penne","zucchini and mushrooms","italian",["Dairy","Wheat"],["Freezer-friendly"]],
["Turkey Stuffed Peppers","lean ground turkey","brown rice","bell peppers and tomatoes","tomato",["Dairy"],["Gluten-free"]],
["Turkey Swedish Meatballs","lean ground turkey","egg noodles","green beans","mustard",["Egg","Wheat","Dairy"],["Freezer-friendly"]],
["Rosemary Chicken and Root Vegetables","chicken thighs","baby potatoes","carrots and parsnips","herb",[],["Gluten-free"]],
["Chicken Parmesan Meatballs","ground chicken","whole-wheat pasta","broccoli","italian",["Egg","Wheat","Dairy"],["Freezer-friendly"]],
["Salsa Verde Chicken","chicken breast","brown rice","zucchini and corn","verde",[],["Gluten-free"]],
["Chicken Pot Pie Filling","chicken breast","mashed potatoes","peas and carrots","herb",["Dairy"],["Freezer-friendly"]],
["Sesame Ginger Chicken","chicken breast","brown rice","broccoli and carrots","sesame",["Soy","Sesame"],["Dairy-free"]],
["Moroccan Chicken with Couscous","chicken thighs","whole-wheat couscous","carrots and chickpeas","moroccan",["Wheat"],["High fiber"]],
["Pesto Chicken Pasta","chicken breast","whole-wheat rotini","zucchini and tomatoes","pesto",["Dairy","Tree nuts","Wheat"],["High protein"]],
["Chicken Sausage and Peppers","chicken sausage","brown rice","bell peppers and onions","italian",[],["Freezer-friendly"]],
["Buffalo Chicken Rice Bowls","chicken breast","brown rice","broccoli and carrots","buffalo",[],["High protein"]],
["Chicken Fried Rice","chicken breast","brown rice","peas and carrots","sesame",["Soy","Egg","Sesame"],["One-pan"]],
];
const meat:Seed[]=[
["Slow-Cooked Beef Ragù","beef chuck","creamy polenta","roasted carrots","wine",["Dairy"],["Freezer-friendly"]],
["Beef and Broccoli","lean flank steak","brown rice","broccoli","sesame",["Soy","Sesame"],["High protein"]],
["Korean Beef Rice Bowls","lean ground beef","brown rice","carrots and spinach","korean",["Soy","Sesame"],["Freezer-friendly"]],
["Beef Burgundy","beef chuck","mashed potatoes","mushrooms and carrots","wine",["Dairy"],["Freezer-friendly"]],
["Salisbury Steak Meatballs","lean ground beef","mashed potatoes","green beans and mushrooms","balsamic",["Egg","Wheat"],["Freezer-friendly"]],
["Beef Taco Casserole","lean ground beef","brown rice","corn and black beans","taco",["Dairy"],["Gluten-free"]],
["Mediterranean Beef Kofta","lean ground beef","quinoa","roasted tomatoes and zucchini","greek",["Dairy"],["High protein"]],
["Steak Fajita Bowls","flank steak","brown rice","bell peppers and onions","taco",[],["Gluten-free"]],
["Cottage Pie","lean ground beef","mashed potatoes","peas and carrots","herb",["Dairy"],["Freezer-friendly"]],
["Balsamic Beef and Mushrooms","beef sirloin","farro","mushrooms and green beans","balsamic",["Wheat"],["High protein"]],
["Pork Tenderloin with Apples","pork tenderloin","sweet potatoes","cabbage and apples","cider",[],["Gluten-free"]],
["Pulled Pork Verde","pork shoulder","brown rice","black beans and corn","verde",[],["Freezer-friendly"]],
["Pork Carnitas Bowls","pork shoulder","cilantro rice","peppers and black beans","taco",[],["Gluten-free"]],
["Maple Dijon Pork","pork tenderloin","wild rice","Brussels sprouts","maple",[],["Gluten-free"]],
["Pork and Cabbage Stir-Fry","lean ground pork","brown rice","cabbage and carrots","sesame",["Soy","Sesame"],["One-pan"]],
["Sausage Lentil Stew","chicken sausage","green lentils","carrots and spinach","tomato",[],["High fiber"]],
["Italian Sausage Pasta Bake","Italian turkey sausage","whole-wheat penne","spinach and tomatoes","italian",["Wheat","Dairy"],["Freezer-friendly"]],
["Pork Meatballs with Sesame Greens","lean ground pork","brown rice","bok choy and carrots","sesame",["Egg","Soy","Sesame"],["Freezer-friendly"]],
["Ham and White Bean Soup","lean ham","cannellini beans","carrots and kale","herb",[],["High fiber"]],
["Pork Posole","pork shoulder","hominy","cabbage and radishes","verde",[],["Gluten-free"]],
["Lamb Kofta Bowls","lean ground lamb","quinoa","tomatoes and cucumber","greek",["Dairy"],["High protein"]],
["Lamb and Lentil Shepherd's Pie","lean ground lamb","mashed potatoes","lentils and carrots","herb",["Dairy"],["Freezer-friendly"]],
["Moroccan Lamb Stew","lamb shoulder","whole-wheat couscous","carrots and chickpeas","moroccan",["Wheat"],["Freezer-friendly"]],
["Beef Stuffed Zucchini","lean ground beef","brown rice","zucchini and tomatoes","italian",["Dairy"],["Gluten-free"]],
["Beef Barley Soup","beef chuck","pearl barley","carrots and mushrooms","herb",["Wheat"],["Freezer-friendly"]],
];
const seafood:Seed[]=[
["Coastal Salmon Cakes","cooked salmon","brown rice","green beans","dill",["Fish","Egg"],["Freezer-friendly"]],
["Maple Glazed Salmon","salmon fillets","wild rice","broccoli","maple",["Fish"],["Gluten-free"]],
["Mediterranean Baked Cod","cod fillets","quinoa","tomatoes and zucchini","greek",["Fish","Dairy"],["Gluten-free"]],
["Lemon Dill Salmon and Potatoes","salmon fillets","baby potatoes","green beans","dill",["Fish"],["Gluten-free"]],
["Shrimp Creole","peeled shrimp","brown rice","peppers and celery","creole",["Shellfish"],["Dairy-free"]],
["Garlic Shrimp Rice Bowls","peeled shrimp","brown rice","broccoli and carrots","lemon",["Shellfish"],["High protein"]],
["Tuna Noodle Casserole","water-packed tuna","whole-wheat noodles","peas and mushrooms","dill",["Fish","Wheat","Dairy"],["Freezer-friendly"]],
["Fish Taco Bowls","white fish fillets","cilantro rice","cabbage and corn","taco",["Fish"],["Gluten-free"]],
["Coconut Lime Cod","cod fillets","jasmine rice","snap peas and carrots","curry",["Fish"],["Dairy-free"]],
["Salmon Teriyaki","salmon fillets","brown rice","broccoli","teriyaki",["Fish","Soy"],["High protein"]],
["Crab Cake Meal Prep","lump crabmeat","roasted potatoes","green beans","dill",["Shellfish","Egg","Wheat"],["Freezer-friendly"]],
["Seafood Paella","shrimp and white fish","brown rice","peas and peppers","cajun",["Fish","Shellfish"],["One-pan"]],
["Tomato Braised White Fish","white fish fillets","cannellini beans","spinach and tomatoes","tomato",["Fish"],["High fiber"]],
["Cajun Salmon Pasta","salmon fillets","whole-wheat penne","bell peppers and spinach","cajun",["Fish","Wheat","Dairy"],["High protein"]],
["Pesto Cod with Tomatoes","cod fillets","whole-wheat orzo","tomatoes and zucchini","pesto",["Fish","Tree nuts","Dairy","Wheat"],["High protein"]],
["Shrimp and Sausage Jambalaya","peeled shrimp and chicken sausage","brown rice","peppers and celery","creole",["Shellfish"],["One-pot"]],
["Miso Glazed Salmon","salmon fillets","brown rice","bok choy and carrots","miso",["Fish","Soy"],["High protein"]],
["Lemon Pepper Tilapia","tilapia fillets","quinoa","broccoli and carrots","lemon",["Fish"],["Gluten-free"]],
["Mediterranean Tuna Patties","water-packed tuna","farro","tomatoes and spinach","greek",["Fish","Egg","Wheat","Dairy"],["Freezer-friendly"]],
["Creamy Salmon Chowder","salmon","Yukon potatoes","corn and celery","dill",["Fish","Dairy"],["Freezer-friendly"]],
["Ginger Scallion Fish","white fish fillets","brown rice","bok choy and snap peas","sesame",["Fish","Soy","Sesame"],["Dairy-free"]],
["Shrimp Primavera","peeled shrimp","whole-wheat pasta","zucchini and peppers","lemon",["Shellfish","Wheat"],["High protein"]],
["Salmon Quinoa Bowls","salmon fillets","quinoa","broccoli and carrots","tahini",["Fish","Sesame"],["High protein"]],
["Cod and Chickpea Stew","cod fillets","chickpeas","tomatoes and spinach","tomato",["Fish"],["High fiber"]],
["Old Bay Shrimp and Corn","peeled shrimp","baby potatoes","corn and green beans","cajun",["Shellfish"],["Gluten-free"]],
];
const vegetarian:Seed[]=[
["Red Lentil Coconut Curry","red lentils","brown rice","spinach and carrots","curry",[],["Vegan","Freezer-friendly"]],
["Chickpea Tikka Bowls","chickpeas","basmati rice","cauliflower and peas","curry",[],["Vegan"]],
["Black Bean Enchilada Bake","black beans","corn tortillas","peppers and corn","enchilada",[],["Vegetarian","Freezer-friendly"]],
["Mushroom Lentil Bolognese","brown lentils","whole-wheat pasta","mushrooms and zucchini","tomato",["Wheat"],["Vegan"]],
["Sweet Potato Peanut Stew","chickpeas","sweet potatoes","kale and tomatoes","peanut",["Peanut"],["Vegan","Freezer-friendly"]],
["Vegetable Lasagna Rolls","ricotta cheese","whole-wheat lasagna noodles","spinach and zucchini","italian",["Dairy","Wheat","Egg"],["Vegetarian","Freezer-friendly"]],
["Quinoa Black Bean Bowls","black beans","quinoa","corn and peppers","taco",[],["Vegan","Gluten-free"]],
["Chickpea Shawarma Bowls","chickpeas","brown rice","cauliflower and carrots","shawarma",[],["Vegan"]],
["Broccoli Cheddar Quinoa Bake","cheddar cheese","quinoa","broccoli and cauliflower","mustard",["Dairy"],["Vegetarian","Freezer-friendly"]],
["White Bean Pesto Pasta","cannellini beans","whole-wheat rotini","spinach and tomatoes","pesto",["Tree nuts","Dairy","Wheat"],["Vegetarian"]],
["Tofu Teriyaki Bowls","extra-firm tofu","brown rice","broccoli and carrots","teriyaki",["Soy"],["Vegan"]],
["Tempeh Taco Bowls","tempeh","brown rice","corn and peppers","taco",["Soy"],["Vegan"]],
["Vegetable Fried Rice","edamame","brown rice","peas and carrots","sesame",["Soy","Egg","Sesame"],["Vegetarian","One-pan"]],
["Mushroom Cottage Pie","brown lentils","mashed potatoes","mushrooms and carrots","herb",["Dairy"],["Vegetarian","Freezer-friendly"]],
["Spinach Ricotta Stuffed Shells","ricotta cheese","whole-wheat pasta shells","spinach and tomatoes","italian",["Dairy","Wheat","Egg"],["Vegetarian","Freezer-friendly"]],
["Moroccan Chickpea Couscous","chickpeas","whole-wheat couscous","carrots and zucchini","moroccan",["Wheat"],["Vegan"]],
["Chipotle Sweet Potato Chili","black beans","sweet potatoes","tomatoes and corn","chipotle",[],["Vegan","Freezer-friendly"]],
["Lentil Sloppy Joe Bowls","brown lentils","brown rice","peppers and carrots","tomato",[],["Vegan","Freezer-friendly"]],
["Cauliflower Chickpea Korma","chickpeas","basmati rice","cauliflower and peas","curry",[],["Vegan"]],
["Vegetable Minestrone","cannellini beans","whole-wheat pasta","zucchini and spinach","tomato",["Wheat"],["Vegan","Freezer-friendly"]],
["Greek Lentil Meatballs","brown lentils","quinoa","tomatoes and cucumber","greek",["Egg","Dairy"],["Vegetarian"]],
["Sesame Tofu Noodles","extra-firm tofu","whole-wheat noodles","bok choy and carrots","sesame",["Soy","Sesame","Wheat"],["Vegan"]],
["Butternut White Bean Stew","cannellini beans","butternut squash","kale and tomatoes","herb",[],["Vegan","Freezer-friendly"]],
["Eggplant Parmesan Bake","mozzarella cheese","whole-wheat pasta","eggplant and tomatoes","italian",["Dairy","Wheat","Egg"],["Vegetarian","Freezer-friendly"]],
["Peanut Chickpea Noodle Bowls","chickpeas","whole-wheat noodles","cabbage and carrots","peanut",["Peanut","Wheat","Soy"],["Vegan"]],
];

const seeds=[...poultry,...meat,...seafood,...vegetarian];
const categoryFor=(i:number)=>i<25?"Poultry":i<50?"Beef, Pork & Lamb":i<75?"Seafood":"Vegetarian";

export const recipes:Recipe[]=seeds.map((s,i)=>{
  const [title,main,starch,vegetables,profile,allergens,tags]=s;
  const p=profiles[profile]||profiles.herb;
  const isSeafood=i>=50&&i<75;
  const isVeg=i>=75;
  const mainAmount=isVeg?"3 cups cooked or 2 cans, drained":isSeafood?"1½ lb":"1¾ lb";
  const directions=[
    `Wash hands and sanitize the work surface. Gather and measure all ingredients; preheat oven to 400°F if roasting is used.`,
    `Prepare ${starch} according to package directions using unsalted water or low-sodium stock. Hold covered when tender.`,
    `Cut ${vegetables} into even pieces. Toss with 1 tablespoon oil, half the salt, and pepper; roast or sauté until just tender.`,
    `Pat ${main} dry when applicable. Season with the remaining salt and pepper. Cook in a large skillet or roasting pan until properly browned.`,
    `Combine the flavor ingredients in a small bowl. Add to the ${main} and simmer gently until the sauce coats the ingredients and the main component is fully cooked.`,
    `Taste and adjust acid, seasoning, and moisture. Keep the vegetables bright and the ${starch} separate enough to avoid sogginess.`,
    `Divide evenly among shallow meal-prep containers: ${main}, ${starch}, then ${vegetables}. Spoon remaining sauce over the main component.`,
    `Label with dish name, preparation date, use-by date, allergens, and reheating instructions. Cool promptly and refrigerate within two hours.`
  ];
  return {
    id:i+1,title,category:categoryFor(i),main,starch,vegetables,profile,
    allergens,tags,active:30+(i%4)*5,total:55+(i%6)*10,
    image:`/cookbook/r-${String(i+1).padStart(3,"0")}-v2.webp`,
    ingredients:[mainAmount+" "+main,"2 cups dry "+starch,"4 cups "+vegetables,"2 tbsp olive or avocado oil","1 tsp kosher salt","½ tsp black pepper",...p,"2 tbsp chopped fresh parsley or cilantro for finishing"],
    directions,equipment:["Chef’s knife","Cutting board","Large skillet or roasting pan","Medium saucepan","Food thermometer","Shallow meal-prep containers"],
    storage:"Cool in shallow containers and refrigerate at 40°F or below. Use within 3–4 days; freeze portions not needed in that window.",
    reheating:"Cover and reheat evenly until the center reaches 165°F. Stir or rotate halfway through microwave reheating and rest one minute before serving.",
    safety:isSeafood?"Cook finfish to 145°F; cook shrimp until pearly and opaque. Prevent cross-contact with shellfish and fish allergens.":isVeg?"Prevent cross-contact with listed allergens. Cool promptly and refrigerate within two hours.":"Cook poultry to 165°F; ground meats to 160°F; whole cuts of pork and beef to 145°F with a 3-minute rest. Cool promptly.",
    pairings:[seeds[(i+17)%100][0],seeds[(i+43)%100][0]]
  };
});
