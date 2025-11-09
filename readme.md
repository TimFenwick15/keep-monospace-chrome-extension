Google Keep is a note taking app with web and app versions.

There is some text formatting, but only bold, underline, and headings. This means it's not well suited to notes on code, maths, music etc

I want a way to convert text encloded in triple-backtick blocks to a monospaced font.

This is possible with existing browser extensions such as TamperMonkey. However I don't want to give an extension access to the contents of my note taking app.

This is a project to implement my own browser extension which while viewing Google Keep will look for code blocks and display them in monospace font.

My first attempt was to do this inline in the note. However Keep will lock up if you modify the note content in this way.

Instead I've added a floating box which will display any detected code blocks seperately.

## How it works
Keep contains a lot of nested divs with obfuscated class names. There isn't anything in the DOM I feel safe using to identify a note.

Each line of the text of the note is a `p` tag that contains a `span` tag. So I'm searching for these as a way to get the note text.

When you click a note, it shows in the foreground, but you can still see notes in the background. When you search note text, some of the text shows in these background notes, so you might get a duplicate of your code block. For now I'm skipping the first code block and not putting any more on screen so the one I want cleanly displays. Eventually I want to handle this better.

The script runs on keyup. This will probably change because it means the code block isn't shown until you start typing. It reloads quite quickly while editing a code block.

## Adding an extension to Chrome
- Create a directory containing `manifest.json` and `content.js`. The files in this repo for example
- In Chrome, navigate to `chrome://extensions/`
- Turn on the `Developer mode` option in the top right
- Click `Load unpacked`
- Navigate to the directory you created
- (Possible step here I didn't note down)
- When you make a code change, you will need to reload the extension from this Chrome tab. If there was an error with your extension, you will need to click `Errors` and clear them before reloading. You can put a `console.log("Hello world")`, reload your webpage, and look for `Hello world` in the dev tools console (press `F12`, click the `Console` tab) to check the extension is running

## ChatGPT
- Used as a guide to add a browser extension
- Generated the JS and CSS that creates the floating, dragable box
- Was used as a reference for creating the `getCodeBlocks` function, but the not-yet-working logic is mine :)

## To do
- Is it possible this would work if I coppied the text out instead of trying to modify the DOM? All note content is probably contained in a div somewhere. There would be close duplicates but eventually I can filter those out. I think this would fail because the content between the backtick-blocks will contain HTML. Perhaps this could be stripped by removing any remaaining text enclosed with tags?
```
  document.querySelectorAll("div").forEach(x => {
    if (x.innerHTML) {
      x.innerHTML = x.innerHTML.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
    }
  })
```
- Backtick blocks will never mismatch because the hidden note will have the same number as the foreground note, always giving an even result
    - This means the text outside the block will be selected and the box will fill with note text
    - For now I'm setting a max length to avoid the issue
    - I think I can identify text from the background notes. I could use this to reject background backticks
- (Optional) Pack my extension?

### Done
- Show multiple code blocks? (The skip logic will conflict with this initially)
- (Bug) If there are two code blocks on screen, they do show, but new-lines don't work. Extra blocks will be repeated because of the skip code assuming only one block
    - This went away in the current code version able to show multiple code blocks
- Text horizontally overflows and grows the box too tall vertically. Make the box scrollable. Have also made box horizontally scrollable, will change if this is annoying
