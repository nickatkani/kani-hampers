const fs = require("fs");
const path = require("path");

// Create a simple HTML file that will generate the circular favicon
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Favicon Generator</title>
</head>
<body>
    <h2>Generating Circular Favicon...</h2>
    <canvas id="canvas" width="32" height="32" style="border: 1px solid #ddd;"></canvas>
    <br><br>
    <button onclick="downloadFavicon()">Download Circular Favicon</button>
    
    <script>
        function createCircularFavicon() {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                // Clear canvas
                ctx.clearRect(0, 0, 32, 32);
                
                // Create circular clip
                ctx.save();
                ctx.beginPath();
                ctx.arc(16, 16, 16, 0, 2 * Math.PI);
                ctx.clip();
                
                // Draw image
                ctx.drawImage(img, 0, 0, 32, 32);
                ctx.restore();
                
                // Save as favicon
                canvas.toBlob(function(blob) {
                    const reader = new FileReader();
                    reader.onload = function() {
                        console.log('Circular favicon created!');
                    };
                    reader.readAsDataURL(blob);
                }, 'image/png');
            };
            
            img.src = './favicon.jpg';
        }
        
        function downloadFavicon() {
            const canvas = document.getElementById('canvas');
            const link = document.createElement('a');
            link.download = 'favicon.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        
        // Auto-create on load
        window.onload = createCircularFavicon;
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "favicon-generator.html"), htmlContent);
console.log("Favicon generator created at favicon-generator.html");
