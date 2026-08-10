import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import '../styles/beta.css';

const DIARY_VARIANTS = {
  control: {
    id: 'control',
    title: 'Food Diary (Control)',
    subtitle: 'Control group — track meals, snacks, drinks, mood, and energy across 7 days.',
    storageKey: 'oodball-food-diary-control',
    badgeClass: 'food-diary-variant-control',
  },
  intervention: {
    id: 'intervention',
    title: 'Food Diary (Intervention)',
    subtitle: 'Intervention group — track meals, snacks, drinks, mood, and energy across 7 days.',
    storageKey: 'oodball-food-diary-intervention',
    badgeClass: 'food-diary-variant-intervention',
  },
};

const LEGACY_STORAGE_KEY = 'oodball-food-diary';

const INTERVENTION_MEAL_PLAN = [
  'Mediterranean bulgur bowl',
  'Tuna and white bean salad',
  'Greek chicken pita with yogurt sauce',
  'Pasta al pomodoro with white beans and spinach',
  'Shakshuka with whole-grain bread',
  'Hummus and veggie pita',
  'Mediterranean couscous and chickpea salad',
];

const INTERVENTION_MEAL_PLAN_VEGETARIAN = [
  'Mediterranean bulgur bowl',
  'White bean and chickpea salad',
  'Greek halloumi pita with yogurt sauce',
  'Pasta al pomodoro with white beans and spinach',
  'Shakshuka with whole-grain bread',
  'Hummus and veggie pita',
  'Mediterranean couscous and chickpea salad',
];

function isMealPlanChoice(lunchChoice) {
  return lunchChoice === 'meal_plan' || lunchChoice === 'meal_plan_vegetarian';
}

function isMealPlanLunchComplete(entry) {
  if (entry.lunchPlanModified !== 'yes' && entry.lunchPlanModified !== 'no') {
    return false;
  }
  if (entry.lunchPlanModified === 'yes') {
    return Boolean(entry.lunchPlanChanges?.trim());
  }
  return true;
}

const DIARY_SECTIONS_BASE = [
  {
    title: 'Meals',
    categories: [
      { id: 'breakfast', label: 'Breakfast', type: 'text', placeholder: 'What did you have for breakfast?' },
      { id: 'lunch', label: 'Lunch', type: 'lunch', placeholder: 'What did you have for lunch?' },
      { id: 'dinner', label: 'Dinner', type: 'text', placeholder: 'What did you have for dinner?' },
      { id: 'snacks', label: 'Snacks', type: 'items', itemLabel: 'What you ate', quantityPlaceholder: '1, 100 ml, 1 cup, etc.' },
      { id: 'drinks', label: 'Drinks', type: 'items', itemLabel: 'What you drank', itemPlaceholder: 'Spezi or Wine', quantityPlaceholder: '100 ml, 1 Glass, 1 Can, 1 Bottle' },
    ],
  },
  {
    title: 'How You Feel',
    categories: [
      { id: 'mood', label: 'Overall Mood Today', type: 'rating' },
      { id: 'energy', label: 'Overall Energy Levels Today', type: 'rating' },
    ],
  },
];

function getDiarySections(variantId) {
  if (variantId !== 'intervention') {
    return DIARY_SECTIONS_BASE;
  }

  return DIARY_SECTIONS_BASE.map((section) => ({
    ...section,
    categories: section.categories.map((category) => (
      category.id === 'lunch'
        ? { ...category, type: 'intervention_lunch' }
        : category
    )),
  }));
}

const TRACKED_CATEGORY_IDS = ['breakfast', 'lunch', 'dinner', 'snacks', 'drinks', 'mood', 'energy'];
const TOTAL_CATEGORIES = TRACKED_CATEGORY_IDS.length;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const RATING_SCALE = [1, 2, 3, 4, 5];

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfWeek(date) {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  normalized.setDate(normalized.getDate() - 6);
  return normalized;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDayLabel(date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function createItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeItemList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => ({
      id: item.id || createItemId(),
      name: item.name || '',
      quantity: item.quantity || '',
    }));
  }

  if (typeof value === 'string' && value.trim()) {
    return [{ id: createItemId(), name: value.trim(), quantity: '' }];
  }

  return [];
}

function emptyDayEntry() {
  return {
    breakfast: '',
    lunch: '',
    lunchChoice: '',
    lunchOther: '',
    lunchPlanModified: '',
    lunchPlanChanges: '',
    lunchPhoto: '',
    dinner: '',
    snacks: [],
    drinks: [],
    mood: '',
    energy: '',
  };
}

