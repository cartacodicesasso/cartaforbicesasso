document.addEventListener('DOMContentLoaded', () => {
  const elBeforeMatchCreation = document.getElementById('before-match-creation')
  const elMatchCreated = document.getElementById('match-created')
  const buttonCopyMatchId = document.getElementById('copy-match-id')
  const formJoinMatch = document.getElementById('join-match-form')
  const elJoinMatch = document.getElementById('join-match')

  if (!elBeforeMatchCreation || !elMatchCreated || !buttonCopyMatchId || !formJoinMatch || !elJoinMatch) {
    return
  }
  
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
        elJoinMatch.style.display = 'none'
        console.log('Match started!')
      })
    } else {
      elBeforeMatchCreation.style.display = 'block'

      connection
      .invoke('CreateMatch')
      .catch(e => console.log(e))
      
      connection.on('MatchCreated', matchId => {
        elBeforeMatchCreation.style.display = 'none'
        elMatchCreated.style.display = 'block'

        buttonCopyMatchId.addEventListener('click', e => {
          navigator.clipboard
          .writeText(`${location.origin}?match=${matchId}`)
          .then(
            () => alert('Link copiato') // TODO: temporary
          )
        })

        formJoinMatch.addEventListener('submit', e => {
          e.preventDefault()

          const url = formJoinMatch['match-id'].value
          url && window.open(url)
        })

        connection.on('BeginMatch', () => {
          elBeforeMatchCreation.style.display = 'none'
          elMatchCreated.style.display = 'none'
          elJoinMatch.style.display = 'none'
          
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
        case 'Cicciah':
          console.log('Match is full of cicciah')
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
