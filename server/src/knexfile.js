const { knexSnakeCaseMappers } = require('objection');

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/discord-oauth2',
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    ...knexSnakeCaseMappers()
  }
};
