let currentUser;

document.addEventListener("DOMContentLoaded", () => {
    const shutdownBtn = $("shutdown-btn");
    const restartBtn = $("restart-btn");
    const sleepBtn = $("sleep-btn");

    if (lightdm.can_shutdown && shutdownBtn) {
        shutdownBtn.addEventListener("click", () => {
            lightdm.shutdown();
        });
    }

    if (lightdm.can_restart && restartBtn) {
        restartBtn.addEventListener("click", () => {
            lightdm.restart();
        });
    }

    if (lightdm.can_suspend && sleepBtn) {
        sleepBtn.addEventListener("click", () => {
            lightdm.suspend();
        });
    }
});

this.addEventListener("load", () => {
    const userDropdown = $("user-dropdown");
    const userDropdownBtn = $("user-dropdown-btn");

    lightdm.users.forEach(usr => userDropdown.appendChild(make_menu_item(
        `<img src="${usr.image}" class="sm-avatar"></img>${usr.display_name}`, 
        () => set_user(usr)
    )));

    userDropdownBtn.addEventListener("click", () => {
        userDropdown.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!userDropdown.contains(e.target) && e.target !== userDropdownBtn) {
            userDropdown.classList.remove("show");
        }
    });

    set_user(lightdm.select_user || lightdm.users[0]);
});

function make_menu_item(inner, click) {
    const d = document.createElement("div");
    d.className = "dropdown-item";
    d.addEventListener("click", click);
    d.innerHTML = inner;
    return d;
}

function toast(title, isErr) {
    const toast = document.createElement("div");
    if (isErr) toast.className = "err";
    toast.innerHTML = title;
    toast.addEventListener("click", () => $("toast-container").removeChild(toast));
    $("toast-container").appendChild(toast);
    setTimeout(() => {
        [1, 0.75, 0.5, 0.25].forEach(x => setTimeout(() => toast.style.opacity = x, 25 / x));
        setTimeout(() => { 
            if ($("toast-container").contains(toast)) $("toast-container").removeChild(toast); 
        }, 125);
    }, 2000);
}

function authentication_complete() {
    $("login-btn").disabled = false;
    if (lightdm.is_authenticated) 
        lightdm.start_session_sync();
    else {
        if (lightdm._username) lightdm.cancel_authentication();
        if (currentUser) lightdm.start_authentication(currentUser.name);
        show_error("Wrong password!");
    }
}

function show_error(err) {
    toast(err, true);
}

function show_prompt(text, type) {
    if (type === "password") {
        $("password-box").value = "";
        $("password-box").focus();
    } else {
        toast(text, false);
    }
}

function show_message(msg) {
    toast(msg, false);
}

function provide_secret() {
    const password = $("password-box").value || null;
    if (password !== null) {
        $("login-btn").disabled = true;
        lightdm.respond(password);
    }
}

function set_user(user) {
    currentUser = user;
    if (lightdm._username) lightdm.cancel_authentication();
    if (user) lightdm.start_authentication(user.name);
    $("avatar").src = user.image;
    $("name").textContent = user.display_name;
    $("password-box").focus();
    $("user-dropdown").classList.remove("show");
}

function $(id) {
    return document.getElementById(id);
}