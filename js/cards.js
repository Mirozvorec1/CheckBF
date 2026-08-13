/* ============================================================
   CheckBF Cards — общий JS для карточек
   Подключение: <script src="js/cards.js"></script>
   Затем в конце страницы: Cards.initTooltips();
   ============================================================ */
window.Cards = window.Cards || {};

/* Позиционирование тултипов сезонных бейджей:
   у крайних карточек строки тултип выравнивается к краю сетки */
Cards.initTooltips = function(scope) {
    var root = scope || document;
    root.querySelectorAll('.item .seasonal, .tree-node .seasonal').forEach(function(el) {
        var tip = el.querySelector('.tooltip');
        if (!tip) return;
        el.addEventListener('mouseenter', function() {
            var card = el.closest('.item, .tree-node');
            var grid = card ? card.parentElement : null;
            tip.classList.remove('align-left', 'align-right');
            if (!grid) return;
            var top = card.offsetTop;
            var siblings = grid.querySelectorAll('.item, .tree-node');
            var minLeft = Infinity, maxLeft = -Infinity;
            siblings.forEach(function(s) {
                if (Math.abs(s.offsetTop - top) < 5) {
                    if (s.offsetLeft < minLeft) minLeft = s.offsetLeft;
                    if (s.offsetLeft > maxLeft) maxLeft = s.offsetLeft;
                }
            });
            if (card.offsetLeft <= minLeft) tip.classList.add('align-left');
            else if (card.offsetLeft >= maxLeft) tip.classList.add('align-right');
        });
    });
};

/* Текущее значение мастерства из data-mastery="N/M" */
Cards.masteryVal = function(el) {
    var m = (el.getAttribute('data-mastery') || '0/0').split('/')[0];
    return parseInt(m, 10) || 0;
};

/* Обновление золотой рамки при достижении максимума мастерства */
Cards.updateMaxMastery = function(el, max) {
    var maxed = Cards.masteryVal(el) >= (max || 600);
    el.classList.toggle('max-mastery', maxed);
    return maxed;
};
