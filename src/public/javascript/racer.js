const socket = io();
function play() {
    document.querySelector('.racer.player1').style.position = 'relative';
    document.querySelector('.player1Btn').addEventListener('click', function () { 
     socket.emit('move1');
    });
    document.querySelector('.player2Btn').addEventListener('click', function () { 
     socket.emit('move2');
    });
}

socket.on('update', (data) => {
    const left1 = data.left1;
    document.querySelector('.racer.player1').style.left = left1 + 'px';
});

socket.on('over', () => {
    document.querySelector('.player1Btn').remove();
    document.querySelector('.player2Btn').remove();
    document.querySelector("#msg").textContent = "You finished it. 😆😆😆😆😆"
});
function main() { 
    const select = document.querySelector('#bar');
    if (select) {
        select.addEventListener('click', play);
    }
}



document.addEventListener('DOMContentLoaded', main);