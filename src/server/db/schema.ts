import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

export const clinics = sqliteTable('clinics', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  createdBy: text('created_by'),
  licence: text('licence'),
  paymentDate: integer('payment_date', { mode: 'timestamp' }),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active'),
});

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  clinicId: text('clinic_id').references(() => clinics.id),
  role: text('role', { enum: ['doctor', 'assistant'] }).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  // Add the hashed PIN field - we'll store it hashed for security
  pinHash: text('pin_hash').notNull(),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active'),
  lastLogin: integer('last_login', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const patients = sqliteTable('patients', {
  id: text('id').primaryKey(),
  clinicId: text('clinic_id').references(() => clinics.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  address: text('address'),
  dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }),
  gender: text('gender', { enum: ['male', 'female', 'other'] }),
  phoneNumber: text('phone_number'),
  cin: text('cin'),
  email: text('email'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  cinIdx: uniqueIndex('cin_idx').on(table.cin),
}));

export const appointments = sqliteTable('appointments', {
  id: text('id').primaryKey(),
  doctorId: text('doctor_id').references(() => profiles.id),
  clinicId: text('clinic_id').references(() => clinics.id),
  patientId: text('patient_id').references(() => patients.id),
  recurrencePattern: text('recurrence_pattern', { enum: ['daily', 'weekly', 'monthly', 'none'] }),
  status: text('status', { enum: ['scheduled', 'completed', 'cancelled', 'no-show'] }).default('scheduled').notNull(),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).default(false),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  note: text('note'),
  reason: text('reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const stock = sqliteTable('stock', {
  id: text('id').primaryKey(),
  clinicId: text('clinic_id').references(() => clinics.id),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull().default(0),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  createdBy: text('created_by').references(() => profiles.id),
});

export const stockHistory = sqliteTable('stock_history', {
  id: text('id').primaryKey(),
  clinicId: text('clinic_id').references(() => clinics.id),
  doctorId: text('doctor_id').references(() => profiles.id),
  patientId: text('patient_id').references(() => patients.id),
  productId: text('product_id').references(() => stock.id),
  quantity: integer('quantity').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const prescriptions = sqliteTable('prescriptions', {
  id: text('id').primaryKey(),
  doctorId: text('doctor_id').references(() => profiles.id),
  clinicId: text('clinic_id').references(() => clinics.id),
  patientId: text('patient_id').references(() => patients.id),
  imageUrl: text('image_url'),
  note: text('note'),
  stockReferenceIds: text('stock_reference_ids'), // Stored as JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const medicalRecords = sqliteTable('medical_records', {
  id: text('id').primaryKey(),
  clinicId: text('clinic_id').references(() => clinics.id),
  patientId: text('patient_id').references(() => patients.id),
  imagesUrl: text('images_url'), // Stored as JSON string
  recordType: text('record_type', { enum: ['general', 'lab', 'imaging', 'prescription'] }).notNull(),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => profiles.id),
  type: text('type', { enum: ['appointment', 'stock', 'system'] }).notNull(),
  message: text('message').notNull(),
  sentAt: integer('sent_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  status: text('status', { enum: ['pending', 'sent', 'read', 'failed'] }).default('pending').notNull(),
});

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  action: text('action', { enum: ['create', 'update', 'delete'] }).notNull(),
  changedData: text('changed_data'), // Stored as JSON string
  performedBy: text('performed_by').references(() => profiles.id),
  performedAt: integer('performed_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

