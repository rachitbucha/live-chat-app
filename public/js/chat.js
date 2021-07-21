const socket = io();

//Elements
const $messageForm = document.querySelector('form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#share-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('location', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.text,
        createdAt: moment(location.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = e.target.message.value;
    socket.emit('SendMessage', message, (message) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
    });
});

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation service is not supported in your browser.');
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        if (position.coords) {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }
            socket.emit('ShareLocation', location, () => {
                console.log('Location Shared!');
            });
            $sendLocationButton.removeAttribute('disabled');
        }
    });
});

socket.emit('join', { username, room }, (errorMessage) => {
    if (errorMessage) {
        alert(errorMessage);
        location.href = '/';
    }
})