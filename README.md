# chatbridge

Chat with any AI and give it MCP tools. One HTML file, no install, no server of its own.

Open it: https://spencerrios64.github.io/chatbridge/ (or download index.html and double-click it).

## Pick an AI
- **Local:** Ollama (http://localhost:11434/v1), LM Studio (http://localhost:1234/v1), llama.cpp server (http://localhost:8080/v1).
- **Cloud API:** OpenAI, OpenRouter, any OpenAI-compatible endpoint, or Anthropic (Claude API). Keys are kept in your browser only.
- Press **List** to fetch the model names. Use a model that supports tool calling if you want MCP tools.
- Browsers need permission to call a local server. Ollama: set \`OLLAMA_ORIGINS=*\` before starting it. LM Studio: enable CORS in the server tab.

## Add MCP tools
- Remote or local servers that speak streamable HTTP: paste the URL under *MCP servers*.
- Local stdio servers (the usual kind): run the helper from this repo, then connect to it.

      node mcp-proxy.mjs 3939 npx -y @modelcontextprotocol/server-filesystem .

  Then add http://localhost:3939/mcp. The helper needs only Node 18+.
- The AI can then call the tools in a loop. By default you are asked before every tool call.

## Use your chats
Attach a Claude or ChatGPT export under *Chat context* and the AI gets your chats as context. The shared bar at the bottom loads chats from the other tools in the family: [chathub](https://spencerrios64.github.io/chathub/).

## Notes
- Replies are not streamed yet; MCP tools are supported over HTTP only (see the helper for stdio).
- A page on https can't call plain http servers on other machines; localhost is allowed.
