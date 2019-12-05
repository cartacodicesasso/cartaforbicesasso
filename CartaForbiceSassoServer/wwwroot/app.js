document.addEventListener('DOMContentLoaded', () => {
  const connection = new signalR.HubConnectionBuilder().withUrl('/match').build()
  
  connection.start()
  .then(() => {
    connection
    .invoke('CreateMatch')
    .then(() => console.log('done'))
    .catch(err => console.error(err))
  })
  .catch(err => console.error(err))
})
