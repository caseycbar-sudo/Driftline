/**
 * Privacy policy and terms of service.
 *
 * Written against what this codebase actually does: every collection and
 * sharing claim below can be traced to a table in db/schema.ts or a service
 * called from app/. If the site starts collecting something new, or starts
 * sending data somewhere new, this file has to change in the same commit.
 *
 * Casey is not a lawyer and neither am I. This is an honest description of the
 * service, not a substitute for a review by an Oregon attorney before it is
 * relied on in a dispute.
 */

export const LEGAL_UPDATED = "September 27, 2026";

export type Section = { title: string; body: string };

export const privacySections: Section[] = [
  {
    title: "What we collect when you book",
    body: "Your name, email address, phone number, the street address where visits happen, and how many people are in your household. When you ask about a dinner or an event, we also keep the date, guest count, location and whatever you tell us about the occasion.",
  },
  {
    title: "What we collect to cook for you",
    body: "Dietary needs and allergies, foods you love, foods to avoid, the dishes you pick from the cookbook, and any recipes you add yourself. You can also leave notes about your kitchen — where the pans live, that the oven runs hot — and access notes like a gate code, which door to use, or a dog who bolts. Access notes are visible to the chef assigned to your visit and to Casey, and to nobody else.",
  },
  {
    title: "Photos",
    body: "Your chef photographs the finished meals and your kitchen at the end of a visit, so you can see what you came home to and so we can show the kitchen was left clean. Those photos are stored with your account and shown to you and to Casey. We do not publish a photo taken in your home on the public site or on social media unless you tell us we can.",
  },
  {
    title: "What we keep in your kitchen",
    body: "After a visit we record which groceries were left over and stayed on your shelf, so your next shopping list doesn't buy them twice. That's a list of ingredients, nothing more, and you can ask us to clear it at any time.",
  },
  {
    title: "Payment details",
    body: "Card numbers never reach this website. When you save a card, the form sends it straight to Square, our payment processor, and Square hands back a token. What we store is the card brand, the last four digits, the expiry, and the date you agreed to be charged after each visit. Square holds the card itself and is bound by its own privacy policy and by PCI rules.",
  },
  {
    title: "How you sign in",
    body: "There is no password to steal because we never set one. You sign in with a 6-digit code sent to your email, or with Face ID, Touch ID or a fingerprint if you turn that on. If you use Face ID, what is stored here is a public key — the kind your phone hands out on purpose. Your face and your fingerprint never leave your device and we never see them.",
  },
  {
    title: "Who else touches your information",
    body: "Cloudflare hosts the site, the database and the photos. Resend sends the email we send you. Square processes payments. Those three are the only companies your personal information reaches, and each only gets the part it needs to do its job. We do not sell your information, we do not trade it, and we do not hand it to advertisers.",
  },
  {
    title: "Groceries and Fred Meyer",
    body: "When your chef orders groceries for pickup, the shopping list goes to a Fred Meyer account belonging to the chef or to Driftline, never one of yours. Fred Meyer sees a list of groceries. It does not see your name, your address or anything else about you.",
  },
  {
    title: "How long we keep it",
    body: "Your account details and preferences stay until you ask us to delete them, because that is the point of them — so you don't have to explain your household twice. Payment records are kept as long as tax and accounting rules require. Ask us to delete your account and we will remove your profile, your preferences, your saved dishes, your pantry list, your photos and your saved card, keeping only what the law requires us to keep.",
  },
  {
    title: "Seeing or deleting what we hold",
    body: "Email Casey and ask. He'll send you what's on file or delete it, whichever you asked for, and he'll do it himself rather than routing you through a form. If something on file is wrong, tell us and we'll fix it.",
  },
  {
    title: "Children",
    body: "This service is for adults. We don't knowingly collect information from anyone under 13. We do collect the ages or dietary needs of children in your household if you tell us, because it changes how we cook — that information is yours, given about your family, and it is treated like the rest of your household notes.",
  },
  {
    title: "If something goes wrong",
    body: "If your information is exposed in a way that could put you at risk, we will tell you directly and quickly, and tell you what we know and what we're doing about it. We would rather tell you early and be embarrassed than have you find out from someone else.",
  },
];

