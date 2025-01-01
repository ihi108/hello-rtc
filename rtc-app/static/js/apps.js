const menu = document.getElementById("menu");
const aside = document.getElementById("aside");
const main_section = document.getElementById("main-section")

const app_meet = document.getElementById("app-meet");
const app_call = document.getElementById("app-call");
const app_stream = document.getElementById("app-stream");
const app_msg = document.getElementById("app-msg");
const app_rec = document.getElementById("app-rec");

const meet_form = document.getElementById("meet-form")
const input_link = document.getElementById("input-link")
const join_btn = document.getElementById("join-btn")

meet_form.onsubmit = function (e) {
    e.preventDefault();

    // make a post request to create a meeting
}

input_link.onchange = function(e) {
    join_btn.disabled = false
    join_btn.classList.add("enabled")
    console.log(join_btn)
}

menu.onclick = function(e) {
    if (aside.classList.contains("slideout")) {
        aside.classList.remove("slideout")
        main_section.classList.remove("hundred")
    } else {
        aside.classList.add("slideout")
        main_section.classList.add("hundred")
    }
}

app_call.onclick = function(e) {
    view = document.getElementsByClassName('view')[0]
    calls_tab = document.getElementsByClassName("calls")[0]
    view.classList.remove("view")
    calls_tab.classList.add('view')
    document.getElementsByClassName("default")[0].classList.remove("default")
    app_call.classList.add("default")
}

app_stream.onclick = function(e) {
    view = document.getElementsByClassName('view')[0]
    stream_tab = document.getElementsByClassName("stream")[0]
    view.classList.remove("view")
    stream_tab.classList.add('view')
    document.getElementsByClassName("default")[0].classList.remove("default")
    app_stream.classList.add("default")
}

app_meet.onclick = function(e) {
    view = document.getElementsByClassName('view')[0]
    meet_tab = document.getElementsByClassName("meeting")[0]
    view.classList.remove("view")
    meet_tab.classList.add('view')
    document.getElementsByClassName("default")[0].classList.remove("default")
    app_meet.classList.add("default")
}