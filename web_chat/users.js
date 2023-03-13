const users = []

// Join user to chat
const userConnect = (socketId, userName) => {
  const user = { socketId, userName }

  users.push(user)

  return user
}

// Disconect user from chat
const userDisconnect = (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId)

  //  -1 means that the user was not found
  if (index === -1) return

  // splice returns an array with the removed element
  const user = users.splice(index, 1)[0]
  return user
}

module.exports = {
  userConnect,
  userDisconnect
}
