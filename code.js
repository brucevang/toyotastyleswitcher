// Figma plugin to display color styles applied to selected nodes and their children

figma.showUI(__html__, { width: 400, height: 600 });

console.log('Plugin starting up...');

// Function to get all styles (color and text) from a node and its children
async function getStylesFromNode(node) {
  const allStyles = [];
  
  // Helper function to extract styles from a node
  async function extractStyles(node, path = '') {
    const nodePath = path ? `${path} > ${node.name}` : node.name;
    
    // Check if the node has fills (color styles)
    if ('fills' in node && node.fills && node.fills.length > 0) {
      console.log('Node fills:', node.fills);
      for (let index = 0; index < node.fills.length; index++) {
        const fill = node.fills[index];
        console.log('Fill:', fill);
        console.log('Fill type:', fill.type);
        console.log('Fill visible:', fill.visible);
        console.log('Fill opacity:', fill.opacity);
        console.log('Fill blendMode:', fill.blendMode);
        
        if (fill.type === 'SOLID' && fill.color) {
          const color = fill.color;
          const rgbColor = {
            r: Math.round(color.r * 255),
            g: Math.round(color.g * 255),
            b: Math.round(color.b * 255)
          };
          
          console.log('Node fillStyleId:', node.fillStyleId);
          console.log('Fill color:', fill.color);
          
          let styleName = null;
          if (node.fillStyleId) {
            styleName = await getStyleName(node.fillStyleId);
          } else {
            // If no fillStyleId, try to find the style by color
            console.log('No fillStyleId found, trying to find style by color...');
            styleName = await findStyleByColor(fill.color);
          }
          
          console.log('Final style name:', styleName);
          
          allStyles.push({
            nodeName: node.name,
            nodePath: nodePath,
            fillIndex: index,
            color: rgbColor,
            hexColor: rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b),
            opacity: fill.opacity || 1,
            styleName: styleName,
            styleType: 'color'
          });
        }
      }
    }
    
    // Check if the node has strokes (color styles)
    if ('strokes' in node && node.strokes && node.strokes.length > 0) {
      for (let index = 0; index < node.strokes.length; index++) {
        const stroke = node.strokes[index];
        if (stroke.type === 'SOLID' && stroke.color) {
          const color = stroke.color;
          const rgbColor = {
            r: Math.round(color.r * 255),
            g: Math.round(color.g * 255),
            b: Math.round(color.b * 255)
          };
          
          console.log('Node strokeStyleId:', node.strokeStyleId);
          
          let styleName = null;
          if (node.strokeStyleId) {
            styleName = await getStyleName(node.strokeStyleId);
          } else {
            // If no strokeStyleId, try to find the style by color
            console.log('No strokeStyleId found, trying to find style by color...');
            styleName = await findStyleByColor(stroke.color);
          }
          
          allStyles.push({
            nodeName: node.name,
            nodePath: nodePath,
            strokeIndex: index,
            color: rgbColor,
            hexColor: rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b),
            opacity: stroke.opacity || 1,
            isStroke: true,
            styleName: styleName,
            styleType: 'color'
          });
        }
      }
    }
    
    // Check if the node has text styles
    if ('textStyleId' in node && node.textStyleId) {
      console.log('Node textStyleId:', node.textStyleId);
      
      let styleName = null;
      if (node.textStyleId) {
        styleName = await getStyleName(node.textStyleId);
      }
      
      console.log('Text style name:', styleName);
      
      allStyles.push({
        nodeName: node.name,
        nodePath: nodePath,
        styleName: styleName,
        styleType: 'text'
      });
    }
    
    // Recursively check children
    if ('children' in node) {
      for (const child of node.children) {
        await extractStyles(child, nodePath);
      }
    }
  }
  
  await extractStyles(node);
  return allStyles;
}

