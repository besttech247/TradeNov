const fs = require('fs');
let code = fs.readFileSync('src/pages/agent/AgentApp.jsx', 'utf8');
code = code.replace(
  "case 'settings':",
  `case 'assistant':
        return <AssistantChat />;
      case 'settings':`
);
fs.writeFileSync('src/pages/agent/AgentApp.jsx', code);
