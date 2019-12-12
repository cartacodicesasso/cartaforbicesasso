document.addEventListener('DOMContentLoaded', () => {
  const connection = new signalR.HubConnectionBuilder().withUrl('/socket').build()
  const query = window.location.search.substring(1)
  .split('&')
  .map(fragment => fragment.split('='))
  .reduce((res, [key, value]) => Object.assign(res, {
    [key]: value
  }), {})
  
  connection.start()
  .then(() => {
    if (query.match) {
      connection
      .invoke('JoinMatch', query.match)
      .catch(e => console.log(e))
      
      connection.on('BeginMatch', () => {
        console.log('Match started!')
      })
    } else {
      connection
      .invoke('CreateMatch')
      .catch(e => console.log(e))
      
      connection.on('MatchCreated', matchId => {
        console.log(`TODO: Should show to the user the match ID: ${matchId}`)

        connection.on('BeginMatch', () => {
          console.log('Match started!')
        })
      })
    }
    
    connection.on('Error', error => {  
      switch (error) {
        case 'MatchNotFound':
          console.log('Match not found')
          break
        case 'MatchCreationFailed':
          console.log('Match creation failed')
          break
        default:
          console.log('Unknown error')
          console.log(error.toString())
          break
      }
    })
  })
  .catch(e => console.log(e))
})
