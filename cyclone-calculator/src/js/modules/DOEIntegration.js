// DOE Integration Module
import { EventEmitter } from '../utils/EventEmitter.js';
import { DOEVisualization } from '../components/DOEVisualization.js';
import { DOEMatrix } from '../utils/DOEMatrix.js';

export class DOEIntegration extends EventEmitter {
    constructor(dataManager, chartManager) {
        super();
        this.dataManager = dataManager;
        this.chartManager = chartManager;
        this.visualization = new DOEVisualization(chartManager);
        this.doeMatrix = new DOEMatrix();
        
        this.experiments = [];
        this.results = [];
        this.isRunning = false;
    }
    
    init() {
        this.setupEventListeners();
        this.loadSavedExperiments();
    }
    
    setupEventListeners() {
        // DOE method selection
        document.getElementById('doe-method')?.addEventListener('change', 
            this.handleMethodChange.bind(this));
        
        // Matrix generation
        document.querySelector('[onclick="generateDOEMatrix()"]')?.addEventListener('click', 
            this.generateMatrix.bind(this));
        
        // Experiment execution
        document.querySelector('[onclick="runAllExperiments()"]')?.addEventListener('click', 
            this.runAllExperiments.bind(this));
        
        // Visualization controls
        this.visualization.on('chartUpdate', this.handleChartUpdate.bind(this));
    }
    
    activate() {
        this.visualization.show();
        this.updateUI();
    }
    
    handleMethodChange(event) {
        const method = event.target.value;
        this.updateExperimentInfo(method);
    }
    
    generateMatrix() {
        try {
            const parameters = this.getSelectedParameters();
            const method = document.getElementById('doe-method').value;
            const options = this.getDesignOptions();
            
            this.experiments = this.doeMatrix.generate(method, parameters, options);
            this.displayMatrix();
            this.updateStats();
            
            this.emit('matrixGenerated', { experiments: this.experiments });
        } catch (error) {
            console.error('Matrix generation failed:', error);
            this.showError('Failed to generate design matrix: ' + error.message);
        }
    }
    
    async runAllExperiments() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.results = [];
        
        try {
            for (let i = 0; i < this.experiments.length; i++) {
                const experiment = this.experiments[i];
                this.updateProgress(i, this.experiments.length);
                
                const result = await this.runSingleExperiment(experiment);
                this.results.push(result);
                
                this.emit('experimentComplete', { result, progress: i + 1, total: this.experiments.length });
            }
            
            this.updateVisualization();
            this.saveResults();
            
        } catch (error) {
            console.error('Experiment execution failed:', error);
            this.showError('Experiment failed: ' + error.message);
        } finally {
            this.isRunning = false;
            this.updateProgress(this.experiments.length, this.experiments.length);
        }
    }
    
    async runSingleExperiment(experiment) {
        // Simulate calculation with the experiment parameters
        return new Promise((resolve) => {
            setTimeout(() => {
                // This would call the actual cyclone calculation
                const result = this.calculateCyclonePerformance(experiment);
                resolve({
                    experimentId: experiment.id,
                    parameters: experiment,
                    ...result
                });
            }, 100); // Simulate calculation time
        });
    }
    
    calculateCyclonePerformance(parameters) {
        // This would integrate with the main cyclone calculation engine
        // For now, return mock results
        return {
            efficiency: Math.random() * 100,
            pressureDrop: Math.random() * 1000,
            escapedDust: Math.random() * 50,
            d50: Math.random() * 10
        };
    }
    
    updateVisualization() {
        if (this.results.length === 0) return;
        
        this.visualization.updateAxisSelectors(this.getSelectedParameters(), this.getResponseVariables());
        this.visualization.createMainChart(this.experiments, this.results);
        this.visualization.createEffectsChart(this.experiments, this.results);
        this.visualization.createResidualsChart(this.experiments, this.results);
    }
    
    getSelectedParameters() {
        // Extract selected parameters from UI
        const checkboxes = document.querySelectorAll('input[name="doe-param"]:checked');
        return Array.from(checkboxes).map(cb => ({
            name: cb.value,
            displayName: cb.dataset.displayName,
            min: parseFloat(cb.dataset.min),
            max: parseFloat(cb.dataset.max)
        }));
    }
    
    getResponseVariables() {
        return ['efficiency', 'pressureDrop', 'escapedDust', 'd50'];
    }
    
    getDesignOptions() {
        return {
            centerPoints: document.getElementById('include-center')?.checked || false,
            replicates: parseInt(document.getElementById('num-replicates')?.value) || 1
        };
    }
    
    displayMatrix() {
        const container = document.getElementById('doe-matrix-display');
        if (!container) return;
        
        // Generate matrix table HTML
        const html = this.generateMatrixHTML();
        container.innerHTML = html;
    }
    
    generateMatrixHTML() {
        if (this.experiments.length === 0) {
            return '<p class="text-gray-500">No experiments generated</p>';
        }
        
        const parameters = Object.keys(this.experiments[0]).filter(key => key !== 'id');
        
        let html = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Run</th>
                            ${parameters.map(param => 
                                `<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">${param}</th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
        `;
        
        this.experiments.forEach((exp, index) => {
            html += `
                <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                    <td class="px-3 py-2 text-sm text-gray-900">${exp.id}</td>
                    ${parameters.map(param => 
                        `<td class="px-3 py-2 text-sm text-gray-900">${exp[param].toFixed(3)}</td>`
                    ).join('')}
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        return html;
    }
    
    updateStats() {
        document.getElementById('doe-total-count').textContent = this.experiments.length;
        document.getElementById('doe-completed-count').textContent = this.results.length;
        document.getElementById('doe-pending-count').textContent = this.experiments.length - this.results.length;
    }
    
    updateProgress(current, total) {
        const percentage = (current / total) * 100;
        const progressBar = document.getElementById('doe-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }
    
    showError(message) {
        // Show error message to user
        console.error(message);
        // Could integrate with a toast notification system
    }
    
    saveResults() {
        this.dataManager.saveDOEResults({
            experiments: this.experiments,
            results: this.results,
            timestamp: new Date().toISOString()
        });
    }
    
    loadSavedExperiments() {
        const saved = this.dataManager.loadDOEResults();
        if (saved) {
            this.experiments = saved.experiments || [];
            this.results = saved.results || [];
            this.displayMatrix();
            this.updateStats();
            this.updateVisualization();
        }
    }
}