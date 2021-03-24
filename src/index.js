const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const {generateMessage} =require('./utils/messages')
const { addUser,
    removeUser,
    getUser,
    getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicdirectivepart = path.join(__dirname,'../public')
let count =0

app.use(express.static(publicdirectivepart))

io.on('connection',(socket)=>{

     socket.on('join',(options,callback)=>{
         const{error,user} = addUser({id:socket.id, ...options })
         if(error)
         {
             return callback(error)
         }
        socket.join(user.room)
        console.log('new socket connected')
     socket.emit('message',generateMessage('wellcome'))
     socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} is join the chat`))
     io.to(user.room).emit('userData',{
         room: user.room,
         users:getUsersInRoom(user.room)
     })
     callback()
     })

      socket.on('sendMessage',(message,callback)=>{
          const user = getUser(socket.id)
          io.to(user.room).emit('message',generateMessage(user.username,message))
          callback()
      })

      socket.on('sendLocation',(coords,callback)=>{
          const user = getUser(socket.id)
          io.to(user.room).emit('locationMessage',generateMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
          callback()
      })

      

      socket.on('disconnect',()=>{
          const user =removeUser(socket.id)
          if(user)
          {
          io.emit('message',generateMessage(`${user.username} user has left`))
          io.to(user.room).emit('userData',{
            room: user.room,
            users:getUsersInRoom(user.room)
        })
          }
      })
   
})

server.listen(port,()=>{
    console.log('server is up and running on port 3000')
})