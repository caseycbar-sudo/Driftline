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
