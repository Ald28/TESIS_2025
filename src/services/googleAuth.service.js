const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_WEB);

const verifyGoogleToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID_WEB,
  });

  const payload = ticket.getPayload();
  return {
    nombre: payload.given_name,
    apellido: payload.family_name,
    correo: payload.email,
    picture: payload.picture
  };
};

module.exports = { verifyGoogleToken };