// Helper function to convert RGB to Hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Helper function to safely convert style ID to string
function convertStyleIdToString(styleId) {
  try {
    if (!styleId) {
      return null;
    }
    
    // If already a string, return as-is
    if (typeof styleId === 'string') {
      return styleId;
    }
    
    // If it's a Symbol, try to convert it
    if (typeof styleId === 'symbol') {
      // Try to get the string representation of the symbol
      const symbolString = styleId.toString();
      console.log('Converted symbol to string:', symbolString);
      return symbolString;
    }
    
    // For other types, attempt string conversion
    const converted = String(styleId);
    console.log('Converted styleId to string:', converted);
    return converted;
  } catch (error) {
    console.error('Error converting styleId to string:', error);
    return null;
  }
}

// Helper function to get style name from style ID
async function getStyleName(styleId) {
  try {
    console.log('Getting style name for styleId:', styleId);
    console.log('StyleId type:', typeof styleId);
    console.log('StyleId value:', styleId);
    
    // Use the utility function to safely convert styleId to string
    const styleIdString = convertStyleIdToString(styleId);
    if (!styleIdString) {
      console.log('StyleId could not be converted to string');
      return null;
    }
    
    const style = await figma.getStyleByIdAsync(styleIdString);
    console.log('Style found:', style);
    console.log('Style type:', typeof style);
    
    if (style) {
      console.log('Style properties:', Object.keys(style));
      console.log('Style name property:', style.name);
      console.log('Style name type:', typeof style.name);
    }
    
    const styleName = style ? style.name : null;
    console.log('Final style name:', styleName);
    
    // Check if this is the Toyota/Brand/01 style
    if (styleName && styleName.includes('Toyota/Brand/01')) {
      console.log('Found Toyota/Brand/01 style!');
    }
    
    return styleName;
  } catch (error) {
    console.log('Error getting style name:', error);
    console.log('Error details:', error.message);
    return null;
  }
}

// Helper function to find style by color
async function findStyleByColor(color) {
  try {
    console.log('Finding style by color:', color);
    
    // Get all available paint styles (local and remote)
    const allStyles = await figma.getLocalPaintStylesAsync();
    console.log('Checking', allStyles.length, 'available styles');
    
    for (const style of allStyles) {
      if (style.paints && style.paints.length > 0) {
        for (const paint of style.paints) {
          if (paint.type === 'SOLID' && paint.color) {
            // Compare colors with some tolerance for floating point differences
            const colorMatch = Math.abs(paint.color.r - color.r) < 0.001 &&
                              Math.abs(paint.color.g - color.g) < 0.001 &&
                              Math.abs(paint.color.b - color.b) < 0.001;
            
            if (colorMatch) {
              console.log('Found matching style by color:', style.name);
              return style.name;
            }
          }
        }
      }
    }
    
    console.log('No matching style found by color');
    return null;
  } catch (error) {
    console.log('Error finding style by color:', error);
    return null;
  }
}

// Function to find style by name
async function findStyleByName(styleName) {
  try {
    console.log('Finding style by name:', styleName);
    
    // Get all available paint styles (local and remote)
    const allStyles = await figma.getLocalPaintStylesAsync();
    console.log('Checking', allStyles.length, 'available styles');
    
    for (const style of allStyles) {
      if (style.name === styleName) {
        console.log('Found style by name:', style.name, 'ID:', style.id);
        return style;
      }
    }
    
    console.log('No style found with name:', styleName);
    return null;
  } catch (error) {
    console.log('Error finding style by name:', error);
    return null;
  }
}

