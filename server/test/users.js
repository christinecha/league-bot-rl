const adminUser = {
  id: 'cha',
  permissions: ['ADMINISTRATOR'],
}

const plebUser = {
  id: 'noodle',
  permissions: [],
}

const bronzeUser = {
  id: 'hollywood',
  roles: [{ name: 'Bronze' }],
}

const silverUser = {
  id: 'space',
  roles: [{ name: 'Silver' }],
}

const goldUser = {
  id: 'gerwin',
  roles: [{ name: 'Gold' }],
}

const platUser = {
  id: 'heater',
  roles: [{ name: 'Plat' }],
}

const diamondUser = {
  id: 'flips',
  roles: [{ name: 'Diamond' }],
}

const champUser = {
  id: 'racoon',
  roles: [{ name: 'Champ' }],
}

module.exports = {
  adminUser,
  plebUser,
  bronzeUser,
  silverUser,
  goldUser,
  platUser,
  diamondUser,
  champUser,
}
