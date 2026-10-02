---
title: Hybrid Context: local stays local, the assistant still does the work
date: 2026-10-02
tags: tech
summary: Files, commands and browser sessions on an employee's own computer, used directly by the assistant; content never stored on the server, outbound only, with a kill switch.
---

Companies that adopt AI assistants soon hit a wall: half of what is useful lives on the platform (orders, stock, knowledge bases) and the other half lives on **the employee's own computer** (a supplier spreadsheet, a website they are logged into, a command that only runs locally). Moving the second half to the cloud is neither realistic nor right.

Hybrid Context exists for that wall: the assistant on the platform can use what is on the employee's computer, and **the content never leaves that computer**.

## An outbound-only channel

A small resident program on the employee's computer dials out to the platform. The platform never connects back, and nothing listens on the computer. When the assistant calls a local tool, the request travels down that channel and the result travels back up it, passing through server memory once on its way to the assistant: **never written to a database, never written to disk**.

Four rules have been hard from day one:

- **Outbound only, nothing listens.**
- **The server keeps no copy.** Tool results never touch persistent storage.
- **Bound to a person.** A computer is paired to one user, and only that user's assistant can use it.
- **The platform orchestrates, the computer executes.** The AI decides what to call; the action happens locally.

## The user chooses what to install and what to open

A freshly installed bridge is an empty pipe. To let the assistant see a folder or run commands, the user picks "connectors" from a catalogue on the page. The daemon installs them and reports progress back; installed is not enabled, and enabling first means filling in a form: the allowed folder, the allowed commands. **The user never types a path.** The previous prototype failed exactly there: a product cannot ask people to type `/some/venv/bin/python`.

Each connector has only a handful of states on the page, and every state names the next step: not installed, installing, installed but off, running, failed (with the raw reason shown), stopped. The daemon computes the state in one place and pushes it; the page does not run a second judgement.

## Three kill switches

- **Local:** one press in the menu bar or on the page refuses every call. The daemon stays online, and the switch survives a restart until a person lifts it.
- **Per connector:** stop one, the rest keep working.
- **Server side:** revoke the device token. The local switch covers "I don't want it reading right now"; the server switch covers "that computer is no longer in my hands".

When the switch is down the assistant gets a plain sentence: "The user paused this computer; no local content can be read", with an explicit "do not retry".

## What it looks like

One sentence: "Which suppliers are in suppliers.xlsx, and what are their purchase prices in Fortbrain?" The assistant reads the sheet on your machine, looks up prices on the platform, and returns a small table. The sheet never left your computer; the prices never left the platform.

Chapter 05 on the homepage has a clickable demo that walks exactly this path.
