class MealTracker {
    static LIMITS = {
        CALORIES_MAX: 10000,
        MACRO_MAX: 1000,
        NAME_MAX_LENGTH: 100,
        NOTES_MAX_LENGTH: 1000
    };

    constructor() {
        this.editingMealId = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        const mealSection = document.querySelector('#meals');
        const template = InputValidator.createSafeElement('div');
        template.innerHTML = `
            <h2>Meal Tracker</h2>
            <div class="meal-summary">
                <h3>Today's Calories: <span id="total-calories">0</span> kcal</h3>
            </div>
            <form id="meal-form" class="input-form">
                <div class="form-group">
                    <label for="meal-name">Meal Name:</label>
                    <input type="text" id="meal-name" required maxlength="${MealTracker.LIMITS.NAME_MAX_LENGTH}">
                </div>
                <div class="form-group">
                    <label for="calories">Calories:</label>
                    <input type="number" id="calories" required min="0" max="${MealTracker.LIMITS.CALORIES_MAX}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="protein">Protein (g):</label>
                        <input type="number" id="protein" min="0" max="${MealTracker.LIMITS.MACRO_MAX}">
                    </div>
                    <div class="form-group">
                        <label for="carbs">Carbs (g):</label>
                        <input type="number" id="carbs" min="0" max="${MealTracker.LIMITS.MACRO_MAX}">
                    </div>
                    <div class="form-group">
                        <label for="fats">Fats (g):</label>
                        <input type="number" id="fats" min="0" max="${MealTracker.LIMITS.MACRO_MAX}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="recipe-link">Recipe Link (optional):</label>
                    <input type="url" id="recipe-link" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label for="meal-notes">Notes:</label>
                    <textarea id="meal-notes" rows="2" maxlength="${MealTracker.LIMITS.NOTES_MAX_LENGTH}" 
                        placeholder="How was the meal? What did you like about it?"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary" id="meal-submit-btn">Add Meal</button>
                    <button type="button" class="btn-secondary" id="meal-cancel-btn" style="display: none; margin-top: 1rem;">Cancel</button>
                </div>
            </form>
            <div id="meal-list" class="meal-list"></div>
        `;
        mealSection.appendChild(template);
        this.loadTodaysMeals();
        this.setupEventListeners();
        this.initialized = true;
    }

