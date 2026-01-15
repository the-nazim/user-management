module.exports = function(...allowedRoles) {
    return (req, res, next) => {
        if(!req.user)
            return res.status(401).json({ message: "No user info, access denied" });
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: You don't have the required role" });
        }
        next();
    }
}