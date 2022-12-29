exports.up = async function (knex) {
  await knex.schema
    .raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
    .createTable('users', table => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('username').notNullable();
      table.string('discord_id').unique().notNullable();
      table.string('avatar').notNullable();
      table.timestamps(true, true);
    });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('user');
};