function normalizeDayEntry(raw = {}) {
  return {
    ...emptyDayEntry(),
    ...raw,
    snacks: normalizeItemList(raw.snacks),
    drinks: normalizeItemList(raw.drinks),
  };
}

function isItemComplete(item) {
  return Boolean(item.name?.trim() && item.quantity?.trim());
}

function hasCompleteItems(items) {
  return normalizeItemList(items).some(isItemComplete);
}

function isRatingFilled(value) {
  const rating = Number(value);
  return rating >= 1 && rating <= 5;
}

function isLunchFilled(entry, variantId) {
  if (!entry.lunchPhoto) {
    return false;
  }

  if (variantId === 'intervention') {
    if (isMealPlanChoice(entry.lunchChoice)) {
      return isMealPlanLunchComplete(entry);
    }
    if (entry.lunchChoice === 'other') {
      return Boolean(entry.lunchOther?.trim());
    }
    return false;
  }

  return Boolean(entry.lunch?.trim());
}

function isCategoryFilled(dayEntries, categoryId, variantId) {
  const entry = normalizeDayEntry(dayEntries);

  if (categoryId === 'lunch') {
    return isLunchFilled(entry, variantId);
  }
  if (categoryId === 'snacks' || categoryId === 'drinks') {
    return hasCompleteItems(entry[categoryId]);
  }
  if (categoryId === 'mood' || categoryId === 'energy') {
    return isRatingFilled(entry[categoryId]);
  }
  return Boolean(entry[categoryId]?.trim());
}

function isDayComplete(dayEntries, variantId) {
  const entry = normalizeDayEntry(dayEntries);

  return (
    entry.breakfast?.trim() &&
    isLunchFilled(entry, variantId) &&
    entry.dinner?.trim() &&
    hasCompleteItems(entry.snacks) &&
    hasCompleteItems(entry.drinks) &&
    isRatingFilled(entry.mood) &&
    isRatingFilled(entry.energy)
  );
}

function countFilledCategories(dayEntries, variantId) {
  return TRACKED_CATEGORY_IDS.filter((id) => isCategoryFilled(dayEntries, id, variantId)).length;
}

function loadDiaryState(storageKey) {
  try {
    let raw = localStorage.getItem(storageKey);

    if (!raw && storageKey === DIARY_VARIANTS.control.storageKey) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (!raw) {
      return { weekStart: toDateKey(startOfWeek(new Date())), entries: {} };
    }

    const parsed = JSON.parse(raw);
    return {
      weekStart: parsed.weekStart || toDateKey(startOfWeek(new Date())),
      entries: parsed.entries || {},
    };
  } catch {
    return { weekStart: toDateKey(startOfWeek(new Date())), entries: {} };
  }
}

function getTodayIndexInWeek(weekDays) {
  const todayKey = toDateKey(new Date());
  const index = weekDays.findIndex((day) => toDateKey(day) === todayKey);
  return index >= 0 ? index : 0;
}

