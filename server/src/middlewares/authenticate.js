const db = require('../db');
const { verify } = require('jsonwebtoken');

module.exports = async (ctx, next) => {
  const token = ctx.cookies.get('token');
  console.log(token);

  try {
    const { sub } = await verify(token, process.env.JWT_SECRET);
    ctx.state.user = await db('users').where({ discordId: sub }).first();
  } catch (e) {
    ctx.state.user = null;
  }

  await next();
};
