document.addEventListener('DOMContentLoaded', function () {
    // Firebase Firestore reference
    const db = firebase.firestore();

    const habitInput = document.getElementById('habit-input');
    const addHabitButton = document.getElementById('add-habit');
    const inputSection = document.getElementById('input-section');
    const habitsSection = document.getElementById('habits-section');
    const progressSection = document.getElementById('progress-container');
    const habitsList = document.getElementById('habits-list');
    const dateTimeDisplay = document.getElementById('date-time');
    const dailyTab = document.getElementById('daily-tab');
    const habitsTab = document.getElementById('habits-tab');
    const progressTab = document.getElementById('progress-tab');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const monthYearDisplay = document.getElementById('month-year');
    const progressTable = document.getElementById('progress-table');
    const entryScreen = document.getElementById('entry-screen');
    const entryPassword = document.getElementById('entry-password');
    const entryButton = document.getElementById('entry-button');

    let habits = [];
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let dailyHabitsStatus = {};
    let currentPasskey = '';

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    entryButton.addEventListener('click', function () {
        if (entryPassword.value.trim()) {
            currentPasskey = entryPassword.value.trim();
            loadUserData(currentPasskey);
            entryScreen.style.display = 'none';
        }
    });

    entryPassword.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && entryPassword.value.trim()) {
            currentPasskey = entryPassword.value.trim();
            loadUserData(currentPasskey);
            entryScreen.style.display = 'none';
        }
    });

    function loadUserData(passkey) {
        db.collection('users').doc(passkey).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                habits = data.habits;
                dailyHabitsStatus = data.dailyHabitsStatus;
                renderHabits();
                renderProgressTable();
            }
        }).catch((error) => {
            console.error("Error getting document:", error);
        });
    }

    function saveUserData() {
        db.collection('users').doc(currentPasskey).set({
            habits: habits,
            dailyHabitsStatus: dailyHabitsStatus
        }).catch((error) => {
            console.error("Error writing document: ", error);
        });
    }

    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        dateTimeDisplay.textContent = now.toLocaleDateString('en-US', options);
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    addHabitButton.addEventListener('click', addHabit);

    habitInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addHabit();
        }
    });

    function addHabit() {
        const habit = habitInput.value.trim();
        if (habit) {
            habits.push(habit);
            habitInput.value = '';
            renderHabits();
            renderProgressTable();
            saveUserData();
        }
    }

    function showHabitsSection() {
        inputSection.style.display = 'none';
        habitsSection.style.display = 'block';
        progressSection.style.display = 'none';
        renderHabits();
    }

    function showInputSection() {
        inputSection.style.display = 'block';
        habitsSection.style.display = 'none';
        progressSection.style.display = 'none';
    }

    function showProgressSection() {
        inputSection.style.display = 'none';
        habitsSection.style.display = 'none';
        progressSection.style.display = 'block';
        renderProgressTable();
    }

    dailyTab.addEventListener('click', showHabitsSection);
    habitsTab.addEventListener('click', showInputSection);
    progressTab.addEventListener('click', showProgressSection);

    prevMonthButton.addEventListener('click', function () {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear -= 1;
        } else {
            currentMonth -= 1;
        }
        renderProgressTable();
    });

    nextMonthButton.addEventListener('click', function () {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear += 1;
        } else {
            currentMonth += 1;
        }
        renderProgressTable();
    });

    function renderHabits() {
        habitsList.innerHTML = '';
        const today = new Date().toLocaleDateString('en-GB');
        dailyHabitsStatus[today] = dailyHabitsStatus[today] || {};

        habits.forEach(habit => {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = dailyHabitsStatus[today][habit] || false;
            checkbox.addEventListener('change', function () {
                dailyHabitsStatus[today][habit] = checkbox.checked;
                updateProgressTableForToday(habit, checkbox.checked);
                saveUserData();
                if (checkbox.checked) {
                    li.classList.add('completed');
                } else {
                    li.classList.remove('completed');
                }
            });
            li.textContent = habit;
            li.prepend(checkbox);
            if (checkbox.checked) {
                li.classList.add('completed');
            }
            habitsList.appendChild(li);
        });
    }

    function renderProgressTable() {
        monthYearDisplay.textContent = `${monthNames[currentMonth].toUpperCase()} ${currentYear}`;

        progressTable.innerHTML = '';

        const headerRow = document.createElement('tr');
        const emptyHeaderCell = document.createElement('th');
        headerRow.appendChild(emptyHeaderCell);

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const headerCell = document.createElement('th');
            headerCell.textContent = `${day}/${currentMonth + 1}`;
            headerRow.appendChild(headerCell);
        }

        progressTable.appendChild(headerRow);

        habits.forEach(habit => {
            const row = document.createElement('tr');
            const habitCell = document.createElement('td');
            habitCell.textContent = habit;
            row.appendChild(habitCell);

            for (let day = 1; day <= daysInMonth; day++) {
                const cell = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                const dateKey = `${day}/${currentMonth + 1}/${currentYear}`;
                checkbox.checked = dailyHabitsStatus[dateKey] && dailyHabitsStatus[dateKey][habit] || false;
                checkbox.addEventListener('change', function () {
                    dailyHabitsStatus[dateKey] = dailyHabitsStatus[dateKey] || {};
                    dailyHabitsStatus[dateKey][habit] = checkbox.checked;
                    updateColumnStatus(day);
                    saveUserData();
                    if (new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear) {
                        updateDailyTab(habit, checkbox.checked);
                    }
                });
                cell.appendChild(checkbox);
                row.appendChild(cell);
            }

            progressTable.appendChild(row);
        });

        // Update column status after rendering
        for (let day = 1; day <= daysInMonth; day++) {
            updateColumnStatus(day);
        }
    }

    function updateProgressTableForToday(habit, checked) {
        const today = new Date();
        const day = today.getDate();
        const dateKey = `${day}/${today.getMonth() + 1}/${today.getFullYear()}`;
        dailyHabitsStatus[dateKey] = dailyHabitsStatus[dateKey] || {};
        dailyHabitsStatus[dateKey][habit] = checked;
        renderProgressTable();
        saveUserData();
    }

    function updateDailyTab(habit, checked) {
        const today = new Date().toLocaleDateString('en-GB');
        dailyHabitsStatus[today] = dailyHabitsStatus[today] || {};
        dailyHabitsStatus[today][habit] = checked;

        const habitItems = habitsList.querySelectorAll('li');
        habitItems.forEach(item => {
            if (item.textContent.trim() === habit) {
                const checkbox = item.querySelector('input[type="checkbox"]');
                checkbox.checked = checked;
                if (checked) {
                    item.classList.add('completed');
                } else {
                    item.classList.remove('completed');
                }
            }
        });
    }

    function updateColumnStatus(day) {
        let allChecked = true;
        const checkboxes = progressTable.querySelectorAll(`tr td:nth-child(${day + 1}) input[type="checkbox"]`);
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                allChecked = false;
            }
        });

        const headerCell = progressTable.querySelector(`tr th:nth-child(${day + 1})`);
        if (allChecked) {
            headerCell.classList.add('completed');
        } else {
            headerCell.classList.remove('completed');
        }
    }
});
