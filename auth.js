window.checkbfAuth = {
    user: null,
    listeners: [],
    authReady: false
};

var auth = firebase.auth();
var db = firebase.firestore();

auth.onAuthStateChanged(function(user) {
    window.checkbfAuth.user = user;
    window.checkbfAuth.authReady = true;
    window.checkbfAuth.listeners.forEach(function(fn) { fn(user); });
});

window.checkbfAuth.onAuthChange = function(fn) {
    window.checkbfAuth.listeners.push(fn);
    if (window.checkbfAuth.authReady) fn(window.checkbfAuth.user);
};

window.checkbfAuth.logout = function() {
    return auth.signOut();
};

window.checkbfAuth.loadFromDB = function(page) {
    var u = window.checkbfAuth.user || auth.currentUser;
    if (!u) return Promise.resolve(null);
    return db.collection("users").doc(u.uid).get().then(function(snap) {
        if (snap.exists) {
            var data = snap.data();
            return data[page] || null;
        }
        return null;
    }).catch(function(e) {
        console.error("Load from DB error:", e);
        return null;
    });
};

window.checkbfAuth.saveToDB = function(page, data) {
    var u = window.checkbfAuth.user || auth.currentUser;
    if (!u) return Promise.resolve();
    var update = {};
    update[page] = data;
    return db.collection("users").doc(u.uid).set(update, { merge: true }).catch(function(e) {
        console.error("Save to DB error:", e);
    });
};

function showAuthRequiredOverlay() {
    var overlay = document.getElementById('authRequiredOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'authRequiredOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = '<div style="background:#1a1a2e;border:1px solid #555;border-radius:16px;padding:30px 40px;text-align:center;max-width:360px;">' +
            '<h3 style="color:#fff;margin:0 0 12px;font-size:1.2rem;">Требуется авторизация</h3>' +
            '<p style="color:#aaa;margin:0 0 20px;font-size:0.9rem;">Войдите или зарегистрируйтесь, чтобы сохранять данные</p>' +
            '<button id="authRequiredBtn" style="display:inline-block;background:#6a3fc9;color:#fff;border:none;border-radius:12px;padding:10px 30px;font-size:0.95rem;cursor:pointer;">Войти</button>' +
            '</div>';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
        document.getElementById('authRequiredBtn').addEventListener('click', function() {
            overlay.remove();
            if (typeof openAuthModal === 'function') {
                openAuthModal();
            } else {
                window.location.href = 'index.html';
            }
        });
    }
}

window.checkbfAuth.requireAuth = function() {
    if (window.checkbfAuth.user) return true;
    if (!window.checkbfAuth.authReady) return true;
    showAuthRequiredOverlay();
    return false;
};
