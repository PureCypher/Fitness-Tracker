// Chart configurations and data management
class ChartManager {
    constructor() {
        this.charts = {};
        this.timeRangeFilter = '7d'; // Default to 7 days
        this.initializeCharts();
    }

    initializeCharts() {
        // Weight Progress Chart
        this.charts.weight = new Chart(document.getElementById('weightChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Body Weight',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Body Weight Progress'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: `Weight (${storage.getSettings().units})`
                        }
                    }
                }
            }
        });

        // Strength Progress Chart
        this.charts.strength = new Chart(document.getElementById('strengthChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Strength Progress (Last 7 Days)'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: `Weight (${storage.getSettings().units})`
                        }
                    }
                }
            }
        });

        // Cardio Progress Chart
        this.charts.cardio = new Chart(document.getElementById('cardioChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cardio Progress'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Duration (minutes)'
                        }
                    }
                }
            }
        });

        // Caloric Balance Chart
        this.charts.calories = new Chart(document.getElementById('caloriesChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Calories Consumed',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        data: []
                    },
                    {
                        label: 'Calories Burned',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Caloric Balance'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Calories'
                        }
                    }
                }
            }
        });

        // Water Intake History Chart
        this.charts.water = new Chart(document.getElementById('waterChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Water Intake',
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        data: []
                    },
                    {
                        label: 'Daily Goal',
                        type: 'line',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderDash: [5, 5],
                        fill: false,
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Water Intake History'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Volume (ml)'
                        }
                    }
                }
            }
        });

        // Goals Completion Chart
        this.charts.goals = new Chart(document.getElementById('goalsChart'), {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(255, 99, 132, 0.5)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Goals Progress'
                    }
                }
            }
        });

        // Workout Distribution Chart
        this.charts.distribution = new Chart(document.getElementById('distributionChart'), {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Workout Distribution'
                    }
                }
            }
        });
    }

    updateAllCharts() {
        this.updateWeightChart();
        this.updateStrengthChart();
        this.updateCardioChart();
        this.updateCaloriesChart();
        this.updateWaterChart();
        this.updateGoalsChart();
        this.updateDistributionChart();
    }

    getDateRange() {
        const end = new Date();
        const start = new Date();
        
        switch(this.timeRangeFilter) {
            case '7d':
                start.setDate(end.getDate() - 7);
                break;
            case '30d':
                start.setDate(end.getDate() - 30);
                break;
            case '90d':
                start.setDate(end.getDate() - 90);
                break;
            default:
                start.setDate(end.getDate() - 7);
        }
        
        return { start, end };
    }

    updateStrengthChart() {
        const { start, end } = this.getDateRange();
        const weightliftingData = window.storage.getWeightlifting().filter(entry => {
            const date = new Date(entry.date);
            return date >= start && date <= end;
        });

        // Group by exercise and date
        const exerciseData = {};
        weightliftingData.forEach(entry => {
            if (!exerciseData[entry.exercise]) {
                exerciseData[entry.exercise] = {};
            }
            const date = entry.date.split('T')[0];
            if (!exerciseData[entry.exercise][date]) {
                exerciseData[entry.exercise][date] = [];
            }
            const unit = storage.getSettings().units;
            const maxWeight = Math.max(...entry.sets.map(set => {
                const weight = set.weight;
                return unit === 'kg' ? WeightConverter.lbsToKg(weight) : weight;
            }));
            exerciseData[entry.exercise][date].push(maxWeight);
        });

        // Process data for chart
        const datasets = [];
        const colors = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
        ];

        let colorIndex = 0;
        for (const exercise in exerciseData) {
            const data = [];
            const dates = Object.keys(exerciseData[exercise]).sort();
            dates.forEach(date => {
                const maxWeight = Math.max(...exerciseData[exercise][date]);
                data.push(maxWeight);
            });

            datasets.push({
                label: exercise,
                data: data,
                borderColor: colors[colorIndex % colors.length],
                fill: false
            });
            colorIndex++;
        }

        this.charts.strength.data.labels = Object.keys(exerciseData[Object.keys(exerciseData)[0]] || {}).sort();
        this.charts.strength.data.datasets = datasets;
        this.charts.strength.update();
    }

    updateCardioChart() {
        const { start, end } = this.getDateRange();
        const cardioData = window.storage.getCardio().filter(entry => {
            const date = new Date(entry.date);
            return date >= start && date <= end;
        });

        // Group by type and date
        const typeData = {};
        cardioData.forEach(entry => {
            if (!typeData[entry.type]) {
                typeData[entry.type] = {};
            }
            const date = entry.date.split('T')[0];
            if (!typeData[entry.type][date]) {
                typeData[entry.type][date] = 0;
            }
            typeData[entry.type][date] += entry.duration;
        });

        // Process data for chart
        const datasets = [];
        const colors = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
        ];

        let colorIndex = 0;
        for (const type in typeData) {
            const data = [];
            const dates = Object.keys(typeData[type]).sort();
            dates.forEach(date => {
                data.push(typeData[type][date]);
            });

            datasets.push({
                label: type,
                data: data,
                borderColor: colors[colorIndex % colors.length],
                fill: false
            });
            colorIndex++;
        }

        this.charts.cardio.data.labels = Object.keys(typeData[Object.keys(typeData)[0]] || {}).sort();
        this.charts.cardio.data.datasets = datasets;
        this.charts.cardio.update();
    }

    updateCaloriesChart() {
        const { start, end } = this.getDateRange();
        const dates = [];
        const consumed = [];
        const burned = [];

        let current = new Date(start);
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            dates.push(dateStr);
            
            // Get calories consumed
            const mealsData = window.storage.getMealsByDate(dateStr);
            consumed.push(mealsData.totalCalories);

            // Estimate calories burned (simplified calculation)
            const cardioData = window.storage.getCardio().filter(entry => 
                entry.date.startsWith(dateStr)
            );
            const cardioCalories = cardioData.reduce((sum, entry) => sum + (entry.duration * 10), 0);
            
            const weightliftingData = window.storage.getWeightlifting().filter(entry =>
                entry.date.startsWith(dateStr)
            );
            const strengthCalories = weightliftingData.reduce((sum, entry) => 
                sum + (entry.sets.length * 5), 0);

            burned.push(cardioCalories + strengthCalories);

            current.setDate(current.getDate() + 1);
        }

        this.charts.calories.data.labels = dates;
        this.charts.calories.data.datasets[0].data = consumed;
        this.charts.calories.data.datasets[1].data = burned;
        this.charts.calories.update();
    }

    updateWaterChart() {
        const { start, end } = this.getDateRange();
        const waterHistory = window.storage.getWaterHistory();
        const dates = [];
        const intake = [];
        const goals = [];

        let current = new Date(start);
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            dates.push(dateStr);
            
            const dayData = waterHistory[dateStr] || { intake: 0, goal: 2000 };
            intake.push(dayData.intake);
            goals.push(dayData.goal);

            current.setDate(current.getDate() + 1);
        }

        this.charts.water.data.labels = dates;
        this.charts.water.data.datasets[0].data = intake;
        this.charts.water.data.datasets[1].data = goals;
        this.charts.water.update();
    }

    updateGoalsChart() {
        const goals = window.storage.getGoals();
        let completed = 0;
        let inProgress = 0;

        ['weekly', 'monthly', 'yearly'].forEach(duration => {
            goals[duration].forEach(goal => {
                if (goal.completed) {
                    completed++;
                } else {
                    inProgress++;
                }
            });
        });

        this.charts.goals.data.datasets[0].data = [completed, inProgress];
        this.charts.goals.update();
    }

    updateWeightChart() {
        try {
            const weightData = window.weightManager.getWeightDataForChart(this.timeRangeFilter);
            
            if (!weightData || !Array.isArray(weightData)) {
                console.warn('No valid weight data available');
                return;
            }
            
            // Sort data by date
            weightData.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            const labels = weightData.map(entry => entry.date);
            const weights = weightData.map(entry => entry.weight);

            this.charts.weight.data.labels = labels;
            this.charts.weight.data.datasets[0].data = weights;
            this.charts.weight.options.scales.y.title.text = `Weight (${storage.getSettings().units})`;
            this.charts.weight.update();
        } catch (error) {
            console.error('Error updating weight chart:', error);
        }
    }

    updateDistributionChart() {
        const { start, end } = this.getDateRange();
        const weightliftingData = window.storage.getWeightlifting().filter(entry => {
            const date = new Date(entry.date);
            return date >= start && date <= end;
        });

        // Group by exercise category
        const categoryData = {};
        weightliftingData.forEach(entry => {
            if (!categoryData[entry.category]) {
                categoryData[entry.category] = 0;
            }
            categoryData[entry.category]++;
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        this.charts.distribution.data.labels = labels;
        this.charts.distribution.data.datasets[0].data = data;
        this.charts.distribution.update();
    }

    setTimeRange(range) {
        this.timeRangeFilter = range;
        this.updateAllCharts();
    }
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chartManager = new ChartManager();
    window.chartManager.updateAllCharts();

    // Add event listeners for data changes
    document.addEventListener('weightliftingUpdated', () => {
        window.chartManager.updateStrengthChart();
        window.chartManager.updateDistributionChart();
        window.chartManager.updateCaloriesChart();
    });

    document.addEventListener('cardioUpdated', () => {
        window.chartManager.updateCardioChart();
        window.chartManager.updateCaloriesChart();
    });

    document.addEventListener('mealsUpdated', () => {
        window.chartManager.updateCaloriesChart();
    });

    document.addEventListener('waterUpdated', () => {
        window.chartManager.updateWaterChart();
    });

    document.addEventListener('goalsUpdated', () => {
        window.chartManager.updateGoalsChart();
    });

    // Update charts when weight unit changes
    document.addEventListener('weightUnitChanged', () => {
        const unit = storage.getSettings().units;
        window.chartManager.charts.strength.options.scales.y.title.text = `Weight (${unit})`;
        window.chartManager.charts.weight.options.scales.y.title.text = `Weight (${unit})`;
        window.chartManager.updateStrengthChart();
        window.chartManager.updateWeightChart();
    });

    // Update weight chart when weight is logged
    document.addEventListener('weightUpdated', () => {
        window.chartManager.updateWeightChart();
    });
});
