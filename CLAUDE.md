# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Figma plugin called "Toyota Style Switcher" that allows users to change brand styles (Toyota, Lexus, Subaru) and theme styles (Light/Dark) for selected elements in Figma. The plugin is designed to work specifically with the Atoms Design System.

## File Structure

- `manifest.json` - Figma plugin manifest configuration
- `code.js` - Main plugin logic and Figma API interactions
- `ui.html` - Plugin UI interface with HTML, CSS, and JavaScript

## Key Architecture

The plugin consists of two main parts:

1. **Plugin Code (`code.js`)**: Runs in Figma's plugin sandbox
   - Handles Figma API interactions
   - Manages style detection and replacement
   - Communicates with UI via message passing

2. **UI Code (`ui.html`)**: Runs in the plugin's iframe
   - Provides user interface for brand/theme selection
   - Displays current styles applied to selected elements
   - Sends user actions to plugin code

## Core Functionality

### Style Detection
- `getStylesFromNode()` - Recursively extracts color and text styles from nodes
- `findReferencedStyles()` - Finds all styles referenced in the document
- `getStyleName()` - Gets style name from style ID

### Style Replacement
- `changeBrandColors()` - Main function for changing brand styles
- `changeStylesRecursive()` - Recursively applies style changes to nodes
- `findCorrespondingStyle()` - Finds matching styles for brand changes
- `findCorrespondingLightDarkStyle()` - Finds matching light/dark theme styles

### Style Naming Convention
The plugin expects styles to follow this naming pattern:
- `{Brand}/{Theme}/{StyleName}` (e.g., `Toyota/Light/Primary`, `Lexus/Dark/Secondary`)
- Supported brands: Toyota, Lexus, Subaru
- Supported themes: Light, Dark

## Development Notes

- No build process required - this is a vanilla JavaScript Figma plugin
- Plugin uses Figma's Plugin API for all interactions
- All styles are identified by their naming convention
- The plugin handles both local and team library styles
- Extensive console logging is included for debugging

## Plugin Configuration

The plugin is configured in `manifest.json` with:
- No network access (`allowedDomains: ["none"]`)
- Dynamic page access for reading styles
- Figma editor type only
- No proposed API features enabled

## Common Issues

- Plugin requires elements to have named styles (not just colors)
- Works specifically with Atoms Design System naming conventions
- Style changes are applied recursively to all child elements
- Plugin validates brand selections before applying changes