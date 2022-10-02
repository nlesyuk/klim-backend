const categories = ['work', 'shot', 'photo', 'slider', 'photos', 'contact']

const sitesByUserId = {
  'klimstepan.com': 1, // userId in DB
  'derzhanovska.com': 2,
}

const users = [
  {
    id: 1,
    domain: 'klimstepan.com',
  },
  {
    id: 2,
    domain: 'derzhanovska.com',
  }
]

module.exports = {
  categories,
  sitesByUserId,
  users
}