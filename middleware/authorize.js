export const authorize = (allowedRoles) => (req, res, next) => {
    const userRole = req.user.role;
  
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access Denied' });
    }
  
    next();
  };
  