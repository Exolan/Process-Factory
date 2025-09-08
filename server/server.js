const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const path = require('path')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

const players = new Map()
const roles = new Map([
    ['doctor', {
        name: 'Доктор Шарп',
        description: 'Хирург с невероятной точностью. Диагностирует болезни по малейшим симптомам.',
        isSelect: false
    }],
    
    ['professor', {
        name: 'Профессор Синтезюк', 
        description: 'Гений медицинских технологий. Создает инновационные методы лечения.',
        isSelect: false
    }],
    
    ['therapist', {
        name: 'Терапевт Квикли',
        description: 'Опытный диагност. Быстро ставит точные диагнозы и назначает лечение.',
        isSelect: false
    }],
    
    ['patient1', {
        name: 'Пациент Маргарита Фильтрова',
        description: `Вы — Маргарита Фильтрова, 29 лет, успешный инстаграм-блогер с миллионной аудиторией.
                    Ваша жизнь — это идеальные кадры, безупречные ракурсы и тонны фильтров. Но однажды вы осознаете, что больше не можете видеть реальность без цифровой обработки:
                    •	Зеркала вас раздражают — они показывают «сырую» версию лица.
                    •	Овощи в магазине кажутся вам «недоработанными» — хочется их «подкрасить».
                    •	Солнечный свет выглядит «в плохом разрешении» — как будто мир нуждается в апгрейде.
                    Ваша цель — пройти диагностику и получить лечение, а именно льготный препарат Плацебо-Фильтр.
                    `,
        condition: '«Не вижу себя в зеркале без фотошоп-фильтров».',
        isSelect: false
    }],
    
    ['patient2', {
        name: 'Пациент Артем Чипсов',
        description: 'Поступил с необычными симптомами после употребления чипсов.',
        condition: 'неизвестное заболевание',
        isSelect: false
    }]
]);

function checkAllPlayersReady () {
    const allPlayers = Array.from(players.values())
    const allReady = allPlayers.length > 0 && allPlayers.every(player => player.isReady)

    if (allReady) {
        io.emit('gameCards', Array.from(roles.entries()))
        allPlayers.forEach(player => player.isReady = false);
    }
}

app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
    const socketID = socket.id

    socket.on('playerConnect', ()=> {
        console.log("ID пользователя: ", socketID)
        players.set(socketID, {role: null, isReady: false})
        io.emit('lobbyUpdate', Array.from(players.values()))
    })

    socket.on('playerIsReady', ()=>{
        const player = players.get(socketID)
        if (player) {
            player.isReady = true
        }
        io.emit('lobbyUpdate', Array.from(players.values()))
        checkAllPlayersReady()
    })

    socket.on('selectRole', (roleKey)=>{
        const player = players.get(socketID)
        if (player) {
            player.role = roleKey
            
            const role = roles.get(roleKey)
            if (role) {
                role.isSelect = true
            }
        }
        console.log(`Пользователь ${socketID} выбрал роль ${roleKey}`)
        io.emit('cardsUpdate', Array.from(roles.entries()))
    })

    socket.on('disconnect', ()=>{
        console.log('Пользователь отключился')
        players.delete(socketID)
        io.emit('lobbyUpdate', Array.from(players.values()))
    })
})

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, ()=>{
    console.log('Сервер запущен: ', `http://localhost:${PORT}`)
})