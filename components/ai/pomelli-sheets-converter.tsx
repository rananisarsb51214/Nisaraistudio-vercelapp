'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, FileSpreadsheet, Bot, Sparkles, Code, Terminal, Layers, Globe } from 'lucide-react';

const APPS_SCRIPT_CODE = `/**
 * Gemini AI Chat with Memory in Google Sheets
 */

// Replace with your actual Google Gemini API Key
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 

// Selected Gemini model
const MODEL_NAME = "gemini-1.5-flash";

/**
 * Custom Menu when opening the Google Sheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🤖 Gemini Chat")
    .addItem("💬 Open Chat Interface", "openChatSidebar")
    .addItem("🗑️ Clear Chat Memory", "clearMemory")
    .addToUi();
}

/**
 * Opens the Chat Sidebar
 */
function openChatSidebar() {
  const html = HtmlService.createHtmlOutputFromFile("Sidebar")
    .setTitle("Gemini Assistant (With Memory)")
    .setWidth(350);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Clears the chat memory tab
 */
function clearMemory() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Chat Memory");
  if (sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
    }
  }
  SpreadsheetApp.getUi().alert("Memory cleared successfully!");
}

/**
 * Main function called from sidebar to process message with history memory
 */
function sendMessageToGemini(userMessage) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Chat Memory");
  
  if (!sheet) {
    sheet = ss.insertSheet("Chat Memory");
    sheet.appendRow(["Timestamp", "Role", "Message"]);
  }

  // 1. Fetch memory history from Google Sheet
  const lastRow = sheet.getLastRow();
  const historyContents = [];
  
  if (lastRow > 1) {
    const data = sheet.getRange(2, 2, lastRow - 1, 2).getValues(); // Get Role & Message
    data.forEach(row => {
      const role = row[0];
      const text = row[1];
      if (role && text) {
        historyContents.push({
          role: role === "user" ? "user" : "model",
          parts: [{ text: String(text) }]
        });
      }
    });
  }

  // 2. Append current user message to conversation history
  historyContents.push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  // 3. Save User Message to Sheet Memory
  sheet.appendRow([new Date(), "user", userMessage]);

  // 4. Send API Request to Gemini API
  const url = \`https://generativelanguage.googleapis.com/v1beta/models/\${MODEL_NAME}:generateContent?key=\${GEMINI_API_KEY}\`;
  
  const payload = {
    contents: historyContents
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());

    if (json.error) {
      return "Error: " + json.error.message;
    }

    const aiResponse = json.candidates[0].content.parts[0].text;

    // 5. Save AI Response to Sheet Memory
    sheet.appendRow([new Date(), "model", aiResponse]);

    return aiResponse;

  } catch (err) {
    return "Execution Error: " + err.toString();
  }
}`;

const SIDEBAR_HTML_CODE = `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 12px;
        background-color: #f8f9fa;
        margin: 0;
      }
      #chat-box {
        height: 380px;
        overflow-y: auto;
        border: 1px solid #dadce0;
        border-radius: 8px;
        background: #ffffff;
        padding: 10px;
        margin-bottom: 10px;
      }
      .msg {
        margin-bottom: 10px;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.4;
        word-wrap: break-word;
      }
      .user {
        background-color: #e3f2fd;
        color: #0d47a1;
        margin-left: 20%;
        text-align: right;
      }
      .model {
        background-color: #f1f3f4;
        color: #202124;
        margin-right: 20%;
      }
      .input-container {
        display: flex;
        gap: 6px;
      }
      textarea {
        flex: 1;
        resize: none;
        height: 40px;
        padding: 8px;
        border: 1px solid #dadce0;
        border-radius: 6px;
        font-family: inherit;
        font-size: 13px;
      }
      button {
        background: #1a73e8;
        color: white;
        border: none;
        padding: 0 14px;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
      }
      button:hover {
        background: #1557b0;
      }
      button:disabled {
        background: #bdc1c6;
        cursor: not-allowed;
      }
    </style>
  </head>
  <body>
    <h3>Gemini Assistant</h3>
    <div id="chat-box">
      <div class="msg model">Hello! I am your Gemini AI assistant with full memory in this spreadsheet. How can I help you today?</div>
    </div>
    <div class="input-container">
      <textarea id="user-input" placeholder="Type a message..."></textarea>
      <button id="send-btn" onclick="sendMsg()">Send</button>
    </div>

    <script>
      function sendMsg() {
        const input = document.getElementById("user-input");
        const btn = document.getElementById("send-btn");
        const chatBox = document.getElementById("chat-box");
        const message = input.value.trim();

        if (!message) return;

        // Render User Message
        appendMessage("user", message);
        input.value = "";
        btn.disabled = true;

        // Call Apps Script function
        google.script.run
          .withSuccessHandler(function(response) {
            appendMessage("model", response);
            btn.disabled = false;
          })
          .withFailureHandler(function(err) {
            appendMessage("model", "Error: " + err);
            btn.disabled = false;
          })
          .sendMessageToGemini(message);
      }

      function appendMessage(role, text) {
        const chatBox = document.getElementById("chat-box");
        const div = document.createElement("div");
        div.className = "msg " + role;
        div.innerText = text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    </script>
  </body>
</html>`;

