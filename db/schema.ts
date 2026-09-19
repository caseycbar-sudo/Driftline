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
