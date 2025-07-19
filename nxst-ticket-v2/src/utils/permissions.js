function isTicketOwnerOrStaff(member, ticketOwnerId, rolesStaff) {
  return member.id === ticketOwnerId || member.roles.cache.some(r => rolesStaff.includes(r.id));
}

module.exports = { isTicketOwnerOrStaff };
