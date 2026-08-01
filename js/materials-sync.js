var MS = MS || {};

MS.recipes = {
    "Золотая Удочка": {"Металлолом": 3, "Деревянная Доска": 4}
};

MS.materialRecipes = {
    "Металлолом": [
        { name: "Золотая Удочка", img: "assets/rods/GoldRodQ.webp", qty: 3, page: "rods.html" }
    ],
    "Деревянная Доска": [
        { name: "Золотая Удочка", img: "assets/rods/GoldRodQ.webp", qty: 4, page: "rods.html" }
    ]
};

MS.allRecipes = {};
for (var _item in MS.recipes) {
    for (var _mat in MS.recipes[_item]) {
        MS.allRecipes[_mat] = (MS.allRecipes[_mat] || 0) + MS.recipes[_item][_mat];
    }
}

MS._get = function(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch(e) { return {}; }
};

MS._set = function(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
};

MS.updateMaterialsUsage = function() {
    var usage = {};
    var obtained = {};
    document.querySelectorAll('.item[data-recipe]').forEach(function(item) {
        try {
            var recipe = JSON.parse(item.dataset.recipe);
            var isObtained = item.dataset.eaten === 'true';
            for (var mat in recipe) {
                if (isObtained) {
                    usage[mat] = (usage[mat] || 0) + recipe[mat];
                    obtained[mat + '|' + item.dataset.name] = true;
                }
            }
        } catch(e) {}
    });
    usage._obtained = obtained;
    MS._set('checkbf_materials_usage', usage);
};

MS.updateMaterialsCounters = function() {
    var usage = MS._get('checkbf_materials_usage');
    document.querySelectorAll('.item').forEach(function(item) {
        var name = item.dataset.name;
        var collected = usage[name] || 0;
        var total = MS.allRecipes[name] || 0;
        item.dataset.collected = collected;
        item.dataset.total = total;
        var collectedEl = item.querySelector('.collected');
        var totalEl = item.querySelector('.total');
        if (collectedEl) collectedEl.textContent = collected;
        if (totalEl) totalEl.textContent = total;
        if (collectedEl) collectedEl.classList.toggle('filled', collected >= total && total > 0);
    });
};

MS.getRecipeChecked = function() {
    return MS._get('checkbf_recipe_checked');
};

MS.autoCheckRecipes = function() {
    var usage = MS._get('checkbf_materials_usage');
    var checked = MS.getRecipeChecked();
    var obtained = usage._obtained || {};
    var changed = false;
    for (var key in obtained) {
        if (obtained[key] && !checked[key]) { checked[key] = true; changed = true; }
    }
    for (var key2 in checked) {
        if (checked[key2] && !obtained[key2]) { checked[key2] = false; changed = true; }
    }
    if (changed) MS._set('checkbf_recipe_checked', checked);
    return checked;
};

MS.rebuildUsageFromChecked = function() {
    var checked = MS.getRecipeChecked();
    var usage = MS._get('checkbf_materials_usage');
    var newUsage = {};
    newUsage._obtained = usage._obtained || {};
    for (var k in checked) {
        if (!checked[k]) continue;
        var parts = k.split('|');
        var recipeItem = MS.recipes[parts[1]];
        if (recipeItem) {
            for (var mat in recipeItem) {
                newUsage[mat] = (newUsage[mat] || 0) + recipeItem[mat];
            }
        }
    }
    newUsage._obtained = usage._obtained || {};
    MS._set('checkbf_materials_usage', newUsage);
};

MS.toggleRecipeCheck = function(matName, itemName, el, requireAuthFn) {
    if (requireAuthFn && !requireAuthFn()) return;
    var key = matName + '|' + itemName;
    var checked = MS.getRecipeChecked();
    var val = checked[key] === true ? false : true;
    checked[key] = val;
    MS._set('checkbf_recipe_checked', checked);
    el.textContent = val ? '☑' : '☐';
    el.classList.toggle('checked', val);
    var usage = MS._get('checkbf_materials_usage');
    if (!usage._obtained) usage._obtained = {};
    usage._obtained[key] = val;
    MS._set('checkbf_materials_usage', usage);
    var rods = MS._get('checkbf_rods');
    if (!rods[itemName]) rods[itemName] = { mastery: '1/100', eaten: 'false', fav: 'false' };
    rods[itemName].eaten = val ? 'true' : 'false';
    MS._set('checkbf_rods', rods);
    MS.rebuildUsageFromChecked();
    MS.updateMaterialsCounters();
};

MS.openRecipePopup = function(matName) {
    var items = MS.materialRecipes[matName];
    document.getElementById('recipeTitle').textContent = matName;
    var list = document.getElementById('recipeList');
    list.innerHTML = '';
    var checked = MS.autoCheckRecipes();
    if (!items || items.length === 0) {
        list.innerHTML = '<div class="recipe-empty">Нет предметов с этим материалом</div>';
    } else {
        items.forEach(function(entry) {
            var key = matName + '|' + entry.name;
            var isChecked = checked[key] === true;
            var div = document.createElement('div');
            div.className = 'recipe-item';
            div.innerHTML = '<img src="' + entry.img + '" alt="">' +
                '<div class="ri-info"><h4>' + entry.name + '</h4><p>' + entry.page.replace('.html','') + '</p></div>' +
                '<span class="ri-qty">x' + entry.qty + '</span>' +
                '<span class="recipe-check' + (isChecked ? ' checked' : '') + '" onclick="MS.toggleRecipeCheck(\'' + matName.replace(/'/g,"\\'") + '\',\'' + entry.name.replace(/'/g,"\\'") + '\',this,window.requireAuth)">' + (isChecked ? '☑' : '☐') + '</span>';
            list.appendChild(div);
        });
    }
    document.getElementById('recipeOverlay').classList.add('active');
};
