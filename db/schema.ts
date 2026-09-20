import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const customerProfiles = sqliteTable("customer_profiles", {
  email: text("email").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull().default(""),
  city: text("city").notNull().default(""),
  householdSize: integer("household_size").notNull().default(1),
  serviceFor: text("service_for").notNull().default("My household"),
  dietaryNeeds: text("dietary_needs").notNull().default(""),
  favoriteFoods: text("favorite_foods").notNull().default(""),
  foodsToAvoid: text("foods_to_avoid").notNull().default(""),
  preferredPackage: text("preferred_package").notNull().default("Weekly"),
  /** Street address where visits happen. */
  streetAddress: text("street_address").notNull().default(""),
  /** Gate codes, parking, pets, alarm, which door: anything a chef needs to get in. */
  accessNotes: text("access_notes").notNull().default(""),
  /** Kitchen quirks: oven runs hot, induction cooktop, where the pans are. */
  kitchenNotes: text("kitchen_notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const selectedMeals = sqliteTable("selected_meals", {
  email: text("email").notNull(),
  recipeId: integer("recipe_id").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [primaryKey({ columns: [table.email, table.recipeId] })]);

export const customRecipes = sqliteTable("custom_recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  title: text("title").notNull(),
  servings: integer("servings").notNull().default(4),
  ingredients: text("ingredients").notNull(),
  directions: text("directions").notNull(),
  notes: text("notes").notNull().default(""),
  sourceUrl: text("source_url").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const scheduleEvents = sqliteTable("schedule_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceDate: text("service_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull().default(""),
  household: text("household").notNull(),
  customerEmail: text("customer_email").notNull().default(""),
  dishes: text("dishes").notNull().default("[]"),
  chef: text("chef").notNull().default("Unassigned"),
  chefEmail: text("chef_email").notNull().default(""),
  packageName: text("package_name").notNull().default("Weekly"),
  location: text("location").notNull().default(""),
  status: text("status").notNull().default("scheduled"),
  chefPayCents: integer("chef_pay_cents").notNull().default(0),
  notes: text("notes").notNull().default(""),
  /** meal_prep | private_dinner | catering */
  serviceType: text("service_type").notNull().default("meal_prep"),
  guestCount: integer("guest_count").notNull().default(0),
  /** Who the chef calls on the day (copied from the request when there's no account). */
  contactName: text("contact_name").notNull().default(""),
  contactPhone: text("contact_phone").notNull().default(""),
  /** Full street address for this visit. */
  address: text("address").notNull().default(""),
  accessNotes: text("access_notes").notNull().default(""),
  /** The website request this visit came from, if any. */
  inquiryId: integer("inquiry_id").notNull().default(0),
  /** Visits created together as a weekly repeat share this id. */
  seriesId: text("series_id").notNull().default(""),
  /** What the customer pays for the service (meal prep package price, or dinner total). */
  priceCents: integer("price_cents").notNull().default(0),
  /** Grocery receipt total entered by the chef at the end of a meal prep visit. */
  groceryCents: integer("grocery_cents").notNull().default(0),
  receiptKey: text("receipt_key").notNull().default(""),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const chefTimeEntries = sqliteTable("chef_time_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chefEmail: text("chef_email").notNull(),
  scheduleEventId: integer("schedule_event_id").notNull().default(0),
  activityType: text("activity_type").notNull(),
  label: text("label").notNull(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at").notNull().default(""),
  mileageHundredths: integer("mileage_hundredths").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const legalAcceptances = sqliteTable("legal_acceptances", {
  email: text("email").notNull(),
  scope: text("scope").notNull(),
  version: text("version").notNull(),
  acceptedAt: text("accepted_at").notNull(),
}, (table) => [primaryKey({ columns: [table.email, table.scope, table.version] })]);

export const staffProfiles = sqliteTable("staff_profiles", {
  email: text("email").primaryKey(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull().default("active"),
  phone: text("phone").notNull().default(""),
  jobTitle: text("job_title").notNull().default("Chef"),
  hireDate: text("hire_date").notNull().default(""),
  emergencyContact: text("emergency_contact").notNull().default(""),
  foodHandlerExpires: text("food_handler_expires").notNull().default(""),
  foodManagerExpires: text("food_manager_expires").notNull().default(""),
  adminNotes: text("admin_notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const visitCompletions = sqliteTable("visit_completions", {
  scheduleEventId: integer("schedule_event_id").primaryKey(),
  customerEmail: text("customer_email").notNull(),
  chefEmail: text("chef_email").notNull(),
  countersClean: integer("counters_clean", { mode: "boolean" }).notNull().default(false),
  sinkClean: integer("sink_clean", { mode: "boolean" }).notNull().default(false),
  trashHandled: integer("trash_handled", { mode: "boolean" }).notNull().default(false),
  appliancesOff: integer("appliances_off", { mode: "boolean" }).notNull().default(false),
  notes: text("notes").notNull().default(""),
  completedAt: text("completed_at").notNull(),
});

export const visitPhotos = sqliteTable("visit_photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleEventId: integer("schedule_event_id").notNull(),
  customerEmail: text("customer_email").notNull(),
  chefEmail: text("chef_email").notNull(),
  photoType: text("photo_type").notNull(),
  dishTitle: text("dish_title").notNull().default(""),
  objectKey: text("object_key").notNull(),
  contentType: text("content_type").notNull(),
  createdAt: text("created_at").notNull(),
});

export const privateChefInquiries = sqliteTable("private_chef_inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  preferredDate: text("preferred_date").notNull(),
  guestCount: integer("guest_count").notNull().default(2),
  location: text("location").notNull(),
  occasion: text("occasion").notNull().default(""),
  details: text("details").notNull().default(""),
  status: text("status").notNull().default("new"),
  adminNotes: text("admin_notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  /** private_chef | catering | meal_prep. The table name predates catering and meal prep. */
  inquiryType: text("inquiry_type").notNull().default("private_chef"),
  zip: text("zip").notNull().default(""),
  packageName: text("package_name").notNull().default(""),
  serviceFor: text("service_for").notNull().default(""),
  /** Hashed requester address, used only for rate limiting. */
  sourceHash: text("source_hash").notNull().default(""),
  /** When the owner notification email was accepted by the mail provider. */
  notifiedAt: text("notified_at").notNull().default(""),
});

/** One-time sign-in links. Only a SHA-256 hash of the token is stored. */
export const authTokens = sqliteTable("auth_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  email: text("email").notNull(),
  returnTo: text("return_to").notNull().default("/"),
  /** Hashed requester address, for rate limiting only. */
  sourceHash: text("source_hash").notNull().default(""),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at").notNull().default(""),
});

/** Signed-in sessions. The cookie holds a random id; only its SHA-256 hash is stored. */
export const authSessions = sqliteTable("auth_sessions", {
  idHash: text("id_hash").primaryKey(),
  email: text("email").notNull(),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
});

/** Small owner-controlled settings (e.g. today's Sunday Market status). */
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
  updatedBy: text("updated_by").notNull().default(""),
});

/** Customer reviews. Nothing is shown publicly until the owner approves it. */
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerEmail: text("customer_email").notNull(),
  displayName: text("display_name").notNull(),
  town: text("town").notNull().default(""),
  service: text("service").notNull().default(""),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  /** pending | approved | hidden */
  status: text("status").notNull().default("pending"),
  /** True when the reviewer has a completed Driftline visit on record. */
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  reviewedAt: text("reviewed_at").notNull().default(""),
});

/**
 * Money owed for a visit or a proposal. A row is created before anything is
 * sent to Square, so every charge attempt is recorded and never repeated by accident.
 */
/**
 * Indexes that matter for money live in drizzle/0013 (hand-written, keep them if
 * this migration is ever regenerated): payments_idempotency_key (unique) and
 * payments_one_visit_charge (unique partial: one visit_charge per visit).
 */
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleEventId: integer("schedule_event_id").notNull().default(0),
  customerEmail: text("customer_email").notNull(),
  /** visit_charge (card on file) | pay_link (Square checkout link) */
  kind: text("kind").notNull(),
  description: text("description").notNull(),
  serviceCents: integer("service_cents").notNull().default(0),
  groceryCents: integer("grocery_cents").notNull().default(0),
  amountCents: integer("amount_cents").notNull(),
  /** pending | processing | paid | failed | unknown (Square didn't confirm) | link_sent | canceled */
  status: text("status").notNull().default("pending"),
  idempotencyKey: text("idempotency_key").notNull(),
  squarePaymentId: text("square_payment_id").notNull().default(""),
  squareOrderId: text("square_order_id").notNull().default(""),
  squareLinkId: text("square_link_id").notNull().default(""),
  linkUrl: text("link_url").notNull().default(""),
  receiptUrl: text("receipt_url").notNull().default(""),
  error: text("error").notNull().default(""),
  createdBy: text("created_by").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  paidAt: text("paid_at").notNull().default(""),
});

/** A customer's Square profile and saved card. Card numbers never touch Driftline; only Square's ids. */
export const billingProfiles = sqliteTable("billing_profiles", {
  email: text("email").primaryKey(),
  squareCustomerId: text("square_customer_id").notNull(),
  cardId: text("card_id").notNull().default(""),
  cardBrand: text("card_brand").notNull().default(""),
  cardLast4: text("card_last4").notNull().default(""),
  cardExpMonth: integer("card_exp_month").notNull().default(0),
  cardExpYear: integer("card_exp_year").notNull().default(0),
  /** Customer agreed to be charged after each completed visit. */
  autopayConsentAt: text("autopay_consent_at").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});
