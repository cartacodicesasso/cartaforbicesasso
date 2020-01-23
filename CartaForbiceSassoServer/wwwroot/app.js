document.addEventListener('DOMContentLoaded', () => {
  const buttonCopyMatchId = document.getElementById('copy-match-id')
  const formJoinMatch = document.getElementById('join-match-form')
  
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
        document.body.className = 'match-started-container'
        showToastMessage('Match started!')
      })
    } else {
      document.body.className = 'before-match-creation-container'

      connection
      .invoke('CreateMatch')
      .catch(e => console.log(e))
      
      connection.on('MatchCreated', matchId => {
        document.body.className = 'match-created-container'

        buttonCopyMatchId && buttonCopyMatchId.addEventListener('click', e => {
          navigator.clipboard
          .writeText(`${location.origin}?match=${matchId}`)
          .then(
            () => showToastMessage('Link copiato')
          )
        })

        formJoinMatch && formJoinMatch.addEventListener('submit', e => {
          e.preventDefault()

          const url = formJoinMatch['match-id'].value
          url && window.open(url)
        })

        connection.on('BeginMatch', () => {
          document.body.className = 'match-started-container'
          showToastMessage('Match started!')
        })
      })
    }
    
    connection.on('Error', error => {  
      let msg = ''
      
      switch (error) {
        case 'MatchNotFound':
          msg = 'Match not found'
          break
        case 'MatchCreationFailed':
          msg = 'Match creation failed'
          break
        case 'Cicciah':
          msg = 'Match is full of cicciah'
          break
        default:
          msg = `Unknown error: ${error.toString()}`
          break
      }

      showToastMessage(msg, undefined, true)
    })
  })
  .catch(e => console.log(e))

  const toastDiv = document.getElementById('error-toast')
  
  function showToastMessage(msg, time = 5000, isError = false) {
    toastDiv.classList.add('visible')
    isError && toastDiv.classList.add('error')
    toastDiv.firstElementChild.innerHTML = msg

    setTimeout(() => {
      toastDiv.classList.remove('visible')
      isError && toastDiv.classList.remove('error')
    }, time)
  }
})
