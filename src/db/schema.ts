import { relations } from 'drizzle-orm';
import { date, pgEnum, pgTable, uuid, varchar, integer } from 'drizzle-orm/pg-core';


//User Schema
export const userRole = pgEnum("user_role", ['vendor', 'customer']);
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: userRole("role").notNull().default('customer'),
  createdAt: date().notNull().defaultNow(),
})
//User Relations
export const userRelation = relations(usersTable, ({ one, many }) => ({
  vendor: one(vendorsTable),
  cart: one(cartTable),
  order: many(orderTable)
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
export const productRelation = relations(productsTable, ({ one, many }) => ({
  category: one(categoryTable, {
    fields: [productsTable.categoryId],
    references: [categoryTable.id]
  }),
  vendor: one(vendorsTable, {
    fields: [productsTable.vendorId],
    references: [vendorsTable.id]
  }),
  orderitems: many(orderItemsTable),
  cartitems: many(cartItemsTable)
}))



//Cart Schema
export const cartTable = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: date().notNull().defaultNow(),
  userId: uuid('user_id').notNull().references(() => usersTable.id),
})
//Cart Relations
export const cartRelation = relations(cartTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [cartTable.userId],
    references: [usersTable.id]
  }),
  cart_item: many(cartItemsTable),
  order: many(orderTable)
}))



//Cart Items Table
export const cartItemsTable = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  quantity: integer().notNull(),
  cartId: uuid('cart_id').notNull().references(() => cartTable.id),
  productId: uuid('product_id').notNull().references(() => productsTable.id)
})
//Cart Items Relations
export const cartItemsRelation = relations(cartItemsTable, ({ one }) => ({
  cart: one(cartTable, {
    fields: [cartItemsTable.cartId],
    references: [cartTable.id]
  }),
  product: one(productsTable, {
    fields: [cartItemsTable.productId],
    references: [productsTable.id]
  })
}))



//Order Table
export const orderStatus = pgEnum('order_status', ['completed', 'pending'])
export const orderTable = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').notNull().references(() => cartTable.id),
  orderDate: date().notNull().defaultNow(),
  status: orderStatus('status').notNull().default('pending'),
  totalAmount: integer().notNull(),
  userId: uuid('user_id').notNull().references(() => usersTable.id)
})
//Order relations
export const orderRelations = relations(orderTable, ({ many, one }) => ({
  cart: one(cartTable, {
    fields: [orderTable.cartId],
    references: [cartTable.id]
  }),
  user: one(usersTable, {
    fields: [orderTable.userId],
    references: [usersTable.id]
  }),
  order_item: many(orderItemsTable)
}))



//Order Items Table
export const orderItemsTable = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orderTable.id),
  quantity: integer().notNull(),
  price: integer().notNull(),
  productId: uuid('product_id').notNull().references(() => productsTable.id)
})

//Order Items Relations
export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderItemsTable.orderId],
    references: [orderTable.id]
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.productId],
    references: [productsTable.id]
  })
}))
