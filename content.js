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
    .box-content {
      max-height: 80vh;
      overflow-y: auto;
      overflow-x: auto;
    }
  `;

  const boxContent = document.createElement('div')
  boxContent.className = "box-content"

  document.head.appendChild(style);
  document.body.appendChild(box);
  box.appendChild(boxContent)


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
    let found = false  // Don't show the code block box if we didn't find a code block
    let count = 0      // If there are too many lines, asume something has gone wrong and clear the text

    // All note content is contained in a span that descends from a p. Read all note text enclosed in triple-backticks from these spans
    document.querySelectorAll("p > span").forEach(x => {
      // Looking for a way to distinguish between content from the background invisible notes and the noes on screen.
      // When I read attributes, the length of background tags is 2, and the length of foreground tags is 3.
      // So if length is 2, we shouldn't display this tag.
      // This relies on a non-specific detail of the page so will be likely to break in the future.
      if (x.attributes.length != 2) {
        if (x.innerHTML.includes("```")) {
          if (inside) {
            inside = false
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
            blocks.pop()
            inside = false
          }
          else {
            const parser = new DOMParser()
            blocks.at(-1).push(parser.parseFromString(x.innerHTML, "text/html").documentElement.textContent)
          }
        }
      }
    });

    // Remove all pre and hr tags we previously added to box
    boxContent.querySelectorAll("pre, hr").forEach(x => {
      x.remove()
    })

    if (found && !inside) {
      // Place all copied note text in box in a monospace font
      let output = []
      blocks.forEach(x => {
        let hr = document.createElement("hr")
        let pre = document.createElement("pre")
        pre.textContent += x.join("\n")
        boxContent.appendChild(pre)
        boxContent.appendChild(hr)
      })
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
