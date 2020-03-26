# Carta forbice sasso multiplayer online

## Ultimo step

Abbiamo finito il gameplay

## Prossimo step

- Check
- Go-live

🖐️✌️👊

## Descrizione

Carta forbice sasso multiplayer. Back-end .NET, front-end vanilla, model sul server.

## Flusso

1. Entri
2. Ti viene generato un codice partita
3. Lo passi a un amico che entra
4. Scegli una mossa
5. L'altro sceglie una mossa
6. Viene assegnato un punto
7. Torna a 4.

Partite al meglio di 7.

## Gameplay

> Definizione:
> - io-player: il giocatore che sta giocando
> - tu-player: il suo avversario

### UI

- [x] La UI dev'essere divisa in due righe
- [x] Il tu-player è nella riga sopra
- [x] Per ogni player, dev'esserci il punteggio corrente
- [x] Sull'io-player, dev'esserci una pulsantiera per scegliere la mossa

### Flusso

- [x] Ogni player sceglie la sua mossa
- [x] Alla scelta della mossa, i pulsanti si congelano
- [x] Quando entrambi hanno scelto la mossa, viene mostrato il risultato e i pulsanti si scongelano

## Requisiti

- [x] Dev'esserci una pagina `/` che mostra il matchId
- [x] Dev'esserci una pagina `/?match={matchId}` che accede alla partita
- [x] Se la partita contiene già due giocatori, cicciah
- [x] Il primo che arriva a 0 cuori perde

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
- [x] Il metodo _SendMove_ deve ricevere i seguenti parametri
    - _Mossa_ inviata
- [x] Il metodo _SendMove_ salva la mossa e se già presente un'altra, assegna il punteggio e azzera le mosse