    setupEventListeners() {
        const form = document.getElementById('meal-form');
        const cancelBtn = document.getElementById('meal-cancel-btn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                if (this.editingMealId) {
                    this.handleUpdateMeal();
                } else {
                    this.handleAddMeal();
                }
            } catch (error) {
                alert(error.message);
            }
        });

        cancelBtn.addEventListener('click', () => {
            this.resetForm();
        });
    }

    handleAddMeal() {
        try {
            const mealData = this.getMealFormData();
            storage.addMeal(mealData);
            this.loadTodaysMeals();
            document.dispatchEvent(new Event('mealLogged'));
            ui.updateDashboard();
            this.resetForm();
        } catch (error) {
            throw new Error(`Failed to add meal: ${error.message}`);
        }
    }

    handleUpdateMeal() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const mealData = this.getMealFormData();
            
            if (storage.updateMeal(today, this.editingMealId, mealData)) {
                this.loadTodaysMeals();
                document.dispatchEvent(new Event('mealLogged'));
                this.resetForm();
            }
        } catch (error) {
            throw new Error(`Failed to update meal: ${error.message}`);
        }
    }

    getMealFormData() {
        const mealName = InputValidator.sanitizeText(document.getElementById('meal-name').value);
        if (!mealName || mealName.length > MealTracker.LIMITS.NAME_MAX_LENGTH) {
            throw new Error('Invalid meal name');
        }

        const calories = InputValidator.validateNumber(
            document.getElementById('calories').value,
            0,
            MealTracker.LIMITS.CALORIES_MAX
        );
        if (calories === null) {
            throw new Error('Invalid calories value');
        }

        const protein = InputValidator.validateNumber(
            document.getElementById('protein').value || 0,
            0,
            MealTracker.LIMITS.MACRO_MAX
        );
        const carbs = InputValidator.validateNumber(
            document.getElementById('carbs').value || 0,
            0,
            MealTracker.LIMITS.MACRO_MAX
        );
        const fats = InputValidator.validateNumber(
            document.getElementById('fats').value || 0,
            0,
            MealTracker.LIMITS.MACRO_MAX
        );

        const recipeLink = InputValidator.validateUrl(document.getElementById('recipe-link').value);
        if (document.getElementById('recipe-link').value && recipeLink === null) {
            throw new Error('Invalid recipe URL');
        }

        const notes = InputValidator.sanitizeText(document.getElementById('meal-notes').value);
        if (notes.length > MealTracker.LIMITS.NOTES_MAX_LENGTH) {
            throw new Error('Notes too long');
        }

        return {
            mealName,
            calories,
            protein: protein || 0,
            carbs: carbs || 0,
            fats: fats || 0,
            recipeLink,
            notes
        };
    }

    loadTodaysMeals() {
        const today = new Date().toISOString().split('T')[0];
        const todaysMeals = storage.getMealsByDate(today);
        
        document.getElementById('total-calories').textContent = todaysMeals.totalCalories;
        
        const mealList = document.getElementById('meal-list');
        mealList.innerHTML = '';
        
        todaysMeals.meals.forEach(meal => {
            const mealElement = InputValidator.createSafeElement('div', { class: 'meal-item' });
            
            // Create meal header
            const headerDiv = InputValidator.createSafeElement('div', { class: 'meal-header' });
            const title = InputValidator.createSafeElement('h4', {}, meal.mealName);
            headerDiv.appendChild(title);
            
            // Create action buttons
            const actionsDiv = InputValidator.createSafeElement('div', { class: 'meal-actions' });
            const editBtn = InputValidator.createSafeElement('button', { 
                class: 'btn-secondary',
                type: 'button'
            }, 'Edit');
            editBtn.addEventListener('click', () => this.editMeal(meal.id));
            
            const deleteBtn = InputValidator.createSafeElement('button', { 
                class: 'btn-danger',
                type: 'button'
            }, 'Delete');
            deleteBtn.addEventListener('click', () => this.deleteMeal(meal.id));
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            headerDiv.appendChild(actionsDiv);
            
            // Create meal details
            const detailsDiv = InputValidator.createSafeElement('div', { class: 'meal-details' });
            detailsDiv.appendChild(InputValidator.createSafeElement('p', {}, `Calories: ${meal.calories} kcal`));
            detailsDiv.appendChild(InputValidator.createSafeElement('p', {}, 
                `Protein: ${meal.protein}g | Carbs: ${meal.carbs}g | Fats: ${meal.fats}g`
            ));
            
            if (meal.recipeLink) {
                const linkP = InputValidator.createSafeElement('p');
                const link = InputValidator.createSafeElement('a', {
                    href: meal.recipeLink,
                    target: '_blank',
                    class: 'recipe-link'
                }, 'View Recipe');
                linkP.appendChild(link);
                detailsDiv.appendChild(linkP);
            }
            
            if (meal.notes) {
                detailsDiv.appendChild(InputValidator.createSafeElement('p', 
                    { class: 'meal-notes' }, 
                    meal.notes
                ));
            }
            
            mealElement.appendChild(headerDiv);
            mealElement.appendChild(detailsDiv);
            mealList.appendChild(mealElement);
        });
    }

    editMeal(mealId) {
        const today = new Date().toISOString().split('T')[0];
        const todaysMeals = storage.getMealsByDate(today);
        const meal = todaysMeals.meals.find(m => m.id === mealId);
        
        if (meal) {
            this.editingMealId = mealId;
            
            // Fill form with meal data - values are already sanitized in storage
            document.getElementById('meal-name').value = meal.mealName;
            document.getElementById('calories').value = meal.calories;
            document.getElementById('protein').value = meal.protein;
            document.getElementById('carbs').value = meal.carbs;
            document.getElementById('fats').value = meal.fats;
            document.getElementById('recipe-link').value = meal.recipeLink || '';
            document.getElementById('meal-notes').value = meal.notes || '';
            
            // Update UI to show editing state
            document.getElementById('meal-submit-btn').textContent = 'Update Meal';
            document.getElementById('meal-cancel-btn').style.display = 'inline-block';
            
            // Scroll form into view
            document.getElementById('meal-form').scrollIntoView({ behavior: 'smooth' });
        }
    }

    resetForm() {
        this.editingMealId = null;
        document.getElementById('meal-form').reset();
        document.getElementById('meal-submit-btn').textContent = 'Add Meal';
        document.getElementById('meal-cancel-btn').style.display = 'none';
    }

    deleteMeal(mealId) {
        const today = new Date().toISOString().split('T')[0];
        if (storage.deleteMeal(today, parseInt(mealId))) {
            this.loadTodaysMeals();
            document.dispatchEvent(new Event('mealLogged'));
        }
    }
}

// Initialize meal tracker
const mealTracker = new MealTracker();