// Function to find corresponding style for any brand
function findCorrespondingStyle(sourceStyleName, targetStyles, targetBrand) {
  // Replace the source brand with target brand in the style name
  const targetStyleName = sourceStyleName.replace(/^(Toyota|Lexus|Subaru)\//, `${targetBrand}/`);
  console.log(`Looking for corresponding ${targetBrand} style:`, targetStyleName);
  
  const correspondingStyle = targetStyles.find(style => style.name === targetStyleName);
  if (correspondingStyle) {
    console.log(`Found corresponding ${targetBrand} style:`, correspondingStyle.name);
    return correspondingStyle;
  } else {
    console.log(`No corresponding ${targetBrand} style found for:`, sourceStyleName);
    return null;
  }
}

// Function to find corresponding light/dark style
function findCorrespondingLightDarkStyle(sourceStyleName, targetStyles, targetLightDark) {
  // Replace Light/Dark in the style name
  const targetStyleName = sourceStyleName.replace(/\/(Light|Dark)\//, `/${targetLightDark}/`);
  console.log(`Looking for corresponding ${targetLightDark} style:`, targetStyleName);
  
  const correspondingStyle = targetStyles.find(style => style.name === targetStyleName);
  if (correspondingStyle) {
    console.log(`Found corresponding ${targetLightDark} style:`, correspondingStyle.name);
    return correspondingStyle;
  } else {
    console.log(`No corresponding ${targetLightDark} style found for:`, sourceStyleName);
    return null;
  }
}

// Experimental function to try accessing team library styles
async function tryAccessTeamLibraryStyles() {
  console.log('=== EXPERIMENTAL: TRYING TO ACCESS TEAM LIBRARY STYLES ===');
  
  try {
    // Try to get all available styles in different ways
    console.log('Trying figma.getLocalPaintStylesAsync()...');
    const localPaintStyles = await figma.getLocalPaintStylesAsync();
    console.log('Local paint styles:', localPaintStyles.length);
    
    console.log('Trying figma.getLocalTextStylesAsync()...');
    const localTextStyles = await figma.getLocalTextStylesAsync();
    console.log('Local text styles:', localTextStyles.length);
    
    // Check if there are any other methods available
    console.log('Available figma methods:', Object.getOwnPropertyNames(figma).filter(name => name.includes('Style')));
    
    // Try to access styles through the current page
    const selection = figma.currentPage.selection;
    if (selection.length > 0) {
      const firstNode = selection[0];
      console.log('Checking first selected node for style information...');
      console.log('Node fillStyleId:', firstNode.fillStyleId, 'Type:', typeof firstNode.fillStyleId);
      console.log('Node strokeStyleId:', firstNode.strokeStyleId, 'Type:', typeof firstNode.strokeStyleId);
      console.log('Node textStyleId:', firstNode.textStyleId, 'Type:', typeof firstNode.textStyleId);
      
      // Try to resolve these style IDs
      if (firstNode.fillStyleId) {
        try {
          const fillStyle = await figma.getStyleByIdAsync(firstNode.fillStyleId);
          console.log('Fill style resolved:', fillStyle ? fillStyle.name : 'null');
        } catch (e) {
          console.log('Failed to resolve fill style:', e.message);
        }
      }
    }
    
  } catch (error) {
    console.log('Error in experimental team library access:', error);
  }
}

// Function to find referenced styles (including team library styles)
async function findReferencedStyles() {
  const referencedStyles = new Set();
  
  console.log('=== FINDING REFERENCED STYLES ===');
  console.log('Document pages:', figma.root.children.length);
  
  try {
    // First, check the current selection for style IDs (this is most reliable for team library styles)
    const selection = figma.currentPage.selection;
    console.log('Checking current selection for style IDs...');
    for (const node of selection) {
      await findStylesInNode(node, referencedStyles);
    }
    console.log('Style IDs found in selection:', referencedStyles.size);
    
    // Then search through all pages and frames to find style references
    for (const page of figma.root.children) {
      console.log('Searching page:', page.name);
      await findStylesInNode(page, referencedStyles);
    }
    console.log('Total referenced style IDs found:', referencedStyles.size);
    console.log('Referenced style IDs:', Array.from(referencedStyles));
  } catch (error) {
    console.log('Error finding referenced styles:', error);
  }
  
  // Convert Set to Array and filter for paint and text styles
  const stylesArray = Array.from(referencedStyles);
  const paintStyles = [];
  const textStyles = [];
  
  for (const styleId of stylesArray) {
    try {
      // Add debugging to check the styleId type and value
      console.log('Processing styleId:', styleId);
      console.log('styleId type:', typeof styleId);
      console.log('styleId value:', styleId);
      
      // Skip if styleId is not a string or is empty
      if (typeof styleId !== 'string' || !styleId) {
        console.log('Skipping invalid styleId:', styleId);
        continue;
      }
      
      const style = await figma.getStyleByIdAsync(styleId);
      if (style) {
        console.log('Successfully resolved style:', style.name, 'Type:', style.type, 'ID:', style.id);
        if (style.type === 'PAINT') {
          paintStyles.push(style);
          console.log('Added paint style:', style.name);
        } else if (style.type === 'TEXT') {
          textStyles.push(style);
          console.log('Added text style:', style.name);
        }
      } else {
        console.log('Style resolution returned null for ID:', styleId);
        // Try alternative method for team library styles
        try {
          console.log('Attempting to import team library style with key:', styleId);
          const importedStyle = await figma.importStyleByKeyAsync(styleId);
          if (importedStyle) {
            console.log('Successfully imported team library style:', importedStyle.name);
            if (importedStyle.type === 'PAINT') {
              paintStyles.push(importedStyle);
            } else if (importedStyle.type === 'TEXT') {
              textStyles.push(importedStyle);
            }
          }
        } catch (importError) {
          console.log('Failed to import team library style:', importError.message);
        }
      }
    } catch (error) {
      console.log('Error getting style by ID:', styleId, error);
      console.log('Error details:', error.message);
      console.log('This might be a team library style that needs importing');
    }
  }
  
  return { paintStyles, textStyles };
}

// Helper function to recursively search for style references in nodes
async function findStylesInNode(node, referencedStyles) {
  // Check for fill style
  if (node.fillStyleId) {
    console.log('Found fillStyleId:', node.fillStyleId, 'type:', typeof node.fillStyleId);
    const fillStyleIdString = convertStyleIdToString(node.fillStyleId);
    if (fillStyleIdString) {
      referencedStyles.add(fillStyleIdString);
    }
  }
  
  // Check for stroke style
  if (node.strokeStyleId) {
    console.log('Found strokeStyleId:', node.strokeStyleId, 'type:', typeof node.strokeStyleId);
    const strokeStyleIdString = convertStyleIdToString(node.strokeStyleId);
    if (strokeStyleIdString) {
      referencedStyles.add(strokeStyleIdString);
    }
  }
  
  // Check for text styles
  if (node.textStyleId) {
    console.log('Found textStyleId:', node.textStyleId, 'type:', typeof node.textStyleId);
    const textStyleIdString = convertStyleIdToString(node.textStyleId);
    if (textStyleIdString) {
      referencedStyles.add(textStyleIdString);
    }
  }
  
  // Check for effect styles
  if (node.effectStyleId) {
    console.log('Found effectStyleId:', node.effectStyleId, 'type:', typeof node.effectStyleId);
    const effectStyleIdString = convertStyleIdToString(node.effectStyleId);
    if (effectStyleIdString) {
      referencedStyles.add(effectStyleIdString);
    }
  }
  
  // Recursively check children
  if ('children' in node) {
    for (const child of node.children) {
      await findStylesInNode(child, referencedStyles);
    }
  }
}

// Function to change brand colors and text styles
async function changeBrandColors(data, fromBrand, targetTheme, targetLightDark) {
  try {
    console.log('Starting brand change to:', targetTheme, 'with light/dark:', targetLightDark);
    
    // Get all available paint and text styles (local and remote) to find all brand styles
    console.log('=== GATHERING ALL STYLES FOR BRAND CHANGE ===');
    const localPaintStyles = await figma.getLocalPaintStylesAsync();
    const localTextStyles = await figma.getLocalTextStylesAsync();
    const referencedStyles = await findReferencedStyles();
    
    console.log('Local paint styles:', localPaintStyles.length);
    console.log('Local text styles:', localTextStyles.length);
    console.log('Referenced paint styles:', referencedStyles.paintStyles.length);
    console.log('Referenced text styles:', referencedStyles.textStyles.length);
    
    // Combine local and referenced styles
    const combinedPaintStyles = [...localPaintStyles, ...referencedStyles.paintStyles];
    const combinedTextStyles = [...localTextStyles, ...referencedStyles.textStyles];
    
    console.log('Total combined paint styles:', combinedPaintStyles.length);
    console.log('Total combined text styles:', combinedTextStyles.length);
    
    const toyotaPaintStyles = combinedPaintStyles.filter(style => style.name.includes('Toyota/'));
    const lexusPaintStyles = combinedPaintStyles.filter(style => style.name.includes('Lexus/'));
    const subaruPaintStyles = combinedPaintStyles.filter(style => style.name.includes('Subaru/'));
    
    const toyotaTextStyles = combinedTextStyles.filter(style => style.name.includes('Toyota/'));
    const lexusTextStyles = combinedTextStyles.filter(style => style.name.includes('Lexus/'));
    const subaruTextStyles = combinedTextStyles.filter(style => style.name.includes('Subaru/'));
    
    console.log('Found Toyota paint styles:', toyotaPaintStyles.map(s => s.name));
    console.log('Found Lexus paint styles:', lexusPaintStyles.map(s => s.name));
    console.log('Found Subaru paint styles:', subaruPaintStyles.map(s => s.name));
    console.log('Found Toyota text styles:', toyotaTextStyles.map(s => s.name));
    console.log('Found Lexus text styles:', lexusTextStyles.map(s => s.name));
    console.log('Found Subaru text styles:', subaruTextStyles.map(s => s.name));
    
    // Determine which styles to use based on target theme and light/dark
    let targetPaintStyles = [];
    let targetTextStyles = [];
    let sourceBrands = [];
    let targetBrand = null;
    
    if (targetTheme) {
      // Brand is selected - determine target brand
      switch (targetTheme) {
        case 'toyota':
          targetBrand = 'Toyota';
          targetPaintStyles = toyotaPaintStyles;
          targetTextStyles = toyotaTextStyles;
          break;
        case 'lexus':
          targetBrand = 'Lexus';
          targetPaintStyles = lexusPaintStyles;
          targetTextStyles = lexusTextStyles;
          break;
        case 'subaru':
          targetBrand = 'Subaru';
          targetPaintStyles = subaruPaintStyles;
          targetTextStyles = subaruTextStyles;
          break;
        default:
          figma.ui.postMessage({ 
            type: 'error', 
            message: 'Invalid target theme selected.' 
          });
          return;
      }
      
      // Set source brands based on fromBrand parameter
      if (fromBrand) {
        sourceBrands = [fromBrand.charAt(0).toUpperCase() + fromBrand.slice(1)];
      } else {
        sourceBrands = ['Toyota', 'Lexus', 'Subaru']; // Fallback to all brands
      }
    } else if (targetLightDark) {
      // Only light/dark theme is selected - use current brand
      targetPaintStyles = [...toyotaPaintStyles, ...lexusPaintStyles, ...subaruPaintStyles];
      targetTextStyles = [...toyotaTextStyles, ...lexusTextStyles, ...subaruTextStyles];
      sourceBrands = ['Toyota', 'Lexus', 'Subaru'];
    }
    
    if (targetPaintStyles.length === 0 && targetTextStyles.length === 0) {
      let errorMessage = '';
      if (targetLightDark) {
        errorMessage = `No ${targetLightDark} theme styles found in the document. Please make sure ${targetLightDark} theme styles exist.`;
      } else {
        errorMessage = `No ${targetTheme} styles found in the document. Please make sure ${targetTheme} styles exist.`;
      }
      figma.ui.postMessage({ 
        type: 'error', 
        message: errorMessage
      });
      return;
    }
    
    let changedCount = 0;
    
    // Get the current selection
    const selection = figma.currentPage.selection;
    
    // Process each selected node
    for (const node of selection) {
      changedCount += await changeStylesRecursive([node], targetPaintStyles, targetTextStyles, sourceBrands, targetTheme, targetLightDark);
    }
    
    console.log('Brand change completed. Changed', changedCount, 'styles.');
    
    // Notify the UI of the change
    let message = `Successfully changed ${changedCount} styles`;
    if (targetTheme) {
      message += ` to ${targetTheme} theme`;
    }
    if (targetLightDark) {
      message += ` (${targetLightDark} mode)`;
    }
    message += '.';
    
    if (changedCount === 0) {
      if (targetLightDark) {
        message = `No styles were changed. All styles are already using the ${targetLightDark} theme.`;
      } else {
        message = `No styles were changed. All styles are already using the ${targetTheme} theme.`;
      }
    }
    
    figma.ui.postMessage({ 
      type: 'brand-changed', 
      message: message
    });
    
    // Refresh the data
    const newResult = await getStylesFromSelection();
    figma.ui.postMessage({ type: 'selection-updated', data: newResult });
    
  } catch (error) {
    console.log('Error changing brand colors:', error);
    figma.ui.postMessage({ 
      type: 'error', 
      message: 'Error changing brand colors: ' + error.message 
    });
  }
}

// Recursive function to change styles in children
async function changeStylesRecursive(nodes, targetPaintStyles, targetTextStyles, sourceBrands, targetTheme, targetLightDark) {
  let changedCount = 0;
  
  for (const node of nodes) {
    try {
      // Change fill styles
      if (node.fillStyleId) {
        const fillStyleIdString = convertStyleIdToString(node.fillStyleId);
        if (!fillStyleIdString) {
          console.log('Skipping node with invalid fillStyleId:', node.fillStyleId);
          continue;
        }
        
        const currentStyle = await figma.getStyleByIdAsync(fillStyleIdString);
      if (currentStyle && sourceBrands.some(brand => currentStyle.name.includes(`${brand}/`))) {
        let correspondingStyle = null;
        
        if (targetTheme && targetLightDark) {
          // Both brand and light/dark theme are selected
          // First change the brand, then change the light/dark
          let brandChangedName = currentStyle.name.replace(/^(Toyota|Lexus|Subaru)\//, `${targetTheme.charAt(0).toUpperCase() + targetTheme.slice(1)}/`);
          let finalName = brandChangedName.replace(/\/(Light|Dark)\//, `/${targetLightDark.charAt(0).toUpperCase() + targetLightDark.slice(1)}/`);
          correspondingStyle = targetPaintStyles.find(s => s.name === finalName);
        } else if (targetTheme) {
          // Only brand is selected - change brand only
          correspondingStyle = findCorrespondingStyle(currentStyle.name, targetPaintStyles, targetTheme.charAt(0).toUpperCase() + targetTheme.slice(1));
        } else if (targetLightDark) {
          // Only light/dark theme is selected - change light/dark only for current brand
          correspondingStyle = findCorrespondingLightDarkStyle(currentStyle.name, targetPaintStyles, targetLightDark.charAt(0).toUpperCase() + targetLightDark.slice(1));
        }
        
        if (correspondingStyle) {
          await node.setFillStyleIdAsync(correspondingStyle.id);
          changedCount++;
          console.log(`Changed fill style for child node: ${node.name} (${currentStyle.name} → ${correspondingStyle.name})`);
        } else {
          if (targetTheme && targetLightDark) {
            console.log(`No corresponding ${targetTheme} ${targetLightDark} style found for: ${currentStyle.name}`);
          } else if (targetLightDark) {
            console.log(`No corresponding ${targetLightDark} style found for: ${currentStyle.name}`);
          } else if (targetTheme) {
            console.log(`No corresponding ${targetTheme} style found for: ${currentStyle.name}`);
          }
        }
      }
    }
    
    // Change stroke styles
    if (node.strokeStyleId) {
      const strokeStyleIdString = convertStyleIdToString(node.strokeStyleId);
      if (!strokeStyleIdString) {
        console.log('Skipping node with invalid strokeStyleId:', node.strokeStyleId);
        continue;
      }
      
      const currentStyle = await figma.getStyleByIdAsync(strokeStyleIdString);
      if (currentStyle && sourceBrands.some(brand => currentStyle.name.includes(`${brand}/`))) {
        let correspondingStyle = null;
        
        if (targetTheme && targetLightDark) {
          // Both brand and light/dark theme are selected
          // First change the brand, then change the light/dark
          let brandChangedName = currentStyle.name.replace(/^(Toyota|Lexus|Subaru)\//, `${targetTheme.charAt(0).toUpperCase() + targetTheme.slice(1)}/`);
          let finalName = brandChangedName.replace(/\/(Light|Dark)\//, `/${targetLightDark.charAt(0).toUpperCase() + targetLightDark.slice(1)}/`);
          correspondingStyle = targetPaintStyles.find(s => s.name === finalName);
        } else if (targetTheme) {
          // Only brand is selected - change brand only
          correspondingStyle = findCorrespondingStyle(currentStyle.name, targetPaintStyles, targetTheme.charAt(0).toUpperCase() + targetTheme.slice(1));
        } else if (targetLightDark) {
          // Only light/dark theme is selected - change light/dark only for current brand
          correspondingStyle = findCorrespondingLightDarkStyle(currentStyle.name, targetPaintStyles, targetLightDark.charAt(0).toUpperCase() + targetLightDark.slice(1));
        }
        
        if (correspondingStyle) {
          await node.setStrokeStyleIdAsync(correspondingStyle.id);
          changedCount++;
          console.log(`Changed stroke style for child node: ${node.name} (${currentStyle.name} → ${correspondingStyle.name})`);
        } else {
          if (targetTheme && targetLightDark) {
            console.log(`No corresponding ${targetTheme} ${targetLightDark} style found for: ${currentStyle.name}`);
          } else if (targetLightDark) {
            console.log(`No corresponding ${targetLightDark} style found for: ${currentStyle.name}`);
          } else if (targetTheme) {
            console.log(`No corresponding ${targetTheme} style found for: ${currentStyle.name}`);
          }
        }
      }
    }
    
    // Change text styles
    if (node.textStyleId) {
      const textStyleIdString = convertStyleIdToString(node.textStyleId);
      if (!textStyleIdString) {
        console.log('Skipping node with invalid textStyleId:', node.textStyleId);
        continue;
      }
      
      const currentStyle = await figma.getStyleByIdAsync(textStyleIdString);
      if (currentStyle && sourceBrands.some(brand => currentStyle.name.includes(`${brand}/`))) {
        let correspondingStyle = null;
        
        if (targetTheme && targetLightDark) {
          // Both brand and light/dark theme are selected
          // First change the brand, then change the light/dark
          let brandChangedName = currentStyle.name.replace(/^(Toyota|Lexus|Subaru)\//, `${targetTheme.charAt(0).toUpperCase() + targetTheme.slice(1)}/`);
          let finalName = brandChangedName.replace(/\/(Light|Dark)\//, `/${targetLightDark.charAt(0).toUpperCase() + targetLightDark.slice(1)}/`);
          correspondingStyle = targetTextStyles.find(s => s.name === finalName);
        } else if (targetTheme) {
          // Only brand is selected - change brand only
          correspondingStyle = findCorrespondingStyle(currentStyle.name, targetTextStyles, targetTheme.charAt(0).toUpperCase() + targetTheme.slice(1));
        } else if (targetLightDark) {
          // Only light/dark theme is selected - change light/dark only for current brand
          correspondingStyle = findCorrespondingLightDarkStyle(currentStyle.name, targetTextStyles, targetLightDark.charAt(0).toUpperCase() + targetLightDark.slice(1));
        }
        
        if (correspondingStyle) {
          await node.setTextStyleIdAsync(correspondingStyle.id);
          changedCount++;
          console.log(`Changed text style for child node: ${node.name} (${currentStyle.name} → ${correspondingStyle.name})`);
        } else {
          if (targetTheme && targetLightDark) {
            console.log(`No corresponding ${targetTheme} ${targetLightDark} text style found for: ${currentStyle.name}`);
          } else if (targetLightDark) {
            console.log(`No corresponding ${targetLightDark} text style found for: ${currentStyle.name}`);
          } else if (targetTheme) {
            console.log(`No corresponding ${targetTheme} text style found for: ${currentStyle.name}`);
          }
        }
      }
    }
    
      // Recursively process children
      if ('children' in node) {
        changedCount += await changeStylesRecursive(node.children, targetPaintStyles, targetTextStyles, sourceBrands, targetTheme, targetLightDark);
      }
    } catch (error) {
      console.error('Error processing node:', node.name, error);
      // Continue processing other nodes even if one fails
    }
  }
  
  return changedCount;
}

console.log('All functions defined. changeBrandColors exists:', typeof changeBrandColors);

// Function to get all styles from selected nodes
async function getStylesFromSelection() {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    return { error: 'No nodes selected. Please select one or more nodes.' };
  }
  
  // Debug: List all available styles
  console.log('=== AVAILABLE STYLES DEBUG ===');
  
  // Run experimental team library access
  await tryAccessTeamLibraryStyles();
  
  try {
    const allPaintStyles = await figma.getLocalPaintStylesAsync();
    const allTextStyles = await figma.getLocalTextStylesAsync();
    const referencedStyles = await findReferencedStyles();
    
    console.log('LOCAL paint styles found:', allPaintStyles.length);
    console.log('LOCAL text styles found:', allTextStyles.length);
    console.log('REFERENCED paint styles found:', referencedStyles.paintStyles.length);
    console.log('REFERENCED text styles found:', referencedStyles.textStyles.length);
    console.log('TOTAL paint styles:', allPaintStyles.length + referencedStyles.paintStyles.length);
    console.log('TOTAL text styles:', allTextStyles.length + referencedStyles.textStyles.length);
    
    // Log local styles
    console.log('=== LOCAL PAINT STYLES ===');
    allPaintStyles.forEach(style => {
      console.log('LOCAL Paint Style:', style.name, 'ID:', style.id, 'Type:', style.type);
    });
    
    console.log('=== LOCAL TEXT STYLES ===');
    allTextStyles.forEach(style => {
      console.log('LOCAL Text Style:', style.name, 'ID:', style.id, 'Type:', style.type);
    });
    
    // Log referenced/remote styles
    console.log('=== REFERENCED/REMOTE PAINT STYLES ===');
    referencedStyles.paintStyles.forEach(style => {
      console.log('REMOTE Paint Style:', style.name, 'ID:', style.id, 'Type:', style.type);
    });
    
    console.log('=== REFERENCED/REMOTE TEXT STYLES ===');
    referencedStyles.textStyles.forEach(style => {
      console.log('REMOTE Text Style:', style.name, 'ID:', style.id, 'Type:', style.type);
    });
    
    [...allPaintStyles, ...referencedStyles.paintStyles].forEach(style => {
      console.log('Paint Style:', style.name, 'ID:', style.id);
      if (style.name.includes('Toyota')) {
        console.log('*** FOUND TOYOTA PAINT STYLE ***:', style.name, style.id);
      }
    });
    
    [...allTextStyles, ...referencedStyles.textStyles].forEach(style => {
      console.log('Text Style:', style.name, 'ID:', style.id);
      if (style.name.includes('Toyota')) {
        console.log('*** FOUND TOYOTA TEXT STYLE ***:', style.name, style.id);
      }
    });
  } catch (error) {
    console.log('Error getting available styles:', error);
  }
  
  const allStyles = [];
  
  for (const node of selection) {
    const nodeStyles = await getStylesFromNode(node);
    allStyles.push({
      nodeName: node.name,
      nodeType: node.type,
      styles: nodeStyles
    });
  }
  
  return { styles: allStyles };
}

// Listen for selection changes
figma.on('selectionchange', async () => {
  const result = await getStylesFromSelection();
  figma.ui.postMessage({ type: 'selection-updated', data: result });
});

// Send initial data
(async () => {
  const initialResult = await getStylesFromSelection();
  figma.ui.postMessage({ type: 'initial-data', data: initialResult });
})();

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  } else if (msg.type === 'change-brand') {
    try {
      console.log('About to call changeBrandColors with:', msg.data, msg.fromBrand, msg.targetTheme, msg.targetLightDark);
      console.log('changeBrandColors function exists:', typeof changeBrandColors);
      await changeBrandColors(msg.data, msg.fromBrand, msg.targetTheme, msg.targetLightDark);
    } catch (error) {
      console.error('Error in changeBrandColors call:', error);
      figma.ui.postMessage({ 
        type: 'error', 
        message: 'Error calling changeBrandColors: ' + error.message 
      });
    }
  } else if (msg.type === 'change-theme') {
    try {
      console.log('About to call changeBrandColors for theme with:', msg.data, null, null, msg.targetLightDark);
      console.log('changeBrandColors function exists:', typeof changeBrandColors);
      await changeBrandColors(msg.data, null, null, msg.targetLightDark);
    } catch (error) {
      console.error('Error in changeBrandColors call for theme:', error);
      figma.ui.postMessage({ 
        type: 'error', 
        message: 'Error calling changeBrandColors for theme: ' + error.message 
      });
    }
  }
};