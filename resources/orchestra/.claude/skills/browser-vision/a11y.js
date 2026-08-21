const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node a11y.js <URL>");
    process.exit(1);
  }

  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for a brief moment to ensure dynamic content loads
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const snapshot = await page.accessibility.snapshot();
    
    // Helper to format the tree cleanly
    function formatNode(node, indent = "") {
      let output = `${indent}- ${node.role || 'unknown'}`;
      if (node.name) output += ` "${node.name}"`;
      if (node.value !== undefined) output += ` (value: ${node.value})`;
      if (node.description) output += ` [desc: ${node.description}]`;
      if (node.disabled) output += ` [disabled]`;
      if (node.checked !== undefined) output += ` [checked: ${node.checked}]`;
      output += "\n";
      
      if (node.children) {
        for (const child of node.children) {
          output += formatNode(child, indent + "  ");
        }
      }
      return output;
    }
    
    console.log(`\n=== ACCESSIBILITY TREE FOR ${url} ===\n`);
    if (snapshot) {
      console.log(formatNode(snapshot));
    } else {
      console.log("No accessibility tree found.");
    }
    console.log(`\n======================================\n`);
    
  } catch (err) {
    console.error("Error generating accessibility tree:", err);
  } finally {
    await browser.close();
  }
})();
