/**
 * HEIC to JPEG Conversion Script
 * 
 * HOW TO USE:
 * 
 * 1. Add your HEIC files to the public/images/Foodball/ directory
 *    Example: cp ~/Downloads/my_photo.HEIC public/images/Foodball/
 * 
 * 2. Run the conversion script:
 *    node convert_heic.js                    (keeps original HEIC files)
 *    node convert_heic.js --delete           (deletes original HEIC files after conversion)
 *    node convert_heic.js -d                 (short flag for delete)
 * 
 * 3. The script will automatically:
 *    - Find all .HEIC and .HEIF files in public/images/Foodball/
 *    - Convert them to .jpg format
 *    - Keep the same filename (just change extension)
 *    - Optionally delete original HEIC files (with --delete flag)
 * 
 * 4. Update your entry files to reference the new JPEG files:
 *    Before: ![My Food](/images/Foodball/my_photo.HEIC)
 *    After:  ![My Food](/images/Foodball/my_photo.jpg)
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
async function convertHeicToJpeg(inputPath, outputPath, deleteOriginal = false) {
  try {
    const inputBuffer = fs.readFileSync(inputPath);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.85
    });
    
    fs.writeFileSync(outputPath, outputBuffer);
    console.log(`✅ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    
    if (deleteOriginal) {
      fs.unlinkSync(inputPath);
      console.log(`🗑️  Deleted original: ${path.basename(inputPath)}`);
    }
  } catch (error) {
    console.error(`❌ Error converting ${path.basename(inputPath)}:`, error.message);
  }
}

// Function to process all HEIC files in a directory
async function processDirectory(directoryPath, deleteOriginal = false) {
  try {
    const files = fs.readdirSync(directoryPath);
    
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(filePath, deleteOriginal);
      } else if (file.toLowerCase().endsWith('.heic') || file.toLowerCase().endsWith('.heif')) {
        // Convert HEIC file
        const outputPath = filePath.replace(/\.(heic|heif)$/i, '.jpg');
        await convertHeicToJpeg(filePath, outputPath, deleteOriginal);
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
  
  // Check command line arguments for delete flag
  const shouldDelete = process.argv.includes('--delete') || process.argv.includes('-d');
  
  console.log('🔄 Starting HEIC to JPEG conversion...');
  console.log('📁 Processing directory:', publicImagesPath);
  
  if (shouldDelete) {
    console.log('⚠️  Delete mode enabled - original HEIC files will be removed after conversion');
  } else {
    console.log('💡 Run with --delete flag to automatically remove original HEIC files');
  }
  
  await processDirectory(publicImagesPath, shouldDelete);
  
  console.log('✅ Conversion complete!');
  
  if (!shouldDelete) {
    console.log('💡 Original HEIC files kept. Run with --delete to remove them automatically.');
  }
}

// Run the script
main().catch(console.error); 