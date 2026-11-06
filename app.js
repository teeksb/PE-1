/**
 * NutriTrack - Vanilla Calorie & Macro Tracker
 * Pure HTML / CSS / JS with localStorage persistence
 */

(function () {
  'use strict';

  // ==========================================
  // 1. DATA DEFINITIONS & DEFAULT STATE
  // ==========================================
  const STORAGE_KEYS = {
    GOALS: 'nutritrack_goals',
    LOGS: 'nutritrack_logs',
    WATER: 'nutritrack_water'
  };

  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 125,
    carbs: 225,
    fat: 67,
    water: 2000
  };

  const PRESET_FOODS = [
    { name: 'Oatmeal with Berries', meal: 'Breakfast', cal: 280, p: 9, c: 52, f: 5 },
    { name: 'Scrambled Eggs (2) & Toast', meal: 'Breakfast', cal: 320, p: 18, c: 26, f: 16 },
    { name: 'Greek Yogurt & Honey (200g)', meal: 'Breakfast', cal: 210, p: 20, c: 24, f: 4 },
    { name: 'Avocado Toast with Egg', meal: 'Breakfast', cal: 360, p: 14, c: 32, f: 20 },
    { name: 'Grilled Chicken Breast (150g)', meal: 'Lunch', cal: 245, p: 46, c: 0, f: 5 },
    { name: 'White Rice (Cooked 150g)', meal: 'Lunch', cal: 195, p: 4, c: 42, f: 0.5 },
    { name: 'Garden Salad with Vinaigrette', meal: 'Lunch', cal: 160, p: 3, c: 12, f: 12 },
    { name: 'Tuna Salad Sandwich', meal: 'Lunch', cal: 420, p: 32, c: 44, f: 12 },
    { name: 'Grilled Salmon Fillet (180g)', meal: 'Dinner', cal: 375, p: 40, c: 0, f: 22 },
    { name: 'Sweet Potato (Baked Medium)', meal: 'Dinner', cal: 130, p: 2, c: 30, f: 0.2 },
    { name: 'Steak (Sirloin 200g)', meal: 'Dinner', cal: 480, p: 52, c: 0, f: 30 },
    { name: 'Steamed Broccoli & Olive Oil', meal: 'Dinner', cal: 95, p: 4, c: 10, f: 5 },
    { name: 'Banana (Medium)', meal: 'Snacks', cal: 105, p: 1.3, c: 27, f: 0.3 },
    { name: 'Apple with Peanut Butter', meal: 'Snacks', cal: 260, p: 8, c: 30, f: 16 },
    { name: 'Whey Protein Shake (1 scoop)', meal: 'Snacks', cal: 130, p: 25, c: 3, f: 2 },
    { name: 'Raw Almonds (30g)', meal: 'Snacks', cal: 175, p: 6, c: 6, f: 15 },
    { name: 'Dark Chocolate (2 squares)', meal: 'Snacks', cal: 120, p: 2, c: 13, f: 8 },
    { name: 'Whole Milk Latte (Large)', meal: 'Breakfast', cal: 190, p: 10, c: 16, f: 9 }
  ];

  // Application State
  let currentDate = getFormattedDate(new Date());
  let currentFilter = '';

  // ==========================================
  // 2. HELPER FUNCTIONS & STORAGE
  // ==========================================
  function getFormattedDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseFormattedDate(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function getDisplayDateString(dateStr) {
    const todayStr = getFormattedDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getFormattedDate(yesterday);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getFormattedDate(tomorrow);

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    if (dateStr === tomorrowStr) return 'Tomorrow';

    const d = parseFormattedDate(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getGoals() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
      return stored ? { ...DEFAULT_GOALS, ...JSON.parse(stored) } : { ...DEFAULT_GOALS };
    } catch (e) {
      return { ...DEFAULT_GOALS };
    }
  }

  function saveGoals(goals) {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  function getAllLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  function saveAllLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  function getDayLog(dateStr) {
    const all = getAllLogs();
    return all[dateStr] || [];
  }

  function saveDayLog(dateStr, items) {
    const all = getAllLogs();
    all[dateStr] = items;
    saveAllLogs(all);
  }

  function getWaterData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WATER);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  function saveWaterData(data) {
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(data));
  }

  function getDayWater(dateStr) {
    const data = getWaterData();
    return data[dateStr] || 0;
  }

  function setDayWater(dateStr, amount) {
    const data = getWaterData();
    data[dateStr] = Math.max(0, amount);
    saveWaterData(data);
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // ==========================================
  // 3. UI RENDERING & CALCULATIONS
  // ==========================================
  function renderAll() {
    renderDateNav();
    renderOverview();
    renderWaterTracker();
    renderMealLogs();
  }

  function renderDateNav() {
    const datePicker = document.getElementById('date-picker');
    const dateLabel = document.getElementById('date-label');
    datePicker.value = currentDate;
    dateLabel.textContent = getDisplayDateString(currentDate);
  }

  function renderOverview() {
    const goals = getGoals();
    const dayItems = getDayLog(currentDate);

    let totalCal = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    dayItems.forEach(item => {
      totalCal += Number(item.calories) || 0;
      totalP += Number(item.protein) || 0;
      totalC += Number(item.carbs) || 0;
      totalF += Number(item.fat) || 0;
    });

    totalCal = Math.round(totalCal);
    totalP = Math.round(totalP * 10) / 10;
    totalC = Math.round(totalC * 10) / 10;
    totalF = Math.round(totalF * 10) / 10;

    // Calories Card
    const targetCal = goals.calories;
    const remainingCal = targetCal - totalCal;

    document.getElementById('calories-consumed').textContent = totalCal.toLocaleString();
    document.getElementById('calories-target').textContent = targetCal.toLocaleString();

    const remainingElem = document.getElementById('calories-remaining');
    const remainingLabel = document.getElementById('remaining-label');
    const metricBlock = remainingElem.closest('.metric-block');
    const badge = document.getElementById('calorie-status-badge');
    const progressBar = document.getElementById('calorie-progress-fill');

    if (remainingCal >= 0) {
      remainingLabel.textContent = 'Remaining';
      remainingElem.textContent = remainingCal.toLocaleString();
      metricBlock.classList.remove('over-budget');
      metricBlock.classList.add('highlighted');
      badge.textContent = remainingCal === 0 ? 'Goal Met' : 'On Track';
      badge.className = 'badge badge-normal';
    } else {
      remainingLabel.textContent = 'Over Target';
      remainingElem.textContent = Math.abs(remainingCal).toLocaleString();
      metricBlock.classList.remove('highlighted');
      metricBlock.classList.add('over-budget');
      badge.textContent = 'Over Target';
      badge.className = 'badge badge-over';
    }

    const pct = Math.min(100, Math.round((totalCal / (targetCal || 1)) * 100));
    progressBar.style.width = `${pct}%`;
    progressBar.className = 'progress-bar-fill';
    if (totalCal > targetCal) {
      progressBar.classList.add('danger');
    } else if (totalCal >= targetCal * 0.9) {
      progressBar.classList.add('warning');
    }

    // Macros Card
    document.getElementById('macro-split-caption').textContent =
      `P ${goals.protein}g | C ${goals.carbs}g | F ${goals.fat}g`;

    document.getElementById('protein-consumed').textContent = totalP;
    document.getElementById('protein-target').textContent = goals.protein;
    const pPct = Math.min(100, Math.round((totalP / (goals.protein || 1)) * 100));
    document.getElementById('protein-progress').style.width = `${pPct}%`;

    document.getElementById('carbs-consumed').textContent = totalC;
    document.getElementById('carbs-target').textContent = goals.carbs;
    const cPct = Math.min(100, Math.round((totalC / (goals.carbs || 1)) * 100));
    document.getElementById('carbs-progress').style.width = `${cPct}%`;

    document.getElementById('fat-consumed').textContent = totalF;
    document.getElementById('fat-target').textContent = goals.fat;
    const fPct = Math.min(100, Math.round((totalF / (goals.fat || 1)) * 100));
    document.getElementById('fat-progress').style.width = `${fPct}%`;
  }

  function renderWaterTracker() {
    const goals = getGoals();
    const consumed = getDayWater(currentDate);
    const target = goals.water || 2000;

    document.getElementById('water-consumed').textContent = consumed;
    document.getElementById('water-target').textContent = target;

    const container = document.getElementById('water-glasses-container');
    container.innerHTML = '';

    const cupVolume = 250;
    const totalCups = Math.max(8, Math.ceil(target / cupVolume));
    const filledCups = Math.floor(consumed / cupVolume);

    for (let i = 1; i <= totalCups; i++) {
      const cup = document.createElement('div');
      cup.className = `water-cup ${i <= filledCups ? 'filled' : ''}`;
      cup.textContent = `${i * cupVolume}ml`;
      cup.title = `Click to set hydration to ${i * cupVolume} ml`;
      cup.addEventListener('click', () => {
        if (consumed === i * cupVolume) {
          setDayWater(currentDate, (i - 1) * cupVolume);
        } else {
          setDayWater(currentDate, i * cupVolume);
        }
        renderWaterTracker();
      });
      container.appendChild(cup);
    }
  }

  function renderMealLogs() {
    const dayItems = getDayLog(currentDate);
    const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

    meals.forEach(meal => {
      const groupContainer = document.getElementById(`${meal.toLowerCase()}-items`);
      const totalCalElem = document.getElementById(`${meal.toLowerCase()}-total-cal`);

      let filteredItems = dayItems.filter(item => item.meal === meal);

      // Meal group total calories
      const groupCalories = filteredItems.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
      totalCalElem.textContent = Math.round(groupCalories);

      // Search filter
      if (currentFilter.trim()) {
        const query = currentFilter.toLowerCase().trim();
        filteredItems = filteredItems.filter(item => item.name.toLowerCase().includes(query));
      }

      if (filteredItems.length === 0) {
        groupContainer.innerHTML = `<div class="empty-state">${
          currentFilter ? 'No matching items' : 'No ' + meal.toLowerCase() + ' logged yet.'
        }</div>`;
        return;
      }

      groupContainer.innerHTML = '';
      filteredItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'meal-item';

        const servingsLabel = item.servings && Number(item.servings) !== 1 ? ` (${item.servings}x)` : '';
        const pLabel = item.protein ? `${item.protein}g P` : '';
        const cLabel = item.carbs ? `${item.carbs}g C` : '';
        const fLabel = item.fat ? `${item.fat}g F` : '';

        const metaPills = [pLabel, cLabel, fLabel].filter(Boolean)
          .map(txt => `<span class="meta-pill">${txt}</span>`)
          .join('');

        row.innerHTML = `
          <div class="item-left">
            <span class="item-name">${escapeHTML(item.name)}${servingsLabel}</span>
            <div class="item-meta">
              ${metaPills || '<span class="meta-pill">0g macros</span>'}
            </div>
          </div>
          <div class="item-right">
            <span class="item-calories">${Math.round(item.calories)} <small>kcal</small></span>
            <button class="item-btn-icon edit-btn" title="Edit this item">✎</button>
            <button class="item-btn-icon delete-btn" title="Delete this item">✕</button>
          </div>
        `;

        // Event listeners
        row.querySelector('.edit-btn').addEventListener('click', () => startEditItem(item));
        row.querySelector('.delete-btn').addEventListener('click', () => deleteItem(item.id));

        groupContainer.appendChild(row);
      });
    });
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================
  // 4. ITEM CRUD & FORM ACTIONS
  // ==========================================
  function handleFormSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-item-id').value;
    const name = document.getElementById('food-name').value.trim();
    const meal = document.getElementById('food-meal').value;
    const servings = parseFloat(document.getElementById('food-servings').value) || 1;
    const rawCal = parseFloat(document.getElementById('food-calories').value) || 0;
    const rawP = parseFloat(document.getElementById('food-protein').value) || 0;
    const rawC = parseFloat(document.getElementById('food-carbs').value) || 0;
    const rawF = parseFloat(document.getElementById('food-fat').value) || 0;

    if (!name) {
      alert('Please enter a food name.');
      return;
    }

    const dayItems = getDayLog(currentDate);

    if (editId) {
      // Update item
      const index = dayItems.findIndex(i => i.id === editId);
      if (index !== -1) {
        dayItems[index] = {
          ...dayItems[index],
          name,
          meal,
          servings,
          calories: Math.round(rawCal * servings),
          protein: Math.round(rawP * servings * 10) / 10,
          carbs: Math.round(rawC * servings * 10) / 10,
          fat: Math.round(rawF * servings * 10) / 10
        };
        saveDayLog(currentDate, dayItems);
        showToast(`Updated "${name}"`);
      }
      resetForm();
    } else {
      // Add new item
      const newItem = {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        name,
        meal,
        servings,
        calories: Math.round(rawCal * servings),
        protein: Math.round(rawP * servings * 10) / 10,
        carbs: Math.round(rawC * servings * 10) / 10,
        fat: Math.round(rawF * servings * 10) / 10
      };
      dayItems.push(newItem);
      saveDayLog(currentDate, dayItems);
      showToast(`Added "${name}" to ${meal}`);
      resetForm();
    }

    renderAll();
  }

  function startEditItem(item) {
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('food-name').value = item.name;
    document.getElementById('food-meal').value = item.meal;

    const servings = item.servings || 1;
    document.getElementById('food-servings').value = servings;
    document.getElementById('food-calories').value = Math.round(item.calories / servings);
    document.getElementById('food-protein').value = Math.round((item.protein / servings) * 10) / 10;
    document.getElementById('food-carbs').value = Math.round((item.carbs / servings) * 10) / 10;
    document.getElementById('food-fat').value = Math.round((item.fat / servings) * 10) / 10;

    document.getElementById('form-heading').textContent = 'Edit Food Item';
    document.getElementById('submit-food-btn').textContent = 'Save Changes';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';

    document.getElementById('food-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetForm() {
    document.getElementById('edit-item-id').value = '';
    document.getElementById('food-form').reset();
    document.getElementById('food-servings').value = 1;
    document.getElementById('form-heading').textContent = 'Log Food / Drink';
    document.getElementById('submit-food-btn').textContent = '+ Add to Log';
    document.getElementById('cancel-edit-btn').style.display = 'none';
  }

  function deleteItem(itemId) {
    const dayItems = getDayLog(currentDate);
    const itemToDelete = dayItems.find(i => i.id === itemId);
    const updated = dayItems.filter(i => i.id !== itemId);
    saveDayLog(currentDate, updated);
    renderAll();
    showToast(itemToDelete ? `Removed "${itemToDelete.name}"` : 'Item deleted');
  }

  function clearCurrentDay() {
    const dayItems = getDayLog(currentDate);
    if (!dayItems.length) {
      showToast('No items logged for this day.');
      return;
    }
    if (confirm(`Are you sure you want to clear all ${dayItems.length} meals for ${getDisplayDateString(currentDate)}?`)) {
      saveDayLog(currentDate, []);
      setDayWater(currentDate, 0);
      renderAll();
      showToast('Day cleared successfully');
    }
  }

  // ==========================================
  // 5. PRESETS SYSTEM
  // ==========================================
  function renderPresets(filterText = '') {
    const grid = document.getElementById('preset-grid');
    grid.innerHTML = '';

    const query = filterText.toLowerCase().trim();
    const filtered = PRESET_FOODS.filter(f => f.name.toLowerCase().includes(query));

    if (!filtered.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">No presets found matching search.</div>';
      return;
    }

    filtered.forEach(preset => {
      const card = document.createElement('div');
      card.className = 'preset-card';
      card.innerHTML = `
        <div>
          <div class="preset-header">
            <span class="preset-title">${escapeHTML(preset.name)}</span>
            <span class="preset-cal">${preset.cal} kcal</span>
          </div>
          <div class="preset-macros">
            <span>P: ${preset.p}g</span> •
            <span>C: ${preset.c}g</span> •
            <span>F: ${preset.f}g</span>
          </div>
        </div>
        <div class="preset-actions">
          <select class="preset-meal-select">
            <option value="Breakfast" ${preset.meal === 'Breakfast' ? 'selected' : ''}>Breakfast</option>
            <option value="Lunch" ${preset.meal === 'Lunch' ? 'selected' : ''}>Lunch</option>
            <option value="Dinner" ${preset.meal === 'Dinner' ? 'selected' : ''}>Dinner</option>
            <option value="Snacks" ${preset.meal === 'Snacks' ? 'selected' : ''}>Snacks</option>
          </select>
          <button class="btn btn-sm btn-primary add-preset-btn">+ Log</button>
        </div>
      `;

      card.querySelector('.add-preset-btn').addEventListener('click', () => {
        const selectedMeal = card.querySelector('.preset-meal-select').value;
        const dayItems = getDayLog(currentDate);
        const newItem = {
          id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          name: preset.name,
          meal: selectedMeal,
          servings: 1,
          calories: preset.cal,
          protein: preset.p,
          carbs: preset.c,
          fat: preset.f
        };
        dayItems.push(newItem);
        saveDayLog(currentDate, dayItems);
        renderAll();
        showToast(`Logged "${preset.name}" to ${selectedMeal}`);
      });

      grid.appendChild(card);
    });
  }

  // ==========================================
  // 6. WEEKLY ANALYTICS & CANVAS CHART
  // ==========================================
  function renderWeeklyAnalytics() {
    const goals = getGoals();
    const allLogs = getAllLogs();

    // Generate past 7 days up to currentDate
    const centerDate = parseFormattedDate(currentDate);
    const dayDataList = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(centerDate);
      d.setDate(d.getDate() - i);
      const dateStr = getFormattedDate(d);
      const items = allLogs[dateStr] || [];
      const totalCal = items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
      dayDataList.push({
        dateStr,
        dayName,
        calories: totalCal
      });
    }

    // Stats calculations
    const daysWithData = dayDataList.filter(d => d.calories > 0);
    const avgCal = daysWithData.length
      ? Math.round(dayDataList.reduce((acc, d) => acc + d.calories, 0) / 7)
      : 0;

    const onTrackDays = dayDataList.filter(d => d.calories > 0 && d.calories <= goals.calories).length;

    // Consecutive streak (ending on or before today)
    let streak = 0;
    const sortedDates = Object.keys(allLogs).sort().reverse();
    const today = getFormattedDate(new Date());

    let testDate = new Date();
    while (true) {
      const ds = getFormattedDate(testDate);
      const items = allLogs[ds] || [];
      if (items.length > 0) {
        streak++;
        testDate.setDate(testDate.getDate() - 1);
      } else {
        // Allow streak to count if today is not logged yet, but yesterday was
        if (ds === today) {
          testDate.setDate(testDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    document.getElementById('history-avg-cal').textContent = `${avgCal.toLocaleString()} kcal`;
    document.getElementById('history-days-on-track').textContent = `${onTrackDays} / 7`;
    document.getElementById('history-streak').textContent = `${streak} ${streak === 1 ? 'day' : 'days'}`;

    drawWeeklyChart(dayDataList, goals.calories);
  }

  function drawWeeklyChart(dayDataList, targetCal) {
    const canvas = document.getElementById('weekly-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Padding & dimensions
    const padLeft = 45;
    const padRight = 20;
    const padTop = 30;
    const padBottom = 40;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Determine max scale
    const maxDayCal = Math.max(...dayDataList.map(d => d.calories), targetCal);
    const maxScale = Math.ceil((maxDayCal * 1.2) / 500) * 500 || 2500;

    // Background horizontal grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const val = Math.round((maxScale / steps) * i);
      const y = padTop + chartH - (val / maxScale) * chartH;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillText(`${val}`, padLeft - 6, y + 3);
    }

    // Goal reference line (dashed)
    const goalY = padTop + chartH - (targetCal / maxScale) * chartH;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, goalY);
    ctx.lineTo(width - padRight, goalY);
    ctx.stroke();
    ctx.restore();

    // Bars
    const barCount = dayDataList.length;
    const colWidth = chartW / barCount;
    const barWidth = Math.min(36, colWidth * 0.55);

    dayDataList.forEach((item, index) => {
      const x = padLeft + index * colWidth + (colWidth - barWidth) / 2;
      const barH = item.calories > 0 ? (item.calories / maxScale) * chartH : 4;
      const y = padTop + chartH - barH;

      // Color selection
      const isOver = item.calories > targetCal;
      ctx.fillStyle = item.calories === 0 ? '#cbd5e1' : isOver ? '#ef4444' : '#10b981';

      // Rounded top rectangle
      const radius = 4;
      ctx.beginPath();
      ctx.moveTo(x, padTop + chartH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, padTop + chartH);
      ctx.closePath();
      ctx.fill();

      // Calorie text above bar
      if (item.calories > 0) {
        ctx.fillStyle = isOver ? '#dc2626' : '#047857';
        ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${item.calories}`, x + barWidth / 2, y - 5);
      }

      // Day label below bar
      ctx.fillStyle = item.dateStr === currentDate ? '#0f172a' : '#64748b';
      ctx.font = item.dateStr === currentDate
        ? 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.dayName, x + barWidth / 2, height - padBottom + 16);
    });
  }

  // ==========================================
  // 7. MODALS & POPUPS
  // ==========================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');

    if (modalId === 'goals-modal') {
      const goals = getGoals();
      document.getElementById('goal-calories').value = goals.calories;
      document.getElementById('goal-protein').value = goals.protein;
      document.getElementById('goal-carbs').value = goals.carbs;
      document.getElementById('goal-fat').value = goals.fat;
      document.getElementById('goal-water').value = goals.water;
    } else if (modalId === 'presets-modal') {
      document.getElementById('preset-search-input').value = '';
      renderPresets();
    } else if (modalId === 'history-modal') {
      renderWeeklyAnalytics();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // ==========================================
  // 8. BACKUP, IMPORT, EXPORT
  // ==========================================
  function exportData() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      goals: getGoals(),
      logs: getAllLogs(),
      water: getWaterData()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutritrack-backup-${getFormattedDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data backup downloaded');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.logs || typeof parsed.logs !== 'object') {
          throw new Error('Invalid backup format');
        }

        if (parsed.goals) saveGoals(parsed.goals);
        if (parsed.logs) saveAllLogs(parsed.logs);
        if (parsed.water) saveWaterData(parsed.water);

        renderAll();
        showToast('Backup restored successfully!');
      } catch (err) {
        alert('Failed to parse backup file. Please provide a valid NutriTrack JSON backup.');
      }
    };
    reader.readAsText(file);
  }

  function resetAllData() {
    if (confirm('DANGER: This will delete ALL logged meals, goals, and history permanently. Are you sure?')) {
      if (confirm('Please confirm once more: All stored data will be erased.')) {
        localStorage.removeItem(STORAGE_KEYS.GOALS);
        localStorage.removeItem(STORAGE_KEYS.LOGS);
        localStorage.removeItem(STORAGE_KEYS.WATER);
        renderAll();
        showToast('All data has been reset');
      }
    }
  }

  // ==========================================
  // 9. INITIALIZATION & EVENT LISTENERS
  // ==========================================
  function initEventListeners() {
    // Date Navigation
    document.getElementById('prev-date-btn').addEventListener('click', () => {
      const d = parseFormattedDate(currentDate);
      d.setDate(d.getDate() - 1);
      currentDate = getFormattedDate(d);
      renderAll();
    });

    document.getElementById('next-date-btn').addEventListener('click', () => {
      const d = parseFormattedDate(currentDate);
      d.setDate(d.getDate() + 1);
      currentDate = getFormattedDate(d);
      renderAll();
    });

    document.getElementById('today-btn').addEventListener('click', () => {
      currentDate = getFormattedDate(new Date());
      renderAll();
    });

    document.getElementById('date-picker').addEventListener('change', (e) => {
      if (e.target.value) {
        currentDate = e.target.value;
        renderAll();
      }
    });

    // Water Quick Controls
    document.getElementById('add-water-btn').addEventListener('click', () => {
      const current = getDayWater(currentDate);
      setDayWater(currentDate, current + 250);
      renderWaterTracker();
      showToast('Added 250ml water');
    });

    document.getElementById('remove-water-btn').addEventListener('click', () => {
      const current = getDayWater(currentDate);
      setDayWater(currentDate, current - 250);
      renderWaterTracker();
    });

    document.getElementById('reset-water-btn').addEventListener('click', () => {
      setDayWater(currentDate, 0);
      renderWaterTracker();
      showToast('Hydration reset');
    });

    // Food Form
    document.getElementById('food-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancel-edit-btn').addEventListener('click', resetForm);

    // Search filter in log
    document.getElementById('search-log-input').addEventListener('input', (e) => {
      currentFilter = e.target.value;
      renderMealLogs();
    });

    document.getElementById('clear-day-btn').addEventListener('click', clearCurrentDay);

    // Goals Form
    document.getElementById('goals-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedGoals = {
        calories: parseInt(document.getElementById('goal-calories').value, 10) || DEFAULT_GOALS.calories,
        protein: parseInt(document.getElementById('goal-protein').value, 10) || DEFAULT_GOALS.protein,
        carbs: parseInt(document.getElementById('goal-carbs').value, 10) || DEFAULT_GOALS.carbs,
        fat: parseInt(document.getElementById('goal-fat').value, 10) || DEFAULT_GOALS.fat,
        water: parseInt(document.getElementById('goal-water').value, 10) || DEFAULT_GOALS.water
      };
      saveGoals(updatedGoals);
      closeModal('goals-modal');
      renderAll();
      showToast('Daily goals updated');
    });

    // Presets search
    document.getElementById('preset-search-input').addEventListener('input', (e) => {
      renderPresets(e.target.value);
    });

    // Modals open triggers
    document.getElementById('open-goals-btn').addEventListener('click', () => openModal('goals-modal'));
    document.getElementById('open-presets-btn').addEventListener('click', () => openModal('presets-modal'));
    document.getElementById('open-history-btn').addEventListener('click', () => openModal('history-modal'));

    // Modals close triggers
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal(btn.getAttribute('data-close'));
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
        }
      });
    });

    // Backup & Restore
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    document.getElementById('import-data-btn').addEventListener('click', () => {
      document.getElementById('import-file-input').click();
    });
    document.getElementById('import-file-input').addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        importData(e.target.files[0]);
        e.target.value = '';
      }
    });
    document.getElementById('reset-all-data-btn').addEventListener('click', resetAllData);
  }

  // Pre-populate with sample breakfast & lunch if completely fresh
  function seedInitialDemoDataIfEmpty() {
    const all = getAllLogs();
    if (Object.keys(all).length === 0) {
      const today = getFormattedDate(new Date());
      const demoItems = [
        {
          id: 'demo_1',
          name: 'Oatmeal with Berries & Honey',
          meal: 'Breakfast',
          servings: 1,
          calories: 320,
          protein: 10,
          carbs: 58,
          fat: 6
        },
        {
          id: 'demo_2',
          name: 'Black Coffee with splash of milk',
          meal: 'Breakfast',
          servings: 1,
          calories: 25,
          protein: 1,
          carbs: 2,
          fat: 1
        },
        {
          id: 'demo_3',
          name: 'Grilled Chicken Salad with Olive Oil',
          meal: 'Lunch',
          servings: 1,
          calories: 450,
          protein: 42,
          carbs: 14,
          fat: 22
        }
      ];
      saveDayLog(today, demoItems);
      setDayWater(today, 1000);
    }
  }

  // Boot
  seedInitialDemoDataIfEmpty();
  initEventListeners();
  renderAll();
})();