export const termsSections: Section[] = [
  {
    title: "Who you're dealing with",
    body: "Driftline Provisions, a personal chef and small-scale catering business run by Casey Barella in Astoria, Oregon. When these terms say we or us, they mean that business. Reaching us is a single email address, answered by Casey.",
  },
  {
    title: "What we serve, and where",
    body: "Private chef dinners, small-scale catering, and weekly in-home meal prep, on the Oregon North Coast — Astoria, Warrenton, Gearhart, Seaside and Cannon Beach. If you are somewhere else on the coast, ask; we may still come to you, and we will say so plainly rather than quoting you for a drive we won't make.",
  },
  {
    title: "Who can book",
    body: "You need to be 18 to hold an account or book a visit. If you are arranging meals for a parent, or for anyone else you look after, you are welcome to book on their behalf \u2014 just tell us that is the arrangement, so we know whose kitchen it is, who to call, and where the receipt goes.",
  },
  {
    title: "Booking and confirmation",
    body: "Asking about a date does not hold it. A visit or an event is booked when we confirm it to you in writing, and for private dinners and catering that confirmation is a written proposal covering the menu, the price, and the payment and cancellation terms for your event. If a proposal and this page disagree, your proposal wins.",
  },
  {
    title: "Who cooks",
    body: "Usually Casey. As Driftline grows, another Driftline chef may cook your visit. If the person coming to your house is not the person you booked with, we will tell you before the visit rather than after, and you can say no and reschedule.",
  },
  {
    title: "Prices and groceries",
    body: "Meal prep service prices are shown on the site and are what you pay for the visit. Groceries are separate and charged at what they actually cost — you get the receipt. There is a small flat pantry-kit charge per visit for the spices, oil, salt and pepper your chef brings, which costs less than buying jars you would use once. Private chef and catering pricing is quoted per event and includes groceries unless your proposal says otherwise.",
  },
  {
    title: "Paying",
    body: "You can save a card to your account and agree to be charged after each completed visit, for the package price plus groceries. You get a receipt every time. You can remove the card or withdraw that agreement whenever you like, from your account page, without asking anyone. For dinners and events, payment follows your written proposal.",
  },
  {
    title: "Changing or cancelling a visit",
    body: "Tell us as early as you can and we will move things around; life on the coast is like that and we would rather reschedule than have you pay for a visit you didn't get. For meal prep, a visit cancelled after groceries have been bought may be charged for the groceries, which are yours to keep. For dinners and events, the deposit and cancellation terms in your written proposal apply.",
  },
  {
    title: "When the coast has other plans",
    body: "Storms, power cuts, a closed bridge, a chef who wakes up sick. If we cannot safely reach you, or cannot cook once we are there, we will move the visit and you will not be charged for it. It runs the other way too \u2014 if your power is out or your kitchen is out of action, call before we load the car.",
  },
  {
    title: "What we need from your kitchen",
    body: "A working stove, oven, refrigerator and running water, and a way for your chef to get in at the agreed time. We bring the pans, tools and plating gear. If we arrive and cannot get in, or the kitchen cannot be cooked in, we may have to charge for the visit — we will always call you before it comes to that.",
  },
  {
    title: "Your home while we are in it",
    body: "A kitchen in use has heat, knives and someone moving quickly through it. Please keep children and pets clear of the cooking area while your chef is working. If we damage something of yours, tell us and we will make it right. What we cannot take on is a problem that was already there \u2014 an appliance on its way out, a leak behind a cabinet \u2014 that happens to show itself while we are in the room.",
  },
  {
    title: "Allergies and food safety",
    body: "Tell us about allergies, intolerances and diets, and how serious they are, and we will build around them. Be aware that a home kitchen has shared surfaces, shared equipment and other people's food in it, so we cannot promise a kitchen free of any given allergen. If an allergy is severe enough that cross-contact is dangerous, say so directly and we will tell you honestly whether we can cook for you safely.",
  },
  {
    title: "Cooking is not medical or nutrition advice",
    body: "Casey is a chef. He is not a doctor, a dietitian or a nutritionist, and nothing we cook, write or say is medical advice. We will happily cook to a diet your doctor gave you, and we take allergies seriously. Deciding what you should be eating for a medical condition is between you and someone licensed to advise you. If a doctor and one of our recipes disagree, follow the doctor.",
  },
  {
    title: "Your food, your household",
    body: "Everything is cooked in your kitchen, for your household and guests. Meals keep three to four days in the refrigerator, following USDA guidance for cooked food, and every container is labelled with the dish, the day it was cooked and an eat-by date. Once we leave, storing and reheating the food is yours to manage — keep it at 40°F or below and reheat to 165°F. We are not responsible for food kept past its date or held outside those temperatures.",
  },
  {
    title: "Alcohol",
    body: "We do not supply, sell or pour alcohol. If you want wine with dinner, it is your bottle and your household pours it.",
  },
  {
    title: "Photos of your home",
    body: "Your chef photographs the finished meals and the clean kitchen at the end of a visit. Those go in your account. We will not publish a photo taken inside your home anywhere public without asking you first and getting a yes.",
  },
  {
    title: "Your account",
    body: "Your account is yours. Don't hand your sign-in code to someone you wouldn't hand your house key to. If you think someone else has got into your account, tell us and we will end every session on it immediately.",
  },
  {
    title: "The cookbook",
    body: "The recipes on this site are ours to share with you and to cook for you. Cook them at home as much as you like. Please don't republish the collection as your own. Recipes you add to your own account stay yours; we use them to cook for you and for nothing else.",
  },
  {
    title: "The site itself",
    body: "We keep this website accurate and running as best we can, but we offer it as it is. A price, a date or a recipe can be wrong, and if one is, tell us and we will fix it. Cooking from the cookbook at home is your own call, in your own kitchen, at your own risk \u2014 the only promise attached to those recipes is that we cook them ourselves.",
  },
  {
    title: "Other companies we connect to",
    body: "Payments run through Square and grocery pickup runs through Fred Meyer. Those are their businesses, with their own terms and their own privacy policies, and we cannot answer for how they are run.",
  },
  {
    title: "When things go wrong",
    body: "If a meal isn't right, tell Casey. He reads every message himself and would rather hear it from you than read it in a review. We will make it right — remake the dish, credit the visit, or refund it — and we would rather do that than argue about who was at fault.",
  },
  {
    title: "The limit of what we owe you",
    body: "If we get something wrong, what we owe you is capped at what you paid us for the visit or event it happened on. Nothing here limits responsibility for injury caused by our own negligence, and nothing here takes away rights Oregon law gives you as a consumer. These terms are governed by Oregon law, and any dispute that cannot be settled between us belongs in the state courts of Clatsop County, Oregon.",
  },
  {
    title: "If a claim comes from your side",
    body: "If someone in your household or one of your guests brings a claim against us over something we were not told \u2014 an allergy that was known and left off the form, a hazard in the house, a guest nobody mentioned \u2014 we may ask you to cover what it costs us to deal with it. That is not us looking for a fight. It is why telling us the whole picture matters.",
  },
  {
    title: "If part of this does not hold up",
    body: "If a court decides one part of these terms cannot stand, that part is struck out and everything else carries on unaffected.",
  },
  {
    title: "Changes to these terms",
    body: "If we change them, the date at the top of this page changes and the new version applies to bookings made after that date. A booking already confirmed runs on the terms that were in place when we confirmed it.",
  },
];
