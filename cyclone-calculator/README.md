# Cyclone Parameter Calculator

Advanced cyclone parameter calculator with DOE integration, parametric studies, and optimization capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
cyclone-calculator/
├── src/
│   ├── js/
│   │   ├── modules/           # Core application modules
│   │   ├── components/        # Reusable UI components
│   │   └── utils/            # Utility functions
│   ├── css/
│   │   ├── components/       # Component-specific styles
│   │   ├── layouts/          # Layout styles
│   │   └── themes/           # Theme configurations
│   ├── html/
│   │   └── partials/         # HTML partial templates
│   └── index.html            # Main HTML entry point
├── assets/                   # Static assets
├── dist/                     # Production build output
├── config/                   # Configuration files
├── docs/                     # Documentation
└── tests/                    # Test files
```

## 🏗️ Architecture

### Modular Design
- **Separation of Concerns**: HTML, CSS, and JavaScript are properly separated
- **Component-Based**: Reusable components for charts, forms, and visualizations
- **Module System**: ES6 modules for better dependency management
- **Event-Driven**: Loose coupling through event emitters

### Key Modules
- **CycloneCalculator**: Core calculation engine
- **DOEIntegration**: Design of Experiments functionality
- **ParametricStudy**: Parameter variation analysis
- **ChartManager**: Centralized chart management
- **DataManager**: Data persistence and management

### Build System
- **Vite**: Fast development server and optimized builds
- **ES6+ Support**: Modern JavaScript features
- **CSS Processing**: Automated optimization and minification
- **Code Splitting**: Automatic bundle optimization

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

### Adding New Features
1. Create module in `src/js/modules/`
2. Add component in `src/js/components/`
3. Add styles in `src/css/components/`
4. Update main.js to integrate

### Performance Optimization
- **Lazy Loading**: Components load only when needed
- **Code Splitting**: Automatic bundle optimization
- **Asset Optimization**: Images and fonts optimized
- **Caching Strategy**: Proper cache headers for static assets

## 📊 Features

### DOE Integration
- Multiple design methods (Factorial, Central Composite, Latin Hypercube)
- Interactive visualization with separate tabs
- Parameter effects analysis
- Residual plots for model validation

### Parametric Studies
- Multi-parameter variation
- Real-time visualization
- Export capabilities

### Optimization
- Multi-objective optimization
- Constraint handling
- Pareto frontier analysis

## 🚀 Deployment

### Production Build
```bash
npm run build
```

Generates optimized files in `dist/` directory:
- Minified and compressed JavaScript
- Optimized CSS
- Asset optimization
- Source maps for debugging

### Environment Configuration
- Development: Hot reload, source maps, debugging tools
- Production: Minification, compression, optimization

## 🔍 Monitoring

### Performance Metrics
- Bundle size analysis
- Load time optimization
- Runtime performance monitoring

### Error Tracking
- Global error boundary
- Detailed error reporting
- User feedback integration

## 🤝 Contributing

1. Follow the established module structure
2. Add tests for new features
3. Update documentation
4. Follow coding standards (ESLint configuration)

## 📈 Benefits of This Architecture

### Maintainability
- ✅ Easy to find and fix bugs
- ✅ Clear separation of concerns
- ✅ Modular components
- ✅ Consistent coding patterns

### Scalability
- ✅ Add new features without affecting existing code
- ✅ Component reusability
- ✅ Efficient bundle splitting
- ✅ Performance optimization

### Developer Experience
- ✅ Fast development server
- ✅ Hot module replacement
- ✅ Excellent debugging tools
- ✅ Modern JavaScript features

### Production Ready
- ✅ Optimized builds
- ✅ Proper error handling
- ✅ Performance monitoring
- ✅ SEO optimization