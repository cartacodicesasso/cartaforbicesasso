# Carta forbice sasso multiplayer online

## Ultimo step

Possiamo creare e distruggere gruppi e partite.

## Prossimo step

Potremo unirci a una partita esistente se ha un solo giocatore.

## Descrizione

Carta forbice sasso multiplayer. Back-end .NET, front-end React, model sul server.

## Flusso

1. Entri
2. Ti viene generato un codice partita
3. Lo passi a un amico che entra
4. Scegli una mossa
5. L'altro sceglie una mossa
6. Viene assegnato un punto
7. Torna a 4.

Partite al meglio di 7.

## Requisiti

- [ ] Dev'esserci una pagina `/` che mostra il matchId
- [ ] Dev'esserci una pagina `/?match={matchId}` che accede alla partita
- [ ] Se la partita contiene già due giocatori, cicciah
- [ ] Il primo che arriva a 4 punti vince

## Requisiti interni

- [x] Deve esistere un model `Match` con la seguente struttura
    - Id
    - Player1
    - Player2
    - Score1
    - Score2
    - Player1CurrentMove
    - Player2CurrentMove
- [x] Deve esistere un `MatchContext : DbContext`
- [x] MatchContext deve avere un `DbSet<Match>`
- [x] Deve esistere un `MatchHub : Hub`
- [x] Deve esistere un metodo `MatchHub.SendMove`
- [ ] Il metodo _SendMove_ deve ricevere i seguenti parametri
    - _Player_ che fa la mossa
    - _Mossa_ inviata
- [ ] Il metodo _SendMove_ salva la mossa e se già presente un'altra, assegna il punteggio e azzera le mosse