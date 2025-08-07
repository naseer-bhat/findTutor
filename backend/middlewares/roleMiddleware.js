export const setRole = (role) => {
  return (req, res, next) => {
    req.body.roles = role;
    next();
  };
};

export const allow = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
};
