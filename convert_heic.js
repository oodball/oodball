/**
 * HEIC to JPEG Conversion Script
 * 
 * HOW TO USE:
 * 
 * 1. Add your HEIC files to the public/images/Foodball/ directory
 *    Example: cp ~/Downloads/my_photo.HEIC public/images/Foodball/
 * 
 * 2. Run the conversion script:
 *    node convert_heic.js
 * 
 * 3. The script will automatically:
 *    - Find all .HEIC and .HEIF files in public/images/Foodball/
 *    - Convert them to .jpg format
 *    - Keep the same filename (just change extension)
 * 
 * 4. Update your entry files to reference the new JPEG files:
 *    Before: ![My Food](/images/Foodball/my_photo.HEIC)
 *    After:  ![My Food](/images/Foodball/my_photo.jpg)
 * 
 * 5. Optional: Delete the original HEIC files after confirming JPEGs work
 *    rm public/images/Foodball/*.HEIC
 * 
 * BENEFITS:
 * - Faster loading (no browser conversion needed)
 * - Better browser compatibility
 * - Smaller file sizes
 * - No conversion errors
 * 
 * TROUBLESHOOTING:
 * - Make sure heic-convert is installed: npm install heic-convert
 * - Check that HEIC files are in the correct directory
 * - Ensure you have write permissions in the images directory
 */

const fs = require('fs');
const path = require('path');
const heicConvert = require('heic-convert');

// Function to convert HEIC to JPEG
async function convertHeicToJpeg(inputPath, outputPath) {
  try {
    const inputBuffer = fs.readFileSync(inputPath);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.85
    });
    
    fs.writeFileSync(outputPath, outputBuffer);
    console.log(`✅ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error converting ${path.basename(inputPath)}:`, error.message);
  }
}

// Function to process all HEIC files in a directory
async function processDirectory(directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath);
    
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(filePath);
      } else if (file.toLowerCase().endsWith('.heic') || file.toLowerCase().endsWith('.heif')) {
        // Convert HEIC file
        const outputPath = filePath.replace(/\.(heic|heif)$/i, '.jpg');
        await convertHeicToJpeg(filePath, outputPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${directoryPath}:`, error.message);
  }
}

// Main execution
async function main() {
  const publicImagesPath = path.join(__dirname, 'public', 'images', 'Foodball');
  
  if (!fs.existsSync(publicImagesPath)) {
    console.error('❌ Public images directory not found:', publicImagesPath);
    return;
  }
  
  console.log('🔄 Starting HEIC to JPEG conversion...');
  console.log('📁 Processing directory:', publicImagesPath);
  
  await processDirectory(publicImagesPath);
  
  console.log('✅ Conversion complete!');
  console.log('💡 You can now delete the original HEIC files if desired.');
}

// Run the script
main().catch(console.error); 