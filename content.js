(function() {
  // --- Create the box element ---
  const box = document.createElement('div');
  box.className = 'floating-box';
  box.innerHTML = `
    <div class="floating-header">
      <span>Code Blocks</span>
      <button id="closeBox" title="Close">✕</button>
    </div>
  `;

  // --- Add CSS styles dynamically ---
  const style = document.createElement('style');
  style.textContent = `
    .floating-box {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 10px;
      padding: 0 0 10px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      width: 320px;
      font-family: sans-serif;
      cursor: default;
      color: black;
      display: none;
    }
    .floating-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f6f6f6;
      border-radius: 10px 10px 0 0;
      cursor: move;
      user-select: none;
    }
    .floating-header button {
      border: none;
      background: none;
      font-size: 16px;
      cursor: pointer;
    }
    .floating-header button:hover {
      color: #d00;
    }
    .floating-box p {
      margin: 10px 12px 0 12px;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(box);

  // --- Close button ---
  box.querySelector('#closeBox').addEventListener('click', () => box.remove());

  // --- Drag logic ---
  const header = box.querySelector('.floating-header');
  let offsetX = 0, offsetY = 0, dragging = false;

  header.addEventListener('mousedown', e => {
    dragging = true;
    const rect = box.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    e.preventDefault();

    const newLeft = e.clientX - offsetX;
    const newTop  = e.clientY - offsetY;

    box.style.left = `${Math.max(0, newLeft)}px`;
    box.style.top  = `${Math.max(0, newTop)}px`;
    box.style.right = 'auto';
    box.style.bottom = 'auto';
  });

  function getCodeBlocks() {
    let blocks = []    // A list code blocks. Each code block is a list of lines of text
    let inside = false // true when we're reading lines within a code block. Else false
    let skip = true    // Skip the first block to avoid displaying text from hidden note. This isn't a good solution, eventually I'll want to show more than one code block
    let found = false  // Don't show the code block box if we didn't find a code block
    let count = 0      // If there are too many lines, asume something has gone wrong and clear the text

    // All note content is contained in a span that descends from a p. Read all note text enclosed in triple-backticks from these spans
    document.querySelectorAll("p > span").forEach(x => {
      if (x.innerHTML.includes("```")) {
          if (inside) {
            inside = false
            skip = false
            found = true
            count = 0
          }
          else {
            blocks.push([])
            inside = true
          }
      }
      else if (inside) {
        
        if (count++ > 10) {
            blocks.at(-1).length = 0 // This is a hack to clear the list. x = [] doesn't work when we access the list using .at()
        }
        else if (!skip) {
          const parser = new DOMParser()
          blocks.at(-1).push(parser.parseFromString(x.innerHTML, "text/html").documentElement.textContent)
        }
      }
    });

    // Remove all pre tags we previously added to box
    box.querySelectorAll("pre").forEach(x => {
        console.log("Removing")
        x.remove()
    })

    if (found && !inside) {
      // Place all copied note text in box in a monospace font
      let output = document.createElement("pre");
      blocks.forEach(x => {
        output.textContent += x.join("\n")
      })
      output.textContent += "\n\n"
      box.appendChild(output)
      box.style.display = "block"
    }
    else {
      // Hide the box, we didn't find a block. If inside is still true here, we have mismatching ``` tags
      box.style.display = "none"
    }
  }

  document.addEventListener("keyup", () => {
    getCodeBlocks()
  })

})()
