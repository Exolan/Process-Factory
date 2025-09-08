const socket = io()

socket.on('connect', ()=> {
    console.log('Подключение установлено')
    socket.emit('playerConnect')

    const header = document.querySelector('h1')
    header.innerText += ` ${socket.id}`

})

socket.on('lobbyUpdate', (players)=>{
    const lobbyHeader = document.querySelector('.lobby__header')
    
    let readyPlayers = 0
    const allPlayers = players.length

    players.forEach(player => {
      if (player.isReady){
        readyPlayers++
      }
    })
    
    if (lobbyHeader.querySelector('h4')){
        const countsOld = lobbyHeader.querySelector('h4')
        lobbyHeader.removeChild(countsOld)
    }
        const countsNew = document.createElement('h4')
        countsNew.innerText = `${readyPlayers}/${allPlayers}`
        lobbyHeader.append(countsNew)
})

socket.on('gameCards', (roles)=>{
    const lobby = document.querySelector('.lobby')
    const gameCards = document.querySelector('.game-cards')

    lobby.setAttribute('hidden', 'hidden')
    gameCards.removeAttribute('hidden')

    const divCards = document.querySelector('.cards')
    for (let i = 0; i<roles.length; i++){
        const card = document.createElement('button')
        card.classList.add('card')
        card.id = i
        card.innerText = 'Карта'
        card.addEventListener('click', (e)=>{
            const id = e.target.id
            e.target.setAttribute('disabled', 'true')
            socket.emit('selectRole', roles[id][0])
        })

        divCards.append(card)
    }
})

socket.on('cardsUpdate', (roles)=>{
    const arrBtn = document.querySelectorAll('.card')
    for(let i = 0; i<roles.length; i++){
        if (roles[i][1].isSelect) {
            arrBtn[i].setAttribute('disabled', 'true')
        }
    }

    // Добавить логику проверки, что каждый игрок выбрал роль, и отрисовка интерфейса для каждой роли
})

const btnReady = document.querySelector('.btn-ready')
btnReady.addEventListener('click', () => {
    socket.emit('playerIsReady')
})
