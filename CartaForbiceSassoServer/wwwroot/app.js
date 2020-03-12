document.onselectstart = () => false;
document.oncontextmenu = () => false;
document.ondragstart = () => false;

document.addEventListener('DOMContentLoaded', () => {
  const buttonCopyMatchId = document.getElementById('copy-match-id')
  const formJoinMatch = document.getElementById('join-match-form')
  const youPlayerMovesEls = document.getElementById('you-player').getElementsByClassName('move')
  const youScoreEl = document.getElementById('you-score')
  const meScoreEl = document.getElementById('me-score')

  const connection = new signalR.HubConnectionBuilder().withUrl('/socket').build()
  const query = window.location.search.substring(1)
  .split('&')
  .map(fragment => fragment.split('='))
  .reduce((res, [key, value]) => Object.assign(res, {
    [key]: value
  }), {})

  let isYouPlayerThinking = false

  connection.start()
  .then(() => {
    if (query.match) {
      connection
      .invoke('JoinMatch', query.match)
      .catch(e => console.log(e))

      connection.on('BeginMatch', () => {
        navigateToPage('game')
        isYouPlayerThinking = true
        requestAnimationFrame(() => messWithYouPlayerMoves())
      })
    } else {
      connection
      .invoke('CreateMatch')
      .catch(e => console.log(e))

      connection.on('MatchCreated', matchId => {
        navigateToPage('match-created')

        buttonCopyMatchId && buttonCopyMatchId.addEventListener('click', _ => {
          navigator.clipboard
          .writeText(`${location.origin}?match=${matchId}`)
          .then(
            () => showToastMessage('Link copiato. Passalo a chi vuoi. Al suo ingresso, la partita comincerà automaticamente.', 0)
          )
        })

        formJoinMatch && formJoinMatch.addEventListener('submit', e => {
          e.preventDefault()

          const url = formJoinMatch['match-id'].value
          url && window.open(url)
        })

        connection.on('BeginMatch', () => {
          navigateToPage('game')
          isYouPlayerThinking = true
          requestAnimationFrame(() => messWithYouPlayerMoves())
        })
      })
    }

    connection.on('RoundResult', (result, meScore, youScore, youMove) => {
      isYouPlayerThinking = false
      
      setTimeout(() => {
        Array.from(youPlayerMovesEls).forEach(el => {
          el.classList.remove('selected')
  
          if (el.id === `you-${youMove}`) {
            el.classList.add('selected')
          }
        })
      }, 100)

      youScoreEl.innerHTML = new Array(youScore).fill('❤').join('')
      meScoreEl.innerHTML = new Array(meScore).fill('❤').join('')

      setTimeout(() => {
        isYouPlayerThinking = true
        messWithYouPlayerMoves()

        movesDiv.classList.remove('move-picked')
        Array.from(movesDiv.children).forEach(e => e.classList.remove('selected'))
      }, 2100)
    })

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

  document.getElementById('toast-close-button').addEventListener(
    'click', () => toastDiv.classList.remove('visible')
  )

  const movesDiv = document.querySelector('#me-player .moves')

  Array.from(movesDiv.children)
  .forEach((move, _, moves) => move.addEventListener('click', () => {
    if (movesDiv.classList.contains('move-picked')) {
      return
    }

    movesDiv.classList.add('move-picked')
    moves.forEach(move => move.classList.remove('selected'))
    move.classList.add('selected')

    connection
    .invoke('SendMove', move.id)
    .catch(e => console.log(e))
  }))

  function messWithYouPlayerMoves() {
    const targetIndex = Math.round(Math.random() * (youPlayerMovesEls.length - 1))

    Array.from(youPlayerMovesEls).forEach((el, index) => {
      el.classList.remove('selected')

      if (index === targetIndex) {
        el.classList.add('selected')
      }
    })

    isYouPlayerThinking && setTimeout(messWithYouPlayerMoves, 100)
  }

  function showToastMessage(msg, time = 5000, isError = false) {
    toastDiv.classList.add('visible')
    isError && toastDiv.classList.add('error')
    toastDiv.firstElementChild.innerHTML = msg

    time && setTimeout(() => {
      toastDiv.classList.remove('visible')
      isError && toastDiv.classList.remove('error')
    }, time)
  }
})

function navigateToPage(pageName) {
  window.location.hash = pageName
}
