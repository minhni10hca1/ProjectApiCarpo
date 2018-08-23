import security from '../config/security';

exports.getRole = function getRole(checkRole) {
  let role;

  switch (checkRole) {
    case security.ROLE_CARADS: role = 4; break;
    case security.ROLE_ADMIN: role = 3; break;
    case security.ROLE_MANAGER: role = 2; break;
    case security.ROLE_CLIENT: role = 1; break;
    default: role = 1;
  }

  return role;
};
