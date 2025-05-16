// backend/middleware/auth.js
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

exports.authenticate = (req, res, next) => {
  // 1) if this is the login/signup route, let it through
  if (req.path.startsWith('/api/auth')) {
    return next()
  }

  // 2) if it's not an API call at all (i.e. serving React), let it through
  //    (optional—if you guard your static routes separately you can skip this)
  if (!req.path.startsWith('/api/')) {
    return next()
  }

  // 3) otherwise, expect an Authorization header
  const header = req.headers.authorization
  if (!header) {
    return res.status(401).json({ error: 'Missing token' })
  }

  const parts = header.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Malformed token' })
  }

  const token = parts[1]
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// you can leave authorize exactly as is, it only runs if you choose to use it
exports.authorize = (roles) => (req, res, next) => {
  next()
}
