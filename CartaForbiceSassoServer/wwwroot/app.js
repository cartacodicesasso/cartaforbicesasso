document.addEventListener('DOMContentLoaded', () => {
  const connection = new signalR.HubConnectionBuilder().withUrl('/match').build()
  const sendButton = document.getElementById('sendButton')

  if (!sendButton) {
    return
  }

  sendButton.disabled = true

  connection.on('ReceiveMove', function (player, move) {
    const msg = move.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const encodedMsg = `${player} moves ${msg}`
    const li = document.createElement('li')

    li.textContent = encodedMsg
    document.getElementById('moves').appendChild(li)
  })

  connection.start()
  .then(() => sendButton.disabled = false)
  .catch(err => console.error(err.toString()))

  sendButton.addEventListener('click', e => {
    e.preventDefault()

    const user = document.getElementById('userInput').value
    const message = document.getElementById('messageInput').value

    connection.invoke('SendMove', user, message)
    .catch(err => console.error(err.toString()))
  })
})
