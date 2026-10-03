/**
 * Questions page content. Answers only state what Driftline has confirmed;
 * deposits and cancellations are left to each written proposal until Casey
 * sets a standard policy.
 */
export type Question = { q: string; a: string; link?: { href: string; label: string } };
export type QuestionGroup = { id: string; title: string; questions: Question[] };

export const QUESTION_GROUPS: QuestionGroup[] = [
  {
    id: "private-dinners",
    title: "Private chef dinners",
    questions: [
      {
        q: "How far ahead should I book?",
        a: "Just ask. Send the date you have in mind and Casey will tell you what's open. The earlier you ask, the more dates there are to choose from.",
        link: { href: "/private-chef#inquire", label: "Check a date" },
      },
      {
        q: "What's included in the price?",
        a: "Menu planning, grocery shopping, cooking in your kitchen, plated or family-style service, and cleanup. Groceries are included in your proposal. Specialty rentals, extra servers, long-distance travel and alcohol are quoted separately.",
        link: { href: "/private-chef", label: "See private chef pricing" },
      },
      {
        q: "What do I need in my kitchen?",
        a: "A working stove, oven, refrigerator and running water. We bring the pans, tools and plating gear, so you don't need anything special.",
      },
      {
        q: "Can you cook in a vacation rental?",
        a: "Yes. We cook in vacation rentals along the coast. Send the address and any check-in or access details when you book.",
      },
      {
        q: "Can you handle allergies and dietary needs?",
        a: "Yes. Tell us about any allergies, intolerances or diets when you plan the menu, and we build around them. Home kitchens can have shared surfaces and equipment, so let us know how severe an allergy is.",
      },
      {
        q: "Do you clean up?",
        a: "Yes. Dishes handled, cooking surfaces cleaned, and your kitchen left ready for you. Leftovers are packed up when it makes sense.",
      },
      {
        q: "Is wine or alcohol included?",
        a: "Alcohol isn't included in the per-guest price. Ask Casey about pairings when you plan your menu.",
      },
      {
        q: "How do deposits and cancellations work?",
        a: "Your written proposal spells out payment, deposit and cancellation terms before anything is booked, so there are no surprises.",
      },
    ],
  },
  {
    id: "meal-prep",
    title: "Weekly meal prep",
    questions: [
      {
        q: "How does weekly meal prep work?",
        a: "You pick dishes from the cookbook. Your chef shops, cooks in your kitchen, portions and labels everything, and cleans up before leaving. You'll see photos of the finished meals and clean kitchen in your account.",
        link: { href: "/meal-prep", label: "How meal prep works" },
      },
      {
        q: "Are groceries included?",
        a: "No. Groceries are separate from the service price, so you only pay what your meals actually cost. Depending on your plan, you can buy them yourself or approve us to shop for you.",
      },
      {
        q: "How long do the meals keep?",
        a: "Three to four days in the fridge, following USDA guidance for cooked food. Every container is labeled with the dish, the day it was cooked and an eat-by date. Eat seafood dishes first, in the first day or two. If you won't get to something by day four, freeze it on day one or two instead; freezer-friendly dishes are marked in the cookbook. Keep meals at 40°F or below and reheat to 165°F.",
        link: { href: "/cookbook", label: "Browse the cookbook" },
      },
      {
        q: "How many different dishes can I pick?",
        a: "It depends on your package: 2 entrées for 6 or 8 portions, 3 for 12, and 4 for 16 or more, plus one dessert if you'd like. Your portions are split across those entrées. A visit can include one big-project dish (like lasagna or meatballs) so your chef can finish in about three hours and your kitchen isn't taken over all day.",
        link: { href: "/cookbook", label: "Browse the cookbook" },
      },
      {
        q: "What happens to leftover groceries?",
        a: "They stay in your kitchen. You paid for the groceries, so the extra eggs, the rest of the rice and the half bottle of oil are yours to keep. Your chef puts everything away and notes what's left, and your next shopping list skips those items so you're not buying them twice.",
      },
      {
        q: "Do I have to buy spices for every dish?",
        a: "No. Your chef brings their own spices, oil, salt and pepper, and there's a small flat pantry-kit charge per visit instead. It costs less than buying jars you'd use once, and nothing goes to waste.",
      },
      {
        q: "Can I request my own family recipes?",
        a: "Yes. Add a family favorite from your account and we'll work it into your rotation.",
      },
      {
        q: "Is the food made anywhere other than my kitchen?",
        a: "No. Everything is made in your kitchen, for your household and guests. Nothing is cooked ahead in anyone else's kitchen.",
      },
    ],
  },
  {
    id: "catering",
    title: "Catering",
    questions: [
      {
        q: "How big an event can you cater?",
        a: "We focus on small-scale events: rehearsal dinners, celebrations, company gatherings and vacation groups of 10 or more.",
        link: { href: "/catering", label: "Plan an event" },
      },
      {
        q: "Family style, plated or buffet?",
        a: "Any of the three. We'll help you pick what fits your crowd and your space when we design the menu together.",
      },
    ],
  },
  {
    id: "general",
    title: "Everything else",
    questions: [
      {
        q: "Where do you serve?",
        a: "Astoria, Warrenton, Gearhart, Seaside and Cannon Beach. Somewhere else on the coast? Ask. We may still be able to come to you.",
      },
      {
        q: "When can I get the clam chowder?",
        a: "Sundays at the Astoria Sunday Market on 12th Street, 10am to 3pm, Mother's Day through mid-October. Check the Sunday Market page for today's status.",
        link: { href: "/sunday-market", label: "Sunday Market" },
      },
      {
        q: "How do I sign in? Is there a password?",
        a: "No password. Enter your email and we send you a 6-digit code (and a link) that works for 15 minutes. Once you are in, you can turn on Face ID or a fingerprint and sign in with one tap after that.",
        link: { href: "/signin", label: "Sign in" },
      },
      {
        q: "Something else on your mind?",
        a: "Send a message. Casey reads every one himself and usually replies within a day.",
        link: { href: "/contact", label: "Contact Casey" },
      },
    ],
  },
];
