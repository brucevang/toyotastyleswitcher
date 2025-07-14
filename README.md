# Toyota Style Switcher

A Figma plugin that allows designers to quickly switch between Toyota, Lexus, and Subaru brand styles and light/dark themes for selected design elements. The plugin automatically changes both color and text styles when properly configured from the Atoms Design System.

## Installation

1. Download the plugin files
2. In Figma, go to Plugins → Development → Import plugin from manifest
3. Select the `manifest.json` file
4. The plugin will appear in your Plugins menu

## Usage with Team Library Styles

**Important**: Due to Figma API limitations, this plugin cannot directly access team library styles (remote styles). If you're using the Atoms Design System from a team library, follow these steps:

1. **Copy the frame or artboard** from your working file into the Atoms file (the file containing the local styles)
2. **Run the plugin** in the Atoms file to change styles or themes
3. **Copy the updated frame back** to your original file if needed

This ensures the plugin has access to all Toyota, Lexus, and Subaru styles needed for brand switching.

## Limitations

- **Cannot access team library styles directly** - Requires copying designs to the Atoms file first
- Only works with named styles (not direct color applications)
- Requires styles to follow the specific naming convention: `{Brand}/{Theme}/{StyleName}`
- No network access (works offline only)
- Limited to Toyota family brands (Toyota, Lexus, Subaru)

## Overview

The Toyota Style Switcher plugin streamlines the process of adapting designs across different automotive brands within the Toyota family. It automatically identifies and replaces brand-specific color and text styles while maintaining design integrity. When text styles are properly set up from the Atoms Design System, the plugin will also update typography to match the selected brand.

## Features

### Brand Switching
- **Multi-brand Support**: Switch between Toyota, Lexus, and Subaru styles
- **Intelligent Detection**: Automatically identifies current brand styles in selected elements
- **Bulk Operations**: Apply changes to multiple elements and their children simultaneously
- **Font Style Updates**: Automatically changes text styles and typography when configured from Atoms Design System

### Theme Switching
- **Light/Dark Modes**: Toggle between light and dark theme variants
- **Brand Preservation**: Change themes while maintaining current brand identity
- **Selective Application**: Apply theme changes to specific brand styles only

### User Interface
- **Style Visualization**: View all applied styles with color swatches and names
- **Collapsible Lists**: Automatically collapse style lists over 5 items for better UX
- **Real-time Feedback**: Instant visual updates and status notifications
- **Error Handling**: Enhanced error messages with copy functionality for troubleshooting

## How It Works

### Style Naming Convention
The plugin works with styles that follow this naming pattern:
```
{Brand}/{Theme}/{StyleName}
```

**Examples:**
- `Toyota/Light/Primary`
- `Lexus/Dark/Secondary`
- `Subaru/Light/Accent`

### Supported Brands
- **Toyota**: Toyota Motor Corporation styles
- **Lexus**: Lexus luxury division styles  
- **Subaru**: Subaru brand styles

### Supported Themes
- **Light**: Light theme color variants
- **Dark**: Dark theme color variants

## Usage

1. **Select Elements**: Choose one or more frames, components, or design elements in Figma
2. **View Current Styles**: The plugin displays all applied styles with visual previews
3. **Choose Action**:
   - **Brand Change**: Select source and target brands, then click "Change Brand"
   - **Theme Change**: Select desired theme (Light/Dark), then click "Change Theme"
4. **Review Results**: The plugin provides feedback on successful changes and any issues


## Troubleshooting

### Common Issues
- **No Styles Found**: Ensure selected elements have named styles applied
- **Style Not Changed**: Verify target brand/theme styles exist in the document
- **Error Messages**: Use the copy button to share error details for support

### Error Types
- **Symbol Conversion Errors**: Automatically handled by the plugin
- **Missing Target Styles**: Reported with specific style names
- **API Failures**: Gracefully handled with user feedback

## Credits

Created by OneApp UX team

## Version History

- **v1.0**: Initial release with basic brand switching
- **v1.1**: Added theme switching functionality
- **v1.2**: Enhanced error handling and Symbol ID support
- **v1.3**: Improved UI with collapsible lists and better feedback