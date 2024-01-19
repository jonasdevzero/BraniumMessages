import { Kysely, sql } from 'kysely';
import { Database } from '../types/Database';

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.createTable('profile')
		.ifNotExists()
		.addColumn('id', 'uuid', (col) => col.primaryKey())
		.addColumn('username', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('image', 'text')
		.addColumn('createdAt', 'timestamp', (col) =>
			col.defaultTo(sql`now()`).notNull()
		)
		.addColumn('updatedAt', 'timestamp', (col) =>
			col.defaultTo(sql`now()`).notNull()
		)
		.execute();

	await db.schema
		.createTable('invite')
		.ifNotExists()
		.addColumn('id', 'uuid', (col) => col.primaryKey())
		.addColumn('senderId', 'uuid', (col) => col.notNull())
		.addColumn('receiverId', 'uuid', (col) => col.notNull())
		.addColumn('message', 'text')
		.addForeignKeyConstraint(
			'fk_invite_sender',
			['senderId'],
			'profile',
			['id'],
			(cb) => cb.onUpdate('cascade').onDelete('cascade')
		)
		.addForeignKeyConstraint(
			'fk_invite_receiver',
			['receiverId'],
			'profile',
			['id'],
			(cb) => cb.onUpdate('cascade').onDelete('cascade')
		)
		.execute();

	await db.schema
		.createTable('contact')
		.ifNotExists()
		.addColumn('userId', 'uuid', (col) => col.notNull())
		.addColumn('contactId', 'uuid', (col) => col.notNull())
		.addColumn('name', 'text')
		.addColumn('blocked', 'boolean', (col) => col.notNull().defaultTo(false))
		.addColumn('createdAt', 'timestamp', (col) =>
			col.notNull().defaultTo(sql`now()`)
		)
		.addPrimaryKeyConstraint('pk_contact', ['userId', 'contactId'])
		.addForeignKeyConstraint(
			'fk_contact_user',
			['userId'],
			'profile',
			['id'],
			(cb) => cb.onUpdate('cascade').onDelete('cascade')
		)
		.addForeignKeyConstraint(
			'fk_contact_contact',
			['contactId'],
			'profile',
			['id'],
			(cb) => cb.onUpdate('cascade').onDelete('cascade')
		)
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.dropTable('invite').ifExists().execute();
	await db.schema.dropTable('contact').ifExists().execute();
	await db.schema.dropTable('profile').ifExists().execute();
}
