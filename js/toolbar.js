/* CheckBF Toolbar — shared JS
 * Provides: sync indicator, auth bar, sort dropdown toggle, auth modal
 * Usage:
 *   1. Include <script src="js/toolbar.js"></script>
 *   2. Call TB.init() in page DOMContentLoaded to set up auth listener
 *   3. Pages define: resetToDefaults(), syncFromDB(), loadData() as needed
 */
window.TB = window.TB || {};

/* === Sync Indicator === */
TB.showSync = function() {
    var el = document.getElementById('syncIndicator');
    el.classList.add('active');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(function() { el.classList.remove('active'); }, 1500);
};
TB.hideSync = function() {
    var el = document.getElementById('syncIndicator');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(function() { el.classList.remove('active'); }, 500);
};

/* === Auth Bar === */
TB.updateAuthBar = function(user) {
    var bar = document.getElementById('authBar');
    if (user) {
        var photo = user.photoURL || '';
        bar.innerHTML = '<div class="user-info"><img src="' + photo + '" alt=""><span class="email">' + (user.email || 'Google') + '</span></div>' +
            '<button class="logout-btn" id="logoutBtn">Выйти</button>';
        document.getElementById('logoutBtn').onclick = function() {
            if (window.checkbfAuth) window.checkbfAuth.logout();
        };
    } else {
        bar.innerHTML = '<button class="login-btn" onclick="TB.openAuthModal()">Войти</button>';
    }
};

/* === Auth Modal === */
TB.openAuthModal = function() {
    document.getElementById('authOverlay').classList.add('active');
};

/* === Sort Dropdown Toggle === */
TB.toggleSortDropdown = function() {
    document.getElementById('sortDropdown').classList.toggle('open');
};

/* === Init — call from page DOMContentLoaded === */
TB.init = function() {
    if (window.checkbfAuth) {
        window.checkbfAuth.onAuthChange(function(user) {
            TB.updateAuthBar(user);
            if (user) {
                if (typeof syncFromDB === 'function') syncFromDB();
            } else {
                if (typeof resetToDefaults === 'function') resetToDefaults();
            }
        });
    }
};

/* Click outside sort dropdown to close */
document.addEventListener('click', function(e) {
    var dd = document.getElementById('sortDropdown');
    if (dd && !e.target.closest('.sort-wrap')) dd.classList.remove('open');
});
