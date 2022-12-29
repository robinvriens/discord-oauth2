require('dotenv').config();
const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const axios = require('axios');
const { sign } = require('jsonwebtoken');
const db = require('./db');
const authenticate = require('./middlewares/authenticate');

const app = new Koa();
const router = new Router();

app.use(
  cors({
    credentials: true
  })
);
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

router.use(authenticate);

router.get('/user/me', async ctx => {
  ctx.body = ctx.state.user;
});

router.get('/auth/discord/login', async ctx => {
  const url =
    'https://discord.com/api/oauth2/authorize?client_id=1057732287862685796&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fdiscord%2Fcallback&response_type=code&scope=identify';

  ctx.redirect(url);
});

router.get('/auth/discord/callback', async ctx => {
  if (!ctx.query.code) throw new Error('Code not provided.');

  const { code } = ctx.query;
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept-Encoding': 'application/x-www-form-urlencoded'
  };

  const response = await axios.post(
    'https://discord.com/api/oauth2/token',
    params,
    {
      headers
    }
  );

  const userResponse = await axios.get('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${response.data.access_token}`,
      ...headers
    }
  });

  const { id, username, avatar } = userResponse.data;

  const checkIfUserExists = await db('users').where({ discordId: id }).first();

  if (checkIfUserExists) {
    await db('users').where({ discordId: id }).update({ username, avatar });
  } else {
    await db('users').insert({ discordId: id, username, avatar });
  }

  const token = await sign({ sub: id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  ctx.cookies.set('token', token);
  ctx.redirect(process.env.CLIENT_REDIRECT_URL);
});

app.listen(4000);
