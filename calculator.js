document.addEventListener('DOMContentLoaded', function() {
    // Отримуємо всі необхідні елементи
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Додаємо обробники подій
    calculateBtn.addEventListener('click', calculateProfit);
    resetBtn.addEventListener('click', resetForm);
    
    // Функція для розрахунку прибутку
    function calculateProfit() {
        // Отримуємо вхідні значення
        const power = parseFloat(document.getElementById('power').value);
        const currentError = parseFloat(document.getElementById('currentError').value);
        const improvedError = parseFloat(document.getElementById('improvedError').value);
        const price = parseFloat(document.getElementById('price').value);
        const tolerance = parseFloat(document.getElementById('tolerance').value);
        
        // Розраховуємо допустиме відхилення в МВт
        const toleranceMW = power * tolerance / 100;
        
        // Розрахунок для поточного стану системи
        const currentShare = calculateEnergyShare(power, toleranceMW, currentError);
        const currentResults = calculateProfitAndPenalty(power, currentShare, price);
        
        // Розрахунок для покращеного стану системи
        const improvedShare = calculateEnergyShare(power, toleranceMW, improvedError);
        const improvedResults = calculateProfitAndPenalty(power, improvedShare, price);
        
        // Виводимо результати
        document.getElementById('currentShare').textContent = (currentShare * 100).toFixed(1);
        document.getElementById('currentProfit').textContent = currentResults.profit.toFixed(1);
        document.getElementById('currentPenalty').textContent = currentResults.penalty.toFixed(1);
        document.getElementById('currentTotal').textContent = currentResults.total.toFixed(1);
        
        document.getElementById('improvedShare').textContent = (improvedShare * 100).toFixed(1);
        document.getElementById('improvedProfit').textContent = improvedResults.profit.toFixed(1);
        document.getElementById('improvedPenalty').textContent = improvedResults.penalty.toFixed(1);
        document.getElementById('improvedTotal').textContent = improvedResults.total.toFixed(1);
        
        // Розраховуємо збільшення прибутку
        const profitIncrease = improvedResults.total - currentResults.total;
        document.getElementById('profitIncrease').textContent = profitIncrease.toFixed(1);
    }
    
    // Функція для розрахунку частки енергії без небалансів
    function calculateEnergyShare(power, tolerance, error) {
        // Використовуємо нормальний розподіл для розрахунку частки
        // Функція розподілу для нормального розподілу
        const normalCDF = (x, mean, std) => {
            return 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))));
        };
        
        // Розраховуємо частку енергії в допустимому діапазоні
        const lowerBound = power - tolerance;
        const upperBound = power + tolerance;
        
        const share = normalCDF(upperBound, power, error) - normalCDF(lowerBound, power, error);
        
        return share;
    }
    
    // Допоміжна функція для розрахунку функції помилок (error function)
    function erf(x) {
        // Константи
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;
        
        // Знак x
        const sign = (x < 0) ? -1 : 1;
        x = Math.abs(x);
        
        // Формула A&S 7.1.26
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return sign * y;
    }
    
    // Функція для розрахунку прибутку та штрафів
    function calculateProfitAndPenalty(power, share, price) {
        // Кількість годин на добу
        const hours = 24;
        
        // Енергія без небалансів (МВт·год)
        const energyWithoutImbalance = power * hours * share;
        // Прибуток від енергії без небалансів (тис. грн)
        const profit = energyWithoutImbalance * price;
        
        // Енергія з небалансами (МВт·год)
        const energyWithImbalance = power * hours * (1 - share);
        // Штраф за енергію з небалансами (тис. грн)
        const penalty = energyWithImbalance * price;
        
        // Загальний прибуток (тис. грн)
        const total = profit - penalty;
        
        return {
            profit: profit,
            penalty: penalty,
            total: total
        };
    }
    
    // Функція для скидання форми
    function resetForm() {
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.value = input.defaultValue;
        });
        
        document.querySelectorAll('.result-group span').forEach(span => {
            span.textContent = '-';
        });
    }
    
    // Виконуємо розрахунок при завантаженні сторінки
    calculateProfit();
});