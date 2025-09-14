# WebP Converter

A desktop application for converting images to WebP format with advanced resizing and batch processing capabilities.

## Features

- **Drag & Drop Support**: Drag images directly into the application
- **File Browser**: Click to browse and select image files
- **Batch Processing**: Convert multiple images at once with individual settings
- **Flexible Resizing**:
  - Pixel-based dimensions
  - Percentage scaling
  - Aspect ratio locking to prevent deformation
- **Quality Control**: Adjustable compression quality (1-100%)
- **Size Estimation**: Preview approximate output file size
- **Grid View**: Visual thumbnails for batch processing with per-file controls

## Installation

1. Clone or download the project files
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Running the Application
```bash
npm start
```

### Single Image Conversion
1. Drag an image onto the drop zone or click to browse
2. Adjust width, height, and quality as needed
3. Choose pixel or percentage mode
4. Enable aspect ratio lock to maintain proportions
5. Click "Convert & Save as WebP"

### Batch Processing
1. Select multiple images (Ctrl+Click in file dialog)
2. View the grid of thumbnails with individual controls
3. Set custom dimensions and quality for each image
4. Use aspect ratio lock per image to prevent deformation
5. Click "Convert & Save as WebP" to process all files

### Resize Modes
- **Pixels**: Set exact width/height in pixels
- **Percentage**: Scale by percentage of original size

### Aspect Ratio
- Lock aspect ratio to maintain original proportions
- Automatically adjusts the other dimension when one is changed

## Technical Details

- Built with Electron for cross-platform desktop support
- Uses HTML5 Canvas for image processing
- WebP conversion with quality control
- Node.js file system operations for reading/writing files

## File Structure

```
webp-converter/
├── main.js          # Electron main process
├── renderer.js      # UI logic and event handlers
├── index.html       # Application interface
├── package.json     # Dependencies and scripts
├── .gitignore       # Git ignore rules
└── README.md        # This documentation
```

## Requirements

- Node.js (v14 or higher)
- Windows/macOS/Linux

## Development

To modify the application:
- Edit `index.html` for UI changes
- Edit `renderer.js` for functionality
- Edit `main.js` for Electron-specific features

## License

MIT License
