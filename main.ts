import {
  App,
  debounce,
  Notice,
  TFile,
  Plugin,
  PluginSettingTab,
} from "obsidian";
import {
  DEFAULT_SETTINGS,
  BasesStyledColumnsSettings,
  ColumnConfig,
} from "settings";
import { SampleSettingTab } from "settingsUI";

function hookIntoBase(plugin: BasesStyledColumns, containerEl: HTMLElement) {
  if (containerEl.dataset.myObserverAttached === "true") return;
  containerEl.dataset.myObserverAttached = "true";

  const debouncedDecorate = debounce(
    () => decorateBase(containerEl, plugin.settings),
    plugin.settings.debounceTime,
  );

  const observer = new MutationObserver((_) => {
    debouncedDecorate();
  });

  observer.observe(containerEl, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  decorateBase(containerEl, plugin.settings);

  plugin.register(() => observer.disconnect());
}

function decorateBase(root: HTMLElement, settings: BasesStyledColumnsSettings) {
  const timeStart = Date.now();

  let jsFunctionError: null | { column: ColumnConfig; error: Error } = null;
  settings.columns.forEach((column) => {
    // console.log(`Decorating ${column.dataProperty} with mode ${column.mode}`);
    root
      .querySelectorAll(`div.bases-td[data-property='${column.dataProperty}']`)
      .forEach((el: any) => {
        const childInput = el.querySelector("input");

        let value = undefined;
        if (childInput) {
          if (childInput.type === "checkbox") {
            value = childInput.checked;
          } else {
            value = childInput.value;
          }
        } else {
          const multiselectPills = el.querySelectorAll(
            ".multi-select-pill-content",
          );
          if (multiselectPills.length > 0) {
            value = Array.from(multiselectPills)
              .map((pill: any) => pill.textContent?.trim())
              .filter((c) => c);
          } else {
            value = el
              .querySelector(".metadata-input-longtext")
              ?.textContent?.trim();
          }
        }
		
		if(column.dataProperty.startsWith("formula.")) {
          value = el.querySelector(".bases-rendered-value")?.textContent?.trim();
        }

        el.classList.forEach((cls: any) => {
          if (cls.startsWith(settings.cssClassPrefix)) {
            el.classList.remove(cls);
          }
        });

        let classesToAdd: string[] = [];

        if (column.mode === "css" && column.cssClasses) {
          classesToAdd = column.cssClasses
            .split(",")
            .map((c) => c.trim().replace("$PREFIX-", settings.cssClassPrefix))
            .filter((c) => c);
        } else if (column.mode === "function" && column.jsFunction) {
          try {
            const code = column.jsFunction.replace(
              /\$PREFIX-/g,
              settings.cssClassPrefix,
            );
            const func = new Function("el", "value", code);
            const result = func(el, value);
            classesToAdd = Array.isArray(result) ? result : [];
          } catch (error) {
            jsFunctionError = {
              column: column,
              error: error as Error,
            };
            return;
          }
        }

        classesToAdd.forEach((className) => {
          if (
            typeof className === "string" &&
            className.startsWith(settings.cssClassPrefix)
          ) {
            el.classList.add(className);
          } else if (className) {
            new Notice(
              `Invalid class name "${className}" for ${column.dataProperty}. Classes must start with "${settings.cssClassPrefix} (prefix can be changed in settings)"`,
            );
          }
        });
      });
  });

  if (jsFunctionError !== null) {
    new Notice(
      `Error in JS function for ${(jsFunctionError as any).column.dataProperty}: ${(jsFunctionError as any).error}`,
    );
  }

  console.log(
    `Bases Styled Columns: Decorated base in ${Date.now() - timeStart}ms`,
  );
}
export default class BasesStyledColumns extends Plugin {
  settings: BasesStyledColumnsSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        if (!leaf) return;
        const view = leaf.view;
        const file: TFile = (view as any).file;
        if (file?.extension === "base") {
          hookIntoBase(this, view.containerEl);
        }
      }),
    );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
