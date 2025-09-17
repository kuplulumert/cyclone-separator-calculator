// DOE Visualization Component
import { EventEmitter } from '../utils/EventEmitter.js';

export class DOEVisualization extends EventEmitter {
    constructor(chartManager) {
        super();
        this.chartManager = chartManager;
        this.activeTab = 'main-chart-tab';
        this.charts = {
            main: null,
            effects: null,
            residuals: null
        };
    }
    
    init() {
        this.setupTabNavigation();
        this.setupChartControls();
    }
    
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.doe-viz-tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.doeTab;
                this.switchTab(targetTab);
            });
        });
    }
    
    setupChartControls() {
        // Main chart controls
        document.getElementById('doe-chart-type')?.addEventListener('change', 
            () => this.updateMainChart());
        document.getElementById('doe-x-axis')?.addEventListener('change', 
            () => this.updateMainChart());
        document.getElementById('doe-y-axis')?.addEventListener('change', 
            () => this.updateMainChart());
        document.getElementById('doe-response-axis')?.addEventListener('change', 
            () => this.updateMainChart());
        
        // Effects chart controls
        document.getElementById('doe-effects-response')?.addEventListener('change', 
            () => this.updateEffectsChart());
        
        // Residuals chart controls
        document.getElementById('doe-residuals-response')?.addEventListener('change', 
            () => this.updateResidualsChart());
    }
    
    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.doe-viz-tab-button').forEach(btn => {
            btn.classList.remove('active', 'text-blue-600', 'border-blue-500');
            btn.classList.add('text-gray-500', 'border-transparent');
        });
        
        document.querySelector(`[data-doe-tab="${tabId}"]`).classList.add('active', 'text-blue-600', 'border-blue-500');
        document.querySelector(`[data-doe-tab="${tabId}"]`).classList.remove('text-gray-500', 'border-transparent');
        
        // Update tab content
        document.querySelectorAll('.doe-viz-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        document.getElementById(tabId)?.classList.remove('hidden');
        
        this.activeTab = tabId;
        this.emit('tabChanged', { tabId });
    }
    
    updateAxisSelectors(parameters, responses) {
        const selectors = [
            'doe-x-axis',
            'doe-y-axis', 
            'doe-response-axis',
            'doe-effects-response',
            'doe-residuals-response'
        ];
        
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            if (!select) return;
            
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select...</option>';
            
            if (selectorId.includes('response') || selectorId.includes('y-axis')) {
                responses.forEach(response => {
                    const option = document.createElement('option');
                    option.value = response;
                    option.textContent = this.getResponseDisplayName(response);
                    select.appendChild(option);
                });
            } else {
                parameters.forEach(param => {
                    const option = document.createElement('option');
                    option.value = param.name;
                    option.textContent = param.displayName;
                    select.appendChild(option);
                });
            }
            
            // Restore previous selection if still valid
            if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
                select.value = currentValue;
            }
        });
    }
    
    createMainChart(experiments, results) {
        const canvas = document.getElementById('doe-main-chart');
        if (!canvas) return;
        
        const xAxis = document.getElementById('doe-x-axis')?.value;
        const responseAxis = document.getElementById('doe-response-axis')?.value;
        
        if (!xAxis || !responseAxis) {
            this.showChartMessage(canvas, 'Select X-axis and Response variables');
            return;
        }
        
        const data = this.prepareScatterData(experiments, results, xAxis, responseAxis);
        
        if (this.charts.main) {
            this.charts.main.destroy();
        }
        
        this.charts.main = this.chartManager.createScatterPlot(canvas, {
            data: data,
            title: `${this.getResponseDisplayName(responseAxis)} vs ${xAxis}`,
            xLabel: xAxis,
            yLabel: this.getResponseDisplayName(responseAxis)
        });
        
        this.emit('chartUpdate', { type: 'main', chart: this.charts.main });
    }
    
    createEffectsChart(experiments, results) {
        const canvas = document.getElementById('doe-effects-chart');
        if (!canvas) return;
        
        const responseAxis = document.getElementById('doe-effects-response')?.value;
        
        if (!responseAxis) {
            this.showChartMessage(canvas, 'Select a response variable');
            return;
        }
        
        const effects = this.calculateParameterEffects(experiments, results, responseAxis);
        
        if (this.charts.effects) {
            this.charts.effects.destroy();
        }
        
        this.charts.effects = this.chartManager.createBarChart(canvas, {
            labels: effects.map(e => e.parameter),
            data: effects.map(e => e.effect),
            title: 'Parameter Effects',
            yLabel: 'Effect Magnitude (%)',
            backgroundColor: '#8b5cf6'
        });
        
        this.emit('chartUpdate', { type: 'effects', chart: this.charts.effects });
    }
    
    createResidualsChart(experiments, results) {
        const canvas = document.getElementById('doe-residuals-chart');
        if (!canvas) return;
        
        const responseAxis = document.getElementById('doe-residuals-response')?.value;
        
        if (!responseAxis) {
            this.showChartMessage(canvas, 'Select a response variable');
            return;
        }
        
        const residuals = this.calculateResiduals(results, responseAxis);
        
        if (this.charts.residuals) {
            this.charts.residuals.destroy();
        }
        
        this.charts.residuals = this.chartManager.createScatterPlot(canvas, {
            data: residuals,
            title: 'Residuals Plot',
            xLabel: 'Run Order',
            yLabel: 'Residual',
            pointColor: '#ef4444'
        });
        
        this.emit('chartUpdate', { type: 'residuals', chart: this.charts.residuals });
    }
    
    prepareScatterData(experiments, results, xParam, responseParam) {
        return results.map(result => {
            const experiment = experiments.find(exp => exp.id === result.experimentId);
            return {
                x: experiment[xParam],
                y: result[responseParam],
                label: `Run ${result.experimentId}`
            };
        }).filter(point => point.x !== undefined && point.y !== undefined);
    }
    
    calculateParameterEffects(experiments, results, responseParam) {
        const parameters = Object.keys(experiments[0]).filter(key => key !== 'id');
        
        return parameters.map(param => {
            const paramValues = results.map(result => {
                const experiment = experiments.find(exp => exp.id === result.experimentId);
                return experiment[param];
            });
            
            const responseValues = results.map(result => result[responseParam]);
            const correlation = this.calculateCorrelation(paramValues, responseValues);
            
            return {
                parameter: param,
                effect: Math.abs(correlation) * 100
            };
        });
    }
    
    calculateResiduals(results, responseParam) {
        const values = results.map(result => result[responseParam]);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        return values.map((value, index) => ({
            x: index + 1,
            y: value - mean
        }));
    }
    
    calculateCorrelation(x, y) {
        const n = x.length;
        if (n === 0 || n !== y.length) return 0;
        
        const meanX = x.reduce((sum, val) => sum + val, 0) / n;
        const meanY = y.reduce((sum, val) => sum + val, 0) / n;
        
        let numerator = 0;
        let denomX = 0;
        let denomY = 0;
        
        for (let i = 0; i < n; i++) {
            const deltaX = x[i] - meanX;
            const deltaY = y[i] - meanY;
            numerator += deltaX * deltaY;
            denomX += deltaX * deltaX;
            denomY += deltaY * deltaY;
        }
        
        const denominator = Math.sqrt(denomX * denomY);
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    showChartMessage(canvas, message) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'center';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }
    
    getResponseDisplayName(response) {
        const displayNames = {
            efficiency: 'Separation Efficiency (%)',
            pressureDrop: 'Pressure Drop (Pa)',
            escapedDust: 'Escaped Dust (g)',
            d50: 'Cut Diameter (μm)'
        };
        return displayNames[response] || response;
    }
    
    show() {
        document.getElementById('doe-tab')?.classList.remove('hidden');
    }
    
    hide() {
        document.getElementById('doe-tab')?.classList.add('hidden');
    }
    
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = { main: null, effects: null, residuals: null };
    }
}