$(function () {
    let interval = 1000; // 1 second
    setInterval(() => {
        let clock = $("#clock");
        let date = $("#date");
        let time = new Date();
        clock.text(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        date.text(time.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }));
    }, interval);
});
