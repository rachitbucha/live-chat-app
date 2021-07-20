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

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('location', (location) => {
    console.log(location);
    const html = Mustache.render(locationTemplate, {
        location: location.text,
        createdAt: moment(location.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = e.target.message.value;
    socket.emit('SendMessage', message, (message) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        console.log(message);
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

socket.emit('join', { username, room })