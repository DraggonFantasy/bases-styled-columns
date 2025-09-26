# Bases Styled Columns
![Demo screenshot](assets/screenshot.png)

A simple small Obsidian plugin for attaching custom CSS classes to the Obsidian Bases columns. It was initially created for a personal use case, but I think it could be useful for others as well.  

**NOTE**: no guarantee that this will be compatible with future versions of Obsidian as it's relaying on the direct DOM manipulations. Maybe in future there will be a better way to do it.

## Installation

### BRAT

1. Open the "Community plugins" tab in the settings.
2. Install "BRAT" plugin.
3. In the BRAT settings, find the "Beta plugin list" section and click "Add beta plugin".
4. Insert the repository link: `https://github.com/draggonfantasy/bases-styled-columns`
5. Select version
6. Click "Add plugin"

### Manual

1. Download the `main.js` and `manifest.json` from the [Releases](https://github.com/draggonfantasy/obsidian-bases-styled-columns/releases) page.
2. Put them to `<your vault>/.obsidian/plugins/bases-styled-columns/`.
3. Restart Obsidian or click "refresh" button in the "Community plugins" tab in the settings.

## Usage

The plugin works by attaching custom CSS classes to the Base view. All CSS classes are required to have a pre-defined prefix in order to simplify the CSS manipulations. By default this prefix is `base-styled-` which I think is a balance between the prefix size, readability and probability of collisions with other classes. You can change this prefix in the settings, but then you will need to adjust your CSS snippets accordingly.

The CSS classes are configured in the settings per column (per property). There are 2 options to define the CSS class:
1. **Static CSS classes** - just a comma separated list of CSS classes that will be attached to the corresponding property. It does not depend on the value of the property.
2. **JS function** - this function will be used to determine the CSS classes dynamically depending on the value of property on the note.

Both CSS classes and JS function require you to explicitly include word `$PREFIX-` in the beginning of each class name. This word is automatically replaced with the currently defined CSS prefix. If you forget to include this prefix - the plugin will display an error. 

After you have defined the classes for columns, you can just use them in your CSS snippets - just don't forget to include the prefix which you have defined in the settings.

**Note**: The name of the property is usually called "note.<name of the property as you see in Obsidian>". So if your Obsidian property is called "fancy-column" -> you should use "note.fancy-column" in the plugin settings.

## Examples

### JS function configuration
The plugin defines a default "priority" column. It uses JS function to demonstrate how it works.
You can use variables `el` and `value` in your JS functions. `el` is the DOM element of the cell, `value` is the value of the property inferred from the DOM.

Example of the default "priority" property:
```javascript
const priorityValue = Number(value);
if (value == null || value.trim() === "" || Number.isNaN(priorityValue)) {
	return [];
}
const priorityBucket = Math.floor(priorityValue / 10);
return [`$PREFIX-note-priority-${priorityBucket * 10}`];
```
So it will attach classes like `base-styled-note-priority-0`, `base-styled-note-priority-10`, `base-styled-note-priority-20`, etc. to the corresponding priority values 0-10, 10-20, etc.

If you want to attach class "$PREFIX-my-class-a" for value "A" and "$PREFIX-my-class-b" for value "B" - you can use something like this:
```javascript
if (value === "A") return ["$PREFIX-my-class-a"];
if (value === "B") return ["$PREFIX-my-class-b"];
```

If you are struggling with the JS function, you can add good old 
```javascript
console.log(el, value);
```
in the JS function to see what is going on in the DevTools console. Note that it will output approximately as many lines as there are (visible) rows in the table.

`value` variable contains the value of the property inferred from the DOM and depends on the property type:
 - Text: string
 - Number: number
 - Date: string 'YYYY-MM-DD'
 - Date & time: string 'YYYY-MM-DDTHH:mm'
 - Checkbox: true / false
 - List: array of strings

If the plugin cannot infer the value or it's empty (e.g. empty List), the `value` will be undefined/null.  
If the plugin fails to infer the value, you can always use the `el` to parse the value from DOM by yourself.

### CSS snippets

Example of CSS snippet for the default "priority" column:
```css
:root {
  --base-styled-note-pri-radius: 6px;
  --base-styled-note-pri-pad-y: 2px;
  --base-styled-note-pri-pad-x: 6px;
}

body.theme-light {
  --base-styled-note-pri-hot: oklch(0.86 0.12 28);
  --base-styled-note-pri-cold: oklch(0.92 0.06 260);
  --base-styled-note-pri-ink: #1d1d1f;
}

body.theme-dark {
  --base-styled-note-pri-hot: oklch(0.4 0.08 28);
  --base-styled-note-pri-cold: oklch(0.3 0.05 260);
  --base-styled-note-pri-ink: #ffffff;
}

[class^="base-styled-note-priority-"],
[class*=" base-styled-note-priority-"] {
  color: var(--base-styled-note-pri-ink);
  border-radius: var(--base-styled-note-pri-radius);
  padding: var(--base-styled-note-pri-pad-y) var(--base-styled-note-pri-pad-x);
  border: 1px solid color-mix(in oklch, var(--base-styled-note-pri-ink) 14%, transparent);
}

.base-styled-note-priority-0   { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 100%, var(--base-styled-note-pri-cold) 0%); }
.base-styled-note-priority-10  { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 90%,  var(--base-styled-note-pri-cold) 10%); }
.base-styled-note-priority-20  { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 80%,  var(--base-styled-note-pri-cold) 20%); }
.base-styled-note-priority-30  { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 70%,  var(--base-styled-note-pri-cold) 30%); }
.base-styled-note-priority-40  { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 60%,  var(--base-styled-note-pri-cold) 40%); }
.base-styled-note-priority-50  { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 50%,  var(--base-styled-note-pri-cold) 50%); }
.base-styled-note-priority-60  { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 40%,  var(--base-styled-note-pri-cold) 60%); }
.base-styled-note-priority-70  { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 30%,  var(--base-styled-note-pri-cold) 70%); }
.base-styled-note-priority-80  { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 20%,  var(--base-styled-note-pri-cold) 80%); }
.base-styled-note-priority-90  { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 10%,  var(--base-styled-note-pri-cold) 90%); }
.base-styled-note-priority-100 { background: color-mix(in oklch, var(--base-styled-note-pri-hot) 0%,   var(--base-styled-note-pri-cold) 100%); }

.bases-td[class*="base-styled-note-priority-"] {
  border-radius: 4px;
  padding: 0 4px;
}

```

If you want to modify the text style, you may need to use child selectors, e.g.:
```css
.base-styled-fancy > div {
    font-family: "Virgil" !important;
    font-weight: 300;
    border: 1px green dashed;
    background: #F0EBD9 !important;
}

.base-styled-active > div > div {
    color: #1d1d1f !important;
    font-weight: 600;
    font-size: 1.3em;
}

.base-styled-suspended > div > div {
    color: #1d1d1f !important;
    font-weight: 600;
    font-size: 1.3em;
}

.base-styled-active {
    background-color: #8CEA8C !important;
    border-radius: 20px;
    text-align: center;
}

.base-styled-suspended {
    background-color: #E38F7D !important;
    border-radius: 20px;
    text-align: center;
}
```
