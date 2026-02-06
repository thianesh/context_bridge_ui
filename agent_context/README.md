# Frontend Agent Context - Vue 3 + Composition API + PrimeVue

This folder contains essential context and examples for generating frontend code in the same style as the Context Bridge project.

## 📁 Structure

- `coding-standards.md` - Coding conventions and best practices
- `primevue-usage.md` - PrimeVue component usage and configuration
- `api-patterns.md` - API call patterns and Supabase integration
- `component-examples/` - Example Vue components demonstrating common patterns
- `store-examples/` - Pinia store patterns and examples
- `router-patterns.md` - Vue Router usage patterns
- `project-info.md` - Project structure and dependencies

## 🎯 Tech Stack

- **Framework**: Vue 3.5+ with Composition API (`<script setup>`)
- **UI Library**: PrimeVue 4.3+ with Aura theme preset
- **State Management**: Pinia 3.0+
- **Styling**: Tailwind CSS 4.1+ with PrimeUI plugin
- **Backend**: Supabase (Auth + Database)
- **Router**: Vue Router 4.5+
- **Build Tool**: Vite 6.2+
- **Utilities**: @vueuse/core, @formkit/auto-animate

## 🎨 Theme Configuration

- **Theme**: Custom "Noir" preset based on PrimeVue Aura
- **Color Palette**: Zinc color scheme
- **Dark Mode**: Supported via `.my-app-dark` class selector
- **Icons**: PrimeIcons + Material Symbols

## 📖 Key Principles

1. **Always use Composition API** with `<script setup>` syntax
2. **PrimeVue components** for all UI elements (Button, Dialog, DataTable, etc.)
3. **Pinia stores** with `storeToRefs` for reactive state
4. **Reactive patterns** using `ref()`, `computed()`, `watch()`
5. **Async/await** with proper try-catch error handling
6. **Supabase client** for authentication and database operations
7. **Vue Router** for navigation with programmatic routing
8. **Auto-imports** for PrimeVue components via unplugin-vue-components

## 🚀 Quick Start

When generating code, refer to:
- `coding-standards.md` for syntax and patterns
- `primevue-usage.md` for UI component examples
- `api-patterns.md` for Supabase integration
- `component-examples/` for full component examples
- `store-examples/` for Pinia store patterns

## 📝 Usage

All code should follow the established patterns in this project. Check the examples before generating new components or features.
