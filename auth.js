window.checkbfAuth = {
    user: null,
    listeners: []
};

var auth = firebase.auth();
var db = firebase.firestore();

auth.onAuthStateChanged(function(user) {
    window.checkbfAuth.user = user;
    window.checkbfAuth.listeners.forEach(function(fn) { fn(user); });
});

window.checkbfAuth.onAuthChange = function(fn) {
    window.checkbfAuth.listeners.push(fn);
    if (window.checkbfAuth.user) fn(window.checkbfAuth.user);
};

window.checkbfAuth.logout = function() {
    return auth.signOut();
};

window.checkbfAuth.loadFromDB = function(page) {
    if (!window.checkbfAuth.user) return Promise.resolve(null);
    return db.collection("users").doc(window.checkbfAuth.user.uid).get().then(function(snap) {
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
    if (!window.checkbfAuth.user) return Promise.resolve();
    var update = {};
    update[page] = data;
    return db.collection("users").doc(window.checkbfAuth.user.uid).set(update, { merge: true }).catch(function(e) {
        console.error("Save to DB error:", e);
    });
};
