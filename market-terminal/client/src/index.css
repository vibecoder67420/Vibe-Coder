@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0a0a0f;
  --surface: #111118;
  --card: #16161f;
  --border: #1e1e2e;
  --text: #e8e8f0;
  --text-secondary: #6b6b8a;
}

.light {
  --bg: #f5f5fa;
  --surface: #ffffff;
  --card: #ffffff;
  --border: #e2e2f0;
  --text: #0a0a1a;
  --text-secondary: #6b6b8a;
}

* {
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

body {
  background-color: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--surface);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* Skeleton animation */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
