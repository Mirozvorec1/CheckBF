/* CheckBF Filter System — v1.0
 * Usage:
 *   1. Include <link rel="stylesheet" href="css/filter.css">
 *   2. Include <script src="js/filter.js"></script>
 *   3. Define function applyAllVisibility() { ... } in page script
 *   4. Call CBF.init('checkbf_xxx_filters') at the end
 */
window.CBF = window.CBF || {};

CBF.ICONS = ['+', '—', '−'];
CBF.CLASSES = ['state-0', 'state-1', 'state-2'];
CBF.TITLES = ['Только эти', 'Не важно', 'Кроме этих'];
CBF.KNOB_LEFTS = [3, 20, 37];
CBF.KNOB_COLORS = ['#2e7d32', '#555', '#c62828'];

CBF.toggleGroup = function(header) {
    header.parentElement.classList.toggle('collapsed');
};

CBF.setFilterState = function(btn, s) {
    s = Math.max(0, Math.min(2, s));
    btn.dataset.state = s;
    btn.className = 'ft ' + CBF.CLASSES[s];
    var knob = btn.querySelector('.ft-knob');
    knob.style.left = '';
    knob.style.background = '';
    btn.querySelector('.ft-knob-icon').textContent = CBF.ICONS[s];
    btn.title = CBF.TITLES[s];
    CBF._apply();
    CBF.saveFilters();
};

CBF.getFilterState = function(filterName) {
    var btn = document.querySelector('.ft[data-filter="' + filterName + '"]');
    if (!btn) return 0;
    var s = parseInt(btn.dataset.state);
    if (s === 0) return 1;
    if (s === 2) return -1;
    return 0;
};

CBF.getSidebarFilter = function() {
    var active = document.querySelector('.sidebar button.active');
    return active ? active.dataset.filter : 'all';
};

CBF.getMasteryVal = function(item) {
    var m = item.dataset.mastery || '1/600';
    return parseInt(m.split('/')[0]) || 0;
};

CBF.saveFilters = function() {
    if (!CBF._storageKey) return;
    var state = {};
    document.querySelectorAll('.ft').forEach(function(btn) {
        var s = parseInt(btn.dataset.state);
        if (s === 0) state[btn.dataset.filter] = 1;
        else if (s === 2) state[btn.dataset.filter] = -1;
    });
    localStorage.setItem(CBF._storageKey, JSON.stringify(state));
};

CBF.loadFilters = function() {
    if (!CBF._storageKey) return;
    var saved = localStorage.getItem(CBF._storageKey);
    if (!saved) return;
    try {
        var state = JSON.parse(saved);
        Object.keys(state).forEach(function(f) {
            if (state[f] === 0) return;
            var btn = document.querySelector('.ft[data-filter="' + f + '"]');
            if (!btn) return;
            var s = state[f] === 1 ? 0 : 2;
            CBF.setFilterState(btn, s);
        });
    } catch(e) {}
};

CBF.resetAllFilters = function() {
    if (CBF._storageKey) localStorage.removeItem(CBF._storageKey);
    document.querySelectorAll('.ft').forEach(function(btn) {
        btn.dataset.state = 1;
        btn.className = 'ft state-1';
        var knob = btn.querySelector('.ft-knob');
        knob.style.left = CBF.KNOB_LEFTS[1] + 'px';
        knob.style.background = CBF.KNOB_COLORS[1];
        btn.querySelector('.ft-knob-icon').textContent = '—';
        btn.title = 'Не важно';
    });
    CBF._apply();
};

CBF._apply = function() {
    if (typeof window.applyAllVisibility === 'function') {
        window.applyAllVisibility();
    }
};

/* Drag handler */
(function() {
    var dragging = null, startX = 0, startState = 0, moved = false;
    function preventSelect(e) { e.preventDefault(); }
    function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

    function onStart(e) {
        var btn = (e.target || e.srcElement).closest('.ft');
        if (!btn) return;
        if (e.button && e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        dragging = btn;
        startX = getX(e);
        startState = parseInt(btn.dataset.state);
        moved = false;
        btn.classList.add('dragging');
        document.addEventListener('selectstart', preventSelect);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    }

    function onMove(e) {
        if (!dragging) return;
        e.preventDefault();
        var dx = getX(e) - startX;
        if (Math.abs(dx) > 3) moved = true;
        var step = 17;
        var s = Math.round(dx / step);
        var newState = Math.max(0, Math.min(2, startState + s));
        dragging.dataset.state = newState;
        dragging.querySelector('.ft-knob').style.left = CBF.KNOB_LEFTS[newState] + 'px';
        dragging.querySelector('.ft-knob').style.background = CBF.KNOB_COLORS[newState];
        dragging.querySelector('.ft-knob-icon').textContent = CBF.ICONS[newState];
        dragging.title = CBF.TITLES[newState];
    }

    function onEnd(e) {
        if (!dragging) return;
        var btn = dragging;
        var clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        var dx = clientX - startX;
        dragging.classList.remove('dragging');
        dragging.querySelector('.ft-knob').style.left = '';
        document.removeEventListener('selectstart', preventSelect);
        if (moved) {
            var step = 17;
            var s = Math.round(dx / step);
            var newState = Math.max(0, Math.min(2, startState + s));
            CBF.setFilterState(btn, newState);
        } else {
            var rect = btn.getBoundingClientRect();
            var x = clientX - rect.left;
            var w = rect.width;
            var newState = x < w / 3 ? 0 : x < w * 2 / 3 ? 1 : 2;
            CBF.setFilterState(btn, newState);
        }
        dragging = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
    }

    document.addEventListener('mousedown', function(e) {
        var btn = e.target.closest('.ft');
        if (btn) onStart(e);
    });
    document.addEventListener('touchstart', function(e) {
        var btn = e.target.closest('.ft');
        if (btn) onStart(e);
    }, { passive: false });
})();

/* Init — call from each page: CBF.init('checkbf_xxx_filters') */
CBF.init = function(storageKey) {
    CBF._storageKey = storageKey;

    document.querySelectorAll('.sidebar button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.sidebar button').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            CBF._apply();
        });
    });

    CBF.loadFilters();
    CBF._apply();
};
