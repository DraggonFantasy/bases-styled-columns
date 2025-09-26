import { App, Setting, PluginSettingTab, Notice } from "obsidian";

export class SampleSettingTab extends PluginSettingTab {
  plugin: any;

  constructor(app: App, plugin: any) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("CSS classes prefix")
      .setDesc("Each class name should start with this prefix")
      .addText((text) =>
        text
          .setPlaceholder("Enter prefix")
          .setValue(this.plugin.settings.cssClassPrefix)
          .onChange(async (value) => {
            this.plugin.settings.cssClassPrefix = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Debounce delay")
      .setDesc(
        "Delay in milliseconds for debouncing. Smaller values will result in more frequent updates and smoother UX",
      )
      .addText((text) =>
        text
          .setPlaceholder("Enter delay in milliseconds")
          .setValue(this.plugin.settings.debounceTime.toString())
          .onChange(async (value) => {
            const parsedValue = parseInt(value);
            if (isNaN(parsedValue)) {
              new Notice("Please enter a valid number");
              return;
            }
            this.plugin.settings.debounceTime = parsedValue;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Styled Columns Configuration")
      .setDesc("Configure how different columns should be styled");

    this.plugin.settings.columns.forEach((column: any, index: number) => {
      const columnDiv = containerEl.createDiv("column-config");
      columnDiv.style.border = "1px solid var(--background-modifier-border)";
      columnDiv.style.padding = "10px";
      columnDiv.style.marginBottom = "10px";

      new Setting(columnDiv)
        .setName(`Column ${index + 1}: Data Property`)
        .addText((text) =>
          text
            .setPlaceholder("e.g., note.priority")
            .setValue(column.dataProperty)
            .onChange(async (value) => {
              column.dataProperty = value;
              await this.plugin.saveSettings();
            }),
        );

      new Setting(columnDiv).setName("Mode").addDropdown((dropdown) =>
        dropdown
          .addOption("css", "CSS Classes")
          .addOption("function", "JS Function")
          .setValue(column.mode)
          .onChange(async (value: "css" | "function") => {
            column.mode = value;
            await this.plugin.saveSettings();
            this.display(); // Refresh to show/hide relevant fields
          }),
      );

      if (column.mode === "css") {
        new Setting(columnDiv)
          .setName("CSS Classes")
          .setDesc(
            "Comma-separated list of CSS classes (must start with $PREFIX-)",
          )
          .addTextArea((text) =>
            text
              .setPlaceholder(`$PREFIX-class1, $PREFIX-class2`)
              .setValue(column.cssClasses || "")
              .onChange(async (value) => {
                const classes = value.split(",").map((c) => c.trim());
                const firstBadClass = classes.find(
                  (c) => !c.startsWith("$PREFIX-"),
                );
                if (firstBadClass) {
                  // ignore if user keeps typing $PREFIX
                  if (
                    !firstBadClass.startsWith("$") ||
                    !"$PREFIX-".startsWith(firstBadClass)
                  ) {
                    new Notice("All classes must start with $PREFIX-");
                  }
                  return;
                }
                column.cssClasses = value;
                await this.plugin.saveSettings();
              }),
          );
      } else if (column.mode === "function") {
        new Setting(columnDiv)
          .setName("JS Function")
          .setDesc(createHelpDocumentFragment())
          .addTextArea((text) =>
            text
              .setPlaceholder("return [`obsc-${value}`];")
              .setValue(column.jsFunction || "")
              .onChange(async (value) => {
                column.jsFunction = value;
                await this.plugin.saveSettings();
              }),
          );
      }

      new Setting(columnDiv).addButton((button) =>
        button
          .setButtonText("Remove Column")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.columns.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          }),
      );
    });

    new Setting(containerEl).addButton((button) =>
      button
        .setButtonText("Add Column")
        .setCta()
        .onClick(async () => {
          this.plugin.settings.columns.push({
            dataProperty: "",
            mode: "css",
            cssClasses: "",
          });
          await this.plugin.saveSettings();
          this.display();
        }),
    );
  }
}

function createHelpDocumentFragment() {
  const helpFragment = document.createDocumentFragment();

  const title = document.createElement("div");
  title.style.fontWeight = "600";
  title.style.marginBottom = "8px";
  title.textContent = "Function body that returns array of CSS classes.";

  const warningBox = document.createElement("div");
  warningBox.style.border = "1px solid red";
  warningBox.style.borderRadius = "4px";
  warningBox.style.padding = "8px";
  warningBox.style.marginBottom = "12px";

  const warningTitle = document.createElement("div");
  warningTitle.style.fontWeight = "600";
  warningTitle.style.marginBottom = "4px";
  warningTitle.innerHTML = "\u26A0 Security Warning";

  const warningText = document.createElement("div");
  warningText.innerHTML =
    "Only paste JavaScript code from trusted sources. Malicious code can access your data, make network requests, or perform other harmful actions.";

  warningBox.appendChild(warningTitle);
  warningBox.appendChild(warningText);

  const availableVars = document.createElement("div");
  availableVars.style.marginBottom = "12px";
  availableVars.innerHTML = "<strong>Available variables:</strong>";

  const varList = document.createElement("ul");
  varList.style.margin = "4px 0";
  varList.style.paddingLeft = "20px";

  const elVar = document.createElement("li");
  elVar.innerHTML = "<code>el</code>: the DOM element of the Base cell";

  const valueVar = document.createElement("li");
  valueVar.innerHTML = "<code>value</code>: the value of the property";

  varList.appendChild(elVar);
  varList.appendChild(valueVar);

  const requirement = document.createElement("div");
  requirement.style.fontStyle = "italic";
  requirement.innerHTML = `The function must return array of CSS classes, each class name starts with literal "<code>$PREFIX-</code>"`;

  helpFragment.appendChild(title);
  helpFragment.appendChild(warningBox);
  helpFragment.appendChild(availableVars);
  helpFragment.appendChild(varList);
  helpFragment.appendChild(requirement);

  return helpFragment;
}
