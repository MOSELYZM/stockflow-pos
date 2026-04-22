// Auto-git watcher - monitors file changes and auto-commits/pushes to git
// Run this alongside your dev server: node auto-git.js

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Debounce timer to avoid multiple commits for rapid changes
let debounceTimer = null;
const DEBOUNCE_MS = 5000; // Wait 5 seconds after last change before committing

// Directories to watch (relative to project root)
const WATCH_DIRS = ['src', 'public', 'electron'];

// File extensions to watch
const WATCH_EXTENSIONS = ['.tsx', '.ts', '.css', '.html', '.js', '.json'];

let isProcessing = false;

function shouldWatchFile(filePath) {
  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  const relativeDir = path.relative(__dirname, dir);
  
  // Skip node_modules, .git, dist, etc.
  if (filePath.includes('node_modules') || 
      filePath.includes('.git') || 
      filePath.includes('dist') ||
      filePath.includes('release')) {
    return false;
  }
  
  // Only watch specified extensions
  if (!WATCH_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  return true;
}

function gitCommitAndPush() {
  if (isProcessing) return;
  isProcessing = true;
  
  console.log('[auto-git] Checking for changes...');
  
  exec('git status --porcelain', (error, stdout) => {
    if (error) {
      console.error('[auto-git] Error checking git status:', error);
      isProcessing = false;
      return;
    }
    
    if (!stdout.trim()) {
      console.log('[auto-git] No changes to commit');
      isProcessing = false;
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const commitMsg = `Auto-commit: ${timestamp}`;
    
    console.log(`[auto-git] Committing changes: ${commitMsg}`);
    
    exec('git add -A', (addError) => {
      if (addError) {
        console.error('[auto-git] Error adding files:', addError);
        isProcessing = false;
        return;
      }
      
      exec(`git commit -m "${commitMsg}"`, (commitError) => {
        if (commitError) {
          // Check if it's just "nothing to commit"
          if (commitError.message && commitError.message.includes('nothing to commit')) {
            console.log('[auto-git] Nothing to commit');
            isProcessing = false;
            return;
          }
          console.error('[auto-git] Error committing:', commitError);
          isProcessing = false;
          return;
        }
        
        console.log('[auto-git] Committed successfully');
        
        exec('git push', (pushError, pushStdout) => {
          if (pushError) {
            console.error('[auto-git] Error pushing:', pushError);
          } else {
            console.log('[auto-git] Pushed to remote');
          }
          isProcessing = false;
        });
      });
    });
  });
}

function handleFileChange(filePath) {
  if (!shouldWatchFile(filePath)) return;
  
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  // Set new timer
  debounceTimer = setTimeout(() => {
    gitCommitAndPush();
  }, DEBOUNCE_MS);
}

// Set up file watchers for each directory
console.log('[auto-git] Starting auto-git watcher...');
console.log('[auto-git] Watching for file changes...');

WATCH_DIRS.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`[auto-git] Directory not found, skipping: ${dir}`);
    return;
  }
  
  fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
    if (filename) {
      const fullFilePath = path.join(fullPath, filename);
      handleFileChange(fullFilePath);
    }
  });
  
  console.log(`[auto-git] Watching: ${dir}/`);
});

console.log('[auto-git] Ready! Make changes to source files and they will be auto-committed after 5 seconds of inactivity.');
console.log('[auto-git] Press Ctrl+C to stop.');

// Initial commit check
gitCommitAndPush();
