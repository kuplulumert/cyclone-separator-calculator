// Main application entry point
import { CycloneCalculator } from './modules/CycloneCalculator.js';
import { DOEIntegration } from './modules/DOEIntegration.js';
import { ParametricStudy } from './modules/ParametricStudy.js';
import { ChartManager } from './modules/ChartManager.js';
import { UIController } from './modules/UIController.js';
import { DataManager } from './utils/DataManager.js';

class CycloneApp {
    constructor() {
        this.dataManager = new DataManager();
        this.chartManager = new ChartManager();
        this.uiController = new UIController();
        
        this.calculator = new CycloneCalculator(this.dataManager);
        this.doeIntegration = new DOEIntegration(this.dataManager, this.chartManager);
        this.parametricStudy = new ParametricStudy(this.dataManager, this.chartManager);
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadConfiguration();
            this.setupEventListeners();
            this.initializeComponents();
            this.uiController.showLoadingComplete();
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.uiController.showError('Application failed to initialize');
        }
    }
    
    async loadConfiguration() {
        // Load application configuration
        this.config = await this.dataManager.loadConfig();
    }
    
    setupEventListeners() {
        this.uiController.on('tabChange', this.handleTabChange.bind(this));
        this.calculator.on('calculationComplete', this.handleCalculationComplete.bind(this));
        this.doeIntegration.on('experimentComplete', this.handleExperimentComplete.bind(this));
    }
    
    initializeComponents() {
        this.chartManager.init();
        this.calculator.init();
        this.doeIntegration.init();
        this.parametricStudy.init();
    }
    
    handleTabChange(tabId) {
        switch(tabId) {
            case 'doe-tab':
                this.doeIntegration.activate();
                break;
            case 'param-study-tab':
                this.parametricStudy.activate();
                break;
            default:
                this.calculator.activate();
        }
    }
    
    handleCalculationComplete(results) {
        this.chartManager.updateCharts(results);
        this.dataManager.saveResults(results);
    }
    
    handleExperimentComplete(results) {
        this.doeIntegration.updateVisualization(results);
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cycloneApp = new CycloneApp();
});