function ItemListField({ category, items, onAddItem, onRemoveItem }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !quantity.trim()) return;

    onAddItem({
      id: createItemId(),
      name: name.trim(),
      quantity: quantity.trim(),
    });
    setName('');
    setQuantity('');
  };

  return (
    <div className="food-diary-meal">
      <span className="food-diary-meal-label">{category.label}</span>

      {items.length > 0 && (
        <ul className="food-diary-item-list">
          {items.map((item) => (
            <li key={item.id} className="food-diary-item-row">
              <div className="food-diary-item-summary">
                <span>{item.quantity} {item.name}</span>
              </div>
              <button
                type="button"
                className="food-diary-item-remove"
                onClick={() => onRemoveItem(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="food-diary-item-form">
        <label className="food-diary-item-field">
          <span>{category.itemLabel}</span>
          <input
            type="text"
            value={name}
            placeholder={category.itemPlaceholder || 'Apple'}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="food-diary-item-field">
          <span>Quantity</span>
          <input
            type="text"
            value={quantity}
            placeholder={category.quantityPlaceholder}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="food-diary-secondary food-diary-item-add"
          onClick={handleAdd}
          disabled={!name.trim() || !quantity.trim()}
        >
          Add Item
        </button>
      </div>
    </div>
  );
}

function FoodDiaryPage({ variant }) {
  const [weekStartKey, setWeekStartKey] = useState(() => loadDiaryState(variant.storageKey).weekStart);
  const [entries, setEntries] = useState(() => loadDiaryState(variant.storageKey).entries);
  const [savedAt, setSavedAt] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const weekDays = useMemo(() => {
    const start = parseDateKey(weekStartKey);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [weekStartKey]);

  useEffect(() => {
    const start = parseDateKey(weekStartKey);
    const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    setSelectedDayIndex(getTodayIndexInWeek(days));
  }, [weekStartKey]);

  const weekEndLabel = useMemo(() => {
    const end = weekDays[6];
    return end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }, [weekDays]);

  const weekStartLabel = useMemo(() => {
    const start = weekDays[0];
    return start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }, [weekDays]);

  useEffect(() => {
    localStorage.setItem(variant.storageKey, JSON.stringify({ weekStart: weekStartKey, entries }));
    setSavedAt(new Date());
  }, [variant.storageKey, weekStartKey, entries]);

  const updateEntry = useCallback((dateKey, field, value) => {
    setEntries((current) => ({
      ...current,
      [dateKey]: normalizeDayEntry({
        ...current[dateKey],
        [field]: value,
      }),
    }));
  }, []);

  const updateDayFields = useCallback((dateKey, fields) => {
    setEntries((current) => ({
      ...current,
      [dateKey]: normalizeDayEntry({
        ...current[dateKey],
        ...fields,
      }),
    }));
  }, []);

  const addListItem = useCallback((dateKey, field, item) => {
    setEntries((current) => {
      const dayEntry = normalizeDayEntry(current[dateKey]);
      return {
        ...current,
        [dateKey]: {
          ...dayEntry,
          [field]: [...dayEntry[field], item],
        },
      };
    });
  }, []);

  const removeListItem = useCallback((dateKey, field, itemId) => {
    setEntries((current) => {
      const dayEntry = normalizeDayEntry(current[dateKey]);
      return {
        ...current,
        [dateKey]: {
          ...dayEntry,
          [field]: dayEntry[field].filter((item) => item.id !== itemId),
        },
      };
    });
  }, []);

  const handleLunchPhotoChange = useCallback((dateKey, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Please choose an image file.');
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      window.alert('Image must be 5 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateEntry(dateKey, 'lunchPhoto', reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [updateEntry]);

  const toggleRating = useCallback((dateKey, field, value) => {
    setEntries((current) => {
      const dayEntry = normalizeDayEntry(current[dateKey]);
      const currentValue = dayEntry[field] || '';
      return {
        ...current,
        [dateKey]: {
          ...dayEntry,
          [field]: currentValue === String(value) ? '' : String(value),
        },
      };
    });
  }, []);

  const shiftWeek = useCallback((direction) => {
    setWeekStartKey((current) => toDateKey(addDays(parseDateKey(current), direction * 7)));
  }, []);

  const shiftDay = useCallback((direction) => {
    setSelectedDayIndex((current) => Math.min(6, Math.max(0, current + direction)));
  }, []);

  const resetWeek = useCallback(() => {
    const confirmed = window.confirm('Clear all entries for this 7-day period?');
    if (!confirmed) return;

    setEntries((current) => {
      const next = { ...current };
      weekDays.forEach((day) => {
        delete next[toDateKey(day)];
      });
      return next;
    });
  }, [weekDays]);

  const resetToCurrentWeek = useCallback(() => {
    setWeekStartKey(toDateKey(startOfWeek(new Date())));
  }, []);

  const filledEntryCount = useMemo(() => {
    return weekDays.reduce((count, day) => {
      const dayKey = toDateKey(day);
      const dayEntries = normalizeDayEntry(entries[dayKey]);
      return count + countFilledCategories(dayEntries, variant.id);
    }, 0);
  }, [entries, weekDays, variant.id]);

  const completedDayCount = useMemo(() => {
    return weekDays.reduce((count, day) => {
      const dayEntries = normalizeDayEntry(entries[toDateKey(day)]);
      return count + (isDayComplete(dayEntries, variant.id) ? 1 : 0);
    }, 0);
  }, [entries, weekDays, variant.id]);

  const selectedDay = weekDays[selectedDayIndex];
  const selectedDayKey = toDateKey(selectedDay);
  const selectedDayEntries = normalizeDayEntry(entries[selectedDayKey]);
  const isToday = selectedDayKey === toDateKey(new Date());
  const dayEntryCount = countFilledCategories(selectedDayEntries, variant.id);
  const isSelectedDayComplete = isDayComplete(selectedDayEntries, variant.id);
  const diarySections = useMemo(() => getDiarySections(variant.id), [variant.id]);
  const plannedInterventionMeal = INTERVENTION_MEAL_PLAN[selectedDayIndex];
  const plannedInterventionVegetarianMeal = INTERVENTION_MEAL_PLAN_VEGETARIAN[selectedDayIndex];

  const renderCategory = (category) => {
    if (category.type === 'rating') {
      const selectedValue = selectedDayEntries[category.id];

      return (
        <div key={category.id} className="food-diary-meal">
          <span className="food-diary-meal-label">{category.label}</span>
          <div className="food-diary-rating" role="group" aria-label={`${category.label} out of 5`}>
            {RATING_SCALE.map((value) => (
              <button
                key={value}
                type="button"
                className={`food-diary-rating-btn${selectedValue === String(value) ? ' food-diary-rating-btn-active' : ''}`}
                onClick={() => toggleRating(selectedDayKey, category.id, value)}
                aria-pressed={selectedValue === String(value)}
              >
                {value}
              </button>
            ))}
            <span className="food-diary-rating-hint">out of 5</span>
          </div>
        </div>
      );
    }

    if (category.type === 'intervention_lunch') {
      const lunchChoice = selectedDayEntries.lunchChoice;

      return (
        <div key={category.id} className="food-diary-meal">
          <span className="food-diary-meal-label">{category.label}</span>

          <div className="food-diary-lunch-options" role="radiogroup" aria-label="Lunch choice">
            <label className={`food-diary-lunch-option${lunchChoice === 'meal_plan' ? ' food-diary-lunch-option-selected' : ''}`}>
              <input
                type="radio"
                name={`${selectedDayKey}-lunch-choice`}
                checked={lunchChoice === 'meal_plan'}
                onChange={() => updateDayFields(selectedDayKey, {
                  lunchChoice: 'meal_plan',
                  lunch: plannedInterventionMeal,
                  lunchOther: '',
                  lunchPlanModified: '',
                  lunchPlanChanges: '',
                })}
              />
              <span>
                <strong>Today&apos;s meal plan</strong>
                {plannedInterventionMeal}
              </span>
            </label>

            <label className={`food-diary-lunch-option${lunchChoice === 'meal_plan_vegetarian' ? ' food-diary-lunch-option-selected' : ''}`}>
              <input
                type="radio"
                name={`${selectedDayKey}-lunch-choice`}
                checked={lunchChoice === 'meal_plan_vegetarian'}
                onChange={() => updateDayFields(selectedDayKey, {
                  lunchChoice: 'meal_plan_vegetarian',
                  lunch: plannedInterventionVegetarianMeal,
                  lunchOther: '',
                  lunchPlanModified: '',
                  lunchPlanChanges: '',
                })}
              />
              <span>
                <strong>Today&apos;s meal plan (vegetarian)</strong>
                {plannedInterventionVegetarianMeal}
              </span>
            </label>

            <label className={`food-diary-lunch-option${lunchChoice === 'other' ? ' food-diary-lunch-option-selected' : ''}`}>
              <input
                type="radio"
                name={`${selectedDayKey}-lunch-choice`}
                checked={lunchChoice === 'other'}
                onChange={() => updateDayFields(selectedDayKey, {
                  lunchChoice: 'other',
                  lunch: selectedDayEntries.lunchOther || '',
                  lunchPlanModified: '',
                  lunchPlanChanges: '',
                })}
              />
              <span>
                <strong>Other</strong>
                Something else
              </span>
            </label>
          </div>

          {isMealPlanChoice(lunchChoice) && (
            <div className="food-diary-lunch-followup">
              <span className="food-diary-meal-label">Did you make changes to the plan?</span>
              <div className="food-diary-yes-no" role="radiogroup" aria-label="Did you make changes to the plan?">
                <label className={`food-diary-yes-no-option${selectedDayEntries.lunchPlanModified === 'no' ? ' food-diary-yes-no-option-selected' : ''}`}>
                  <input
                    type="radio"
                    name={`${selectedDayKey}-lunch-plan-modified`}
                    checked={selectedDayEntries.lunchPlanModified === 'no'}
                    onChange={() => updateDayFields(selectedDayKey, {
                      lunchPlanModified: 'no',
                      lunchPlanChanges: '',
                    })}
                  />
                  No
                </label>
                <label className={`food-diary-yes-no-option${selectedDayEntries.lunchPlanModified === 'yes' ? ' food-diary-yes-no-option-selected' : ''}`}>
                  <input
                    type="radio"
                    name={`${selectedDayKey}-lunch-plan-modified`}
                    checked={selectedDayEntries.lunchPlanModified === 'yes'}
                    onChange={() => updateDayFields(selectedDayKey, {
                      lunchPlanModified: 'yes',
                    })}
                  />
                  Yes
                </label>
              </div>

              {selectedDayEntries.lunchPlanModified === 'yes' && (
                <label className="food-diary-meal-field" htmlFor={`${selectedDayKey}-lunch-plan-changes`}>
                  <span className="food-diary-meal-label">What did you change?</span>
                  <textarea
                    id={`${selectedDayKey}-lunch-plan-changes`}
                    rows={3}
                    placeholder="Describe any changes you made to today's meal plan"
                    value={selectedDayEntries.lunchPlanChanges}
                    onChange={(event) => updateDayFields(selectedDayKey, {
                      lunchPlanChanges: event.target.value,
                    })}
                  />
                </label>
              )}
            </div>
          )}

          {lunchChoice === 'other' && (
            <label className="food-diary-meal-field" htmlFor={`${selectedDayKey}-lunch-other`}>
              <span className="food-diary-meal-label">What did you eat?</span>
              <textarea
                id={`${selectedDayKey}-lunch-other`}
                rows={3}
                placeholder="Describe what you had for lunch"
                value={selectedDayEntries.lunchOther}
                onChange={(event) => updateDayFields(selectedDayKey, {
                  lunchOther: event.target.value,
                  lunch: event.target.value,
                })}
              />
            </label>
          )}

          <div className="food-diary-lunch-photo">
            <span className="food-diary-meal-label">Lunch Photo</span>
            {selectedDayEntries.lunchPhoto ? (
              <div className="food-diary-photo-preview">
                <img src={selectedDayEntries.lunchPhoto} alt="Lunch for this day" />
                <button
                  type="button"
                  className="food-diary-secondary"
                  onClick={() => updateEntry(selectedDayKey, 'lunchPhoto', '')}
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <label className="food-diary-photo-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleLunchPhotoChange(selectedDayKey, event)}
                />
                Add a lunch photo
              </label>
            )}
          </div>
        </div>
      );
    }

    if (category.type === 'lunch') {
      return (
        <div key={category.id} className="food-diary-meal">
          <label className="food-diary-meal-field" htmlFor={`${selectedDayKey}-lunch`}>
            <span className="food-diary-meal-label">{category.label}</span>
            <textarea
              id={`${selectedDayKey}-lunch`}
              rows={3}
              placeholder={category.placeholder}
              value={selectedDayEntries.lunch}
              onChange={(event) => updateEntry(selectedDayKey, 'lunch', event.target.value)}
            />
          </label>

          <div className="food-diary-lunch-photo">
            <span className="food-diary-meal-label">Lunch Photo</span>
            {selectedDayEntries.lunchPhoto ? (
              <div className="food-diary-photo-preview">
                <img src={selectedDayEntries.lunchPhoto} alt="Lunch for this day" />
                <button
                  type="button"
                  className="food-diary-secondary"
                  onClick={() => updateEntry(selectedDayKey, 'lunchPhoto', '')}
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <label className="food-diary-photo-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleLunchPhotoChange(selectedDayKey, event)}
                />
                Add a lunch photo
              </label>
            )}
          </div>
        </div>
      );
    }

    if (category.type === 'items') {
      return (
        <ItemListField
          key={category.id}
          category={category}
          items={selectedDayEntries[category.id]}
          onAddItem={(item) => addListItem(selectedDayKey, category.id, item)}
          onRemoveItem={(itemId) => removeListItem(selectedDayKey, category.id, itemId)}
        />
      );
    }

    return (
      <label key={category.id} className="food-diary-meal" htmlFor={`${selectedDayKey}-${category.id}`}>
        <span className="food-diary-meal-label">{category.label}</span>
        <textarea
          id={`${selectedDayKey}-${category.id}`}
          rows={3}
          placeholder={category.placeholder}
          value={selectedDayEntries[category.id]}
          onChange={(event) => updateEntry(selectedDayKey, category.id, event.target.value)}
        />
      </label>
    );
  };

  return (
    <div className="food-diary">
      <header className="food-diary-header">
        <div className="food-diary-header-top">
          <Link to="/beta" className="food-diary-back">← Beta Lab</Link>
          <div className="food-diary-header-badges">
            <span className="beta-badge">BETA</span>
            <span className={`food-diary-variant-badge ${variant.badgeClass}`}>
              {variant.id === 'control' ? 'Control' : 'Intervention'}
            </span>
          </div>
        </div>
        <h1>{variant.title}</h1>
        <p>{variant.subtitle}</p>
      </header>

      <section className="food-diary-controls">
        <div className="food-diary-week-nav">
          <button type="button" onClick={() => shiftWeek(-1)} aria-label="Previous week">
            ← Prev
          </button>
          <div className="food-diary-week-range">
            <strong>{weekStartLabel}</strong>
            <span>to</span>
            <strong>{weekEndLabel}</strong>
          </div>
          <button type="button" onClick={() => shiftWeek(1)} aria-label="Next week">
            Next →
          </button>
        </div>

        <div className="food-diary-actions">
          <button type="button" className="food-diary-secondary" onClick={resetToCurrentWeek}>
            Jump to This Week
          </button>
          <button type="button" className="food-diary-secondary" onClick={resetWeek}>
            Clear This Week
          </button>
        </div>

        <p className="food-diary-meta">
          {filledEntryCount} of {7 * TOTAL_CATEGORIES} entries logged
          <span> · {completedDayCount} of 7 days complete</span>
          {savedAt && (
            <span> · Saved {savedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
          )}
        </p>
      </section>

      <nav className="food-diary-day-tabs" aria-label="Select day">
        {weekDays.map((day, index) => {
          const dayKey = toDateKey(day);
          const dayEntries = normalizeDayEntry(entries[dayKey]);
          const hasEntries = countFilledCategories(dayEntries, variant.id) > 0;
          const isComplete = isDayComplete(dayEntries, variant.id);
          const isSelected = index === selectedDayIndex;
          const isDayToday = dayKey === toDateKey(new Date());

          return (
            <button
              key={dayKey}
              type="button"
              className={`food-diary-day-tab${isSelected ? ' food-diary-day-tab-active' : ''}${isDayToday ? ' food-diary-day-tab-today' : ''}${isComplete ? ' food-diary-day-tab-complete' : ''}`}
              onClick={() => setSelectedDayIndex(index)}
              aria-current={isSelected ? 'true' : undefined}
            >
              <span className="food-diary-day-tab-label">Day {index + 1}</span>
              <span className="food-diary-day-tab-date">{formatDayLabel(day)}</span>
              {isComplete ? (
                <span className="food-diary-day-tab-complete-label">Complete</span>
              ) : (
                hasEntries && <span className="food-diary-day-tab-dot" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>

      <section className="food-diary-days">
        <article className={`food-diary-day${isToday ? ' food-diary-day-today' : ''}${isSelectedDayComplete ? ' food-diary-day-complete' : ''}`}>
          <header className="food-diary-day-header">
            <div className="food-diary-day-nav">
              <button
                type="button"
                onClick={() => shiftDay(-1)}
                disabled={selectedDayIndex === 0}
                aria-label="Previous day"
              >
                ←
              </button>
              <div>
                <h2>Day {selectedDayIndex + 1}</h2>
                <span>{formatDayLabel(selectedDay)}{isToday ? ' · Today' : ''}</span>
              </div>
              <button
                type="button"
                onClick={() => shiftDay(1)}
                disabled={selectedDayIndex === 6}
                aria-label="Next day"
              >
                →
              </button>
            </div>

            {isSelectedDayComplete ? (
              <p className="food-diary-complete-banner">Diary complete for this day</p>
            ) : (
              <p className="food-diary-day-meta">{dayEntryCount} of {TOTAL_CATEGORIES} categories logged</p>
            )}
          </header>

          <div className="food-diary-sections">
            {diarySections.map((section) => (
              <section key={section.title} className="food-diary-section">
                <h3 className="food-diary-section-title">{section.title}</h3>
                <div className="food-diary-meals">
                  {section.categories.map((category) => renderCategory(category))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function FoodDiary() {
  const { variant: variantParam } = useParams();
  const variant = DIARY_VARIANTS[variantParam];

  if (!variant) {
    return <Navigate to="/beta/food-diary/control" replace />;
  }

  return <FoodDiaryPage key={variant.id} variant={variant} />;
}

export default FoodDiary;
