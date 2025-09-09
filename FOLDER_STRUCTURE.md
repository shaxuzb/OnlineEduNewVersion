# 📁 Folder Structure

This document explains the improved, organized folder structure for the OnlineEduApp React Native project.

## 🏗️ Project Structure Overview

```
OnlineEduApp/
├── src/                          # Main source code directory
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Basic UI components (buttons, cards, etc.)
│   │   ├── forms/               # Form-related components
│   │   └── index.ts             # Component exports
│   ├── screens/                 # Screen components organized by feature
│   │   ├── courses/             # Course-related screens
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── AlgebraScreen.tsx
│   │   │   ├── GeometriyaScreen.tsx
│   │   │   └── CourseDetailScreen.tsx
│   │   ├── profile/             # Profile-related screens
│   │   ├── news/                # News-related screens
│   │   └── save/                # Saved content screens
│   ├── navigation/              # Navigation configuration
│   │   ├── AppNavigation.tsx    # Main navigation setup
│   │   └── CoursesStackNavigator.tsx
│   ├── services/                # API services and data management
│   │   └── courseService.ts     # Course data management
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts             # Shared interfaces and types
│   ├── utils/                   # Utility functions and constants
│   │   └── index.ts             # Colors, spacing, helper functions
│   ├── hooks/                   # Custom React hooks
│   └── assets/                  # Static assets
│       ├── images/              # Image files
│       └── icons/               # Icon files
├── android/                     # Android-specific files
├── assets/                      # Expo managed assets
├── App.tsx                      # Root component
├── package.json                 # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## 🎯 Benefits of This Structure

### 1. **Scalability**
- Easy to add new features without cluttering
- Components and screens are logically grouped
- Clear separation of concerns

### 2. **Maintainability**
- Easy to find and update specific functionality
- Consistent naming conventions
- Reusable components in dedicated folders

### 3. **Developer Experience**
- Clear import paths
- TypeScript support with proper types
- Centralized utilities and constants

### 4. **Team Collaboration**
- Clear structure for multiple developers
- Consistent code organization
- Easy onboarding for new team members

## 📋 Folder Descriptions

### `/src/components/`
Contains reusable UI components:
- **ui/**: Basic components (CategoryCard, LessonCard, VideoPlayer)
- **forms/**: Form-specific components (inputs, validation)
- **index.ts**: Central export file for easy imports

### `/src/screens/`
Screen components organized by feature:
- **courses/**: All course-related screens
- **profile/**: User profile and settings screens
- **news/**: News and updates screens
- **save/**: Saved content and bookmarks

### `/src/navigation/`
Navigation configuration:
- **AppNavigation.tsx**: Main tab navigator
- **CoursesStackNavigator.tsx**: Course screens stack

### `/src/services/`
Data management and API calls:
- **courseService.ts**: Course data and business logic
- Future: authService.ts, apiService.ts, etc.

### `/src/types/`
TypeScript definitions:
- **index.ts**: Shared interfaces (Lesson, Course, User, etc.)

### `/src/utils/`
Utilities and constants:
- **index.ts**: Colors, spacing, helper functions

### `/src/hooks/`
Custom React hooks (future use)

## 🚀 Usage Examples

### Importing Components
```tsx
// Clean imports from index files
import { CategoryCard, LessonCard } from '../../components';
import { COLORS, SPACING } from '../../utils';
import { CourseSection } from '../../types';
```

### Adding New Features
```
1. Create screen in appropriate folder: src/screens/newFeature/
2. Add components in: src/components/ui/ or src/components/forms/
3. Add types in: src/types/index.ts
4. Add services in: src/services/
5. Update navigation if needed
```

## 📝 Naming Conventions

### Files and Folders
- **PascalCase**: Components and screens (HomeScreen.tsx, CategoryCard.tsx)
- **camelCase**: Services and utilities (courseService.ts, index.ts)
- **kebab-case**: Folders with multiple words (if needed)

### Components
- Screen components: `[Feature]Screen` (HomeScreen, AlgebraScreen)
- UI components: Descriptive names (CategoryCard, LessonCard)
- Service classes: `[Feature]Service` (CourseService, AuthService)

## 🔄 Migration Benefits

### Before (Old Structure)
```
├── screens/          # All screens mixed together
├── components/       # Mixed components
└── App.tsx          # Everything in one navigation file
```

### After (New Structure)
```
src/
├── components/       # Organized by type
├── screens/         # Organized by feature
├── navigation/      # Separated navigation logic
├── services/        # Business logic separation
├── types/          # TypeScript support
└── utils/          # Centralized utilities
```

This structure makes the codebase more professional, maintainable, and ready for scaling as the application grows! 🎉
