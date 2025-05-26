
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a root element
const rootElement = document.getElementById("root");

// Apply global styles to ensure full height
if (rootElement) {
  rootElement.style.height = "100vh";
  rootElement.style.width = "100%";
  rootElement.style.margin = "0";
  rootElement.style.padding = "0";
  rootElement.style.overflow = "auto";
  
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.height = "100%";
  document.body.style.backgroundColor = "#0d0e15"; // cyber-black
  
  // Create the React root and render the app
  createRoot(rootElement).render(<App />);
}