export function PomelliSheetsConverter() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="p-8 bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pomelli Website & Google Sheets Integration</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Pomelli Website & Google Sheets Gemini Converter
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Convert and embed your Pomelli website campaigns and deploy the official Google Sheets Apps Script Gemini Chat with persistent spreadsheet memory in NISAR AI Studio.
            </p>
          </div>
          <a
            href="https://labs.google.com/u/0/pomelli/website/9ov4uKkvJNxaHuCztahkUN"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            <span>Open Pomelli Website</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Pomelli Website Link Card */}
      <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Linked Pomelli Website Campaign</h3>
              <p className="text-xs text-slate-400">Labs Google Pomelli Website Instance</p>
            </div>
          </div>
          <a
            href="https://labs.google.com/u/0/pomelli/website/9ov4uKkvJNxaHuCztahkUN"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 rounded-lg text-xs font-mono font-bold transition"
          >
            <span>Visit labs.google.com/...</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs text-slate-300 overflow-x-auto">
          <span className="text-emerald-400">https://labs.google.com/u/0/pomelli/website/9ov4uKkvJNxaHuCztahkUN</span>
          <button
            onClick={() => handleCopy('https://labs.google.com/u/0/pomelli/website/9ov4uKkvJNxaHuCztahkUN', 'pomelli_link')}
            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded border border-emerald-500/30 flex items-center space-x-1"
          >
            {copiedCode === 'pomelli_link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode === 'pomelli_link' ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Apps Script Gemini Chat Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code.gs */}
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Google Apps Script: Code.gs</h3>
                <p className="text-xs text-slate-400">Backend script handling Gemini API & spreadsheet memory</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(APPS_SCRIPT_CODE, 'codegs')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/30 text-xs font-mono font-bold transition"
            >
              {copiedCode === 'codegs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'codegs' ? 'Copied Code.gs!' : 'Copy Code.gs'}</span>
            </button>
          </div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 h-80 overflow-y-auto">
            <pre>{APPS_SCRIPT_CODE}</pre>
          </div>
        </div>

        {/* Sidebar.html */}
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Google Apps Script: Sidebar.html</h3>
                <p className="text-xs text-slate-400">Interactive chat sidebar UI inside Google Sheets</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(SIDEBAR_HTML_CODE, 'sidebarhtml')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg border border-purple-500/30 text-xs font-mono font-bold transition"
            >
              {copiedCode === 'sidebarhtml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'sidebarhtml' ? 'Copied Sidebar.html!' : 'Copy Sidebar.html'}</span>
            </button>
          </div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 h-80 overflow-y-auto">
            <pre>{SIDEBAR_HTML_CODE}</pre>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span>Quick Setup Guide for Google Sheets Gemini Chat Memory</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">1</div>
            <h4 className="font-bold text-slate-200">Create Sheet & Headers</h4>
            <p className="text-slate-400 leading-relaxed">Create a new Google Sheet. Name the first tab <code className="text-emerald-400">Chat Memory</code> with headers in A1:C1: Timestamp, Role, Message.</p>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">2</div>
            <h4 className="font-bold text-slate-200">Open Apps Script</h4>
            <p className="text-slate-400 leading-relaxed">Go to <code className="text-emerald-400">Extensions &gt; Apps Script</code> in your Google Sheet and paste <code className="text-cyan-400">Code.gs</code>.</p>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</div>
            <h4 className="font-bold text-slate-200">Add Sidebar HTML</h4>
            <p className="text-slate-400 leading-relaxed">Create a new HTML file named <code className="text-purple-400">Sidebar</code> in Apps Script and paste <code className="text-purple-400">Sidebar.html</code>.</p>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">4</div>
            <h4 className="font-bold text-slate-200">Add API Key & Run</h4>
            <p className="text-slate-400 leading-relaxed">Insert your Gemini API key in <code className="text-emerald-400">Code.gs</code>, save, refresh sheet, and open <code className="text-emerald-400">🤖 Gemini Chat</code> menu!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
