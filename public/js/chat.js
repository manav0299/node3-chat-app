const socket =io()

const $messageForm =document.querySelector('#message-input')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebartemplate =  document.querySelector('#sidebar-template').innerHTML

const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoscroll = ()=>{    
    const $newmessage = $messages.lastElementChild

    const newmessagestyle = getComputedStyle($newmessage)
    const newmessagemargine = parseInt(newmessagestyle.marginBottom)
    const newmessageheight = $newmessage.offsetHeight + newmessagemargine

    const visiblehight = $messages.offsetHeight
    const cointerheight = $messages.scrollHeight
    const scrolloffset = $messages.scrollTop + visiblehight

    if(cointerheight - newmessageheight <= scrolloffset + 40)
    {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createAt: moment( message.createAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{
    const html =Mustache.render(locationMessageTemplate,{
        username:url.username,
        url:url.text,
        create : moment( url.createAt).format('h:mm a') 
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('userData',({room,users})=>{
    const html = Mustache.render(sidebartemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

     $messageFormButton.setAttribute('disabled','disabled')
    
    let message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })
})

document.querySelector('#location').addEventListener('click',()=>{
if(!navigator.geolocation)
{
    return alert('not supported')
}

navigator.geolocation.getCurrentPosition((position)=>{
    console.log(position.coords.longitude)
    socket.emit('sendLocation',{
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    },()=>{

    })
})
})

socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href = '/'
    }

})