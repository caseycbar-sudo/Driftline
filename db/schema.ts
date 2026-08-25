import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
