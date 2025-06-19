// Updated routes/auth.js
const auth = require('../middlewares/auth');
  const { toggle2FA } = require('../controllers/authController');
async function routes(fastify, options) {
  const { signUp, login, getProfile, verify2FA} = require('../controllers/authController');
  const verifyEmail = require("../controllers/verifyEmail");
  const tournament = require('../controllers/tournamentController');
  // Public routes
  fastify.post('/signup', signUp);
  fastify.post('/login', login);
  fastify.post('/verify-2fa', verify2FA); // New route for 2FA verification

fastify.patch('/profile/2fa', { preHandler: [auth] }, toggle2FA);

    // Tournament routes
  fastify.post('/tournament/start', tournament.startTournament);
  fastify.post('/tournament/record-winner', tournament.recordWinner);
  fastify.post('/tournament/next-round', tournament.nextRound);
  fastify.get('/tournament/matches', tournament.getMatches);
  // Protected routes
  fastify.get('/profile', { preHandler: auth }, getProfile);
  
  // Health check route
  fastify.get('/health', async (request, reply) => {
    return { status: 'OK', message: 'API is running' };
  });
fastify.patch('/profile', { preHandler: [auth] }, async (req, reply) => {
  const userId = req.user.id;
  const parts = req.parts();
  const fields = {};
  let avatarFile;

  for await (const part of parts) {
    if (part.type === 'file' && part.fieldname === 'avatar') {
      avatarFile = part;
    } else if (part.type === 'field') {
      fields[part.fieldname] = part.value;
    }
  }

  const { name, email, password } = fields;

  // Basic validation
  if (!name || !email) {
    return reply.status(400).send({ error: 'Name and email are required.' });
  }

  const updatePayload = {
    name,
    email,
  };

  if (password && password.length >= 7) {
    const bcrypt = require('bcryptjs');
    updatePayload.password = await bcrypt.hash(password, 8);
  }

  if (avatarFile) {
    const fs = require('fs');
    const path = require('path');
    const uploadPath = path.join(__dirname, '..', 'uploads', `${userId}_${avatarFile.filename}`);
    const ws = fs.createWriteStream(uploadPath);
    await avatarFile.file.pipe(ws);
    updatePayload.avatar = `/uploads/${userId}_${avatarFile.filename}`;
  }

  const db = require('../db/database');
  const columns = Object.keys(updatePayload)
    .map(key => `${key} = ?`)
    .join(', ');
  const values = Object.values(updatePayload);
  values.push(userId);

  const sql = `UPDATE users SET ${columns} WHERE id = ?`;

return new Promise((resolve, reject) => {
  const db = require('../db/database');

  // First check if email is taken by someone else
  db.get(`SELECT id FROM users WHERE email = ? AND id != ?`, [email, userId], (err, emailRow) => {
    if (err) {
      req.log.error(err);
      return reply.status(500).send({ error: 'Database error while checking email.' });
    }

    if (emailRow) {
      return reply.status(400).send({ error: 'Email is already in use by another account.' });
    }

    // Then check if name is taken by someone else
    db.get(`SELECT id FROM users WHERE name = ? AND id != ?`, [name, userId], (err, nameRow) => {
      if (err) {
        req.log.error(err);
        return reply.status(500).send({ error: 'Database error while checking display name.' });
      }

      if (nameRow) {
        return reply.status(400).send({ error: 'Display name is already taken.' });
      }

      // If both checks passed, update user
      db.run(sql, values, function (err) {
        if (err) {
          req.log.error(err);
          return reply.status(500).send({ error: 'Failed to update user.' });
        }

        db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, userRow) => {
          if (err) {
            req.log.error(err);
            return reply.status(500).send({ error: 'Failed to fetch updated user.' });
          }

          return reply.send({ message: 'Profile updated.', user: userRow });
        });
      });
    });
  });
});

});


fastify.post('/logout', { preHandler: auth }, async (request, reply) => {
  const userId = request.user.id;
  request.server.onlineUsers.delete(userId); // ⬅ Remove from online list
  return reply.send({ message: 'Logged out successfully.' });
});


  // Email verification route
  fastify.get('/verify-email', verifyEmail);
}

module.exports = routes;