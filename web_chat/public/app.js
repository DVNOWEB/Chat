const socket = io()

const chatForm = document.querySelector('#chat_form')
const chatMessage = document.querySelector('#chat_message')
const messages = document.querySelector('.messages')
const feedback = document.querySelector('#feedback')
const chatWindow = document.querySelector('.chat_window')


// create a new user and emit it to the server
const userName = new URLSearchParams(window.location.search).get('username')

document.querySelector('#me').innerText = userName

//  NodeJS events

// when we connect to the server
socket.on('connect', () => {
  socket.emit('user', userName)
})


// when a new user connects to the server
socket.on('userConnection', (data) => {
  // create a new user feedback message element
  messages.append(createElement('p', 'inline_feedback', data))
  
  chatWindow.scrollTop = chatWindow.scrollHeight
})

// when someone is typing a message
socket.on('typing', (data) => {
  // remove the d-none class from the feedback element
  feedback.classList.remove('d_none')
  // set the text of the feedback element
  feedback.innerText = `${data} is typing...`

  // set timeout to clear the feedback text after 3 seconds
  setTimeout(() => {
    feedback.classList.add('d_none')
    feedback.innerText = ''
  }, 3000)
})

// when someone stops typing a message
socket.on('stoppedTyping', () => {
  // add the d-none class to the feedback element
  feedback.classList.add('d_none')
  // clear the text of the feedback element
  feedback.innerText = ''
})


// when someone sends a message
socket.on('newMessage', data => {
  // create a new message element div
  const message_div = createElement('div', 'single_message')

  // when the message is from the current user is sent from the right
  if (data.id === socket.id) message_div.classList.add('right')

  // create a new message element p
  const messageName_p = createElement('p', 'single_message_name', data.userName)
  // const messageText_p = createElement('p', 'single_message_msg', data.message)

  // Add timestamp to the message text
  const timestamp = new Date().toLocaleTimeString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    // hour12: true,
  })
  const messageText_p = createElement(
    'p',
    'single_message_msg',
    `${data.message}`
  )

  // create a new parent element to hold the message and the timestamp
  const messageContentDiv = createElement('div')
  // append the message and the timestamp to the parent element
  messageContentDiv.append(
    messageText_p,
    createElement('p', 'message_timestamp', `${timestamp}`)
  )

  // append the p elements to the div
  message_div.append(messageName_p, messageText_p, messageContentDiv)
  messages.append(message_div)

  // add the d-none class to the feedback element
  feedback.classList.add('d_none')
  // clear the text of the feedback element
  feedback.innerText = ''

  // scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight
})


// Submit listener
// when we submit the form
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  if(chatMessage.value.trim() === '') return

  socket.emit('message', {
    id: socket.id,
    message: chatMessage.value,
    userName
  })

  // empty the input and focus it again
  chatMessage.value = ''
  chatMessage.focus()
})

// listener for when someone typing a message
chatMessage.addEventListener('keyup', () => {
  if(chatMessage.value.length > 0) socket.emit('typing', userName)
  else socket.emit('stoppedTyping')
})


// helpers

// build a message element
const createElement = (type, className, text) => {
  const element = document.createElement(type)
  element.className = className ? className : ''
  element.innerText = text ? text : ''

  return element
}