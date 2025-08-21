import { relations } from 'drizzle-orm';
import { date, pgEnum, pgTable, uuid, varchar, integer } from 'drizzle-orm/pg-core';


//User Schema
export const userRole = pgEnum("user_role", ['vendor', 'customer']);
export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }),
  role: userRole("role").notNull().default('customer'),
  createdAt: date().notNull().defaultNow(),
})
//User Relations
export const userRelation = relations(usersTable, ({ one }) => ({
  vendor: one(vendorsTable),
}))



//Vendors Schema
export const vendorsTable = pgTable('vendors', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  storeName: varchar({ length: 255 }).notNull(),
  createdAt: date({ mode: 'date' }).notNull().defaultNow()
})
//Vendors Relations
export const vendorRelation = relations(vendorsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [vendorsTable.userId],
    references: [usersTable.id]
  }),
  product: many(productsTable)
}))


//Category Schema
export const categoryTable = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryName: varchar({ length: 255 }).notNull()
})
//Category Relations
export const categoryRelation = relations(categoryTable, ({ many }) => ({
  product: many(productsTable)
}))

//Products Schema
export const productsStatus = pgEnum('product_status', ['active', 'inactive']);
export const productsTable = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: uuid("vendors_id").notNull().references(() => vendorsTable.id, { onDelete: 'cascade' }),
  ProductName: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
  stock: integer().notNull(),
  status: productsStatus('status').notNull().default('active'),
  categoryId: uuid('category_id').notNull().references(() => categoryTable.id),
  createdAt: date().notNull().defaultNow()
})
//Product Relations
export const productRelation = relations(productsTable, ({ one }) => ({
  category: one(categoryTable, {
    fields: [productsTable.categoryId],
    references: [categoryTable.id]
  }),
  vendor: one(vendorsTable, {
    fields: [productsTable.vendorId],
    references: [vendorsTable.id]
  }),
  orderitems: many(ordersItemsTable),
  cartitems: many(cartsItemsTable)
}))
