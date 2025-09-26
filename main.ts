import { App, debounce, Notice, TFile, Plugin, PluginSettingTab } from 'obsidian';
import { DEFAULT_SETTINGS, BasesStyledColumnsSettings } from 'settings';
import { SampleSettingTab } from 'settingsUI';


function hookIntoBase(plugin: BasesStyledColumns, containerEl: HTMLElement) {
	if (containerEl.dataset.myObserverAttached === "true") return;
	containerEl.dataset.myObserverAttached = "true";

	const debouncedDecorate = debounce(() => decorateBase(containerEl, plugin.settings), plugin.settings.debounceTime);

	const observer = new MutationObserver(_ => {
		debouncedDecorate();
	});

	observer.observe(containerEl, { childList: true, subtree: true, attributes: true, characterData: true, attributeFilter: ["value"] });

	decorateBase(containerEl, plugin.settings);

	plugin.register(() => observer.disconnect());
}

function decorateBase(root: HTMLElement, settings: BasesStyledColumnsSettings) {
	const timeStart = Date.now();

	settings.columns.forEach(column => {
		console.log(`Decorating ${column.dataProperty} with mode ${column.mode}`);
		root.querySelectorAll(`div.bases-td[data-property='${column.dataProperty}']`).forEach((el: any) => {
			const childInput = el.querySelector("input");

			let value = undefined;
			if (childInput) {
				value = childInput?.value;
			} else {
				value = el.textContent;
			}

			el.classList.forEach((cls: any) => {
				if (cls.startsWith(settings.cssClassPrefix)) {
					el.classList.remove(cls);
				}
			});

			let classesToAdd: string[] = [];

			if (column.mode === 'css' && column.cssClasses) {
				classesToAdd = column.cssClasses.split(',').map(c => c.trim().replace("$PREFIX-", settings.cssClassPrefix)).filter(c => c);
			} else if (column.mode === 'function' && column.jsFunction) {
				try {
					const code = column.jsFunction.replace("$PREFIX-", settings.cssClassPrefix);
					const func = new Function('el', 'value', code);
					const result = func(el, value);
					classesToAdd = Array.isArray(result) ? result : [];
				} catch (error) {
					new Notice(`Error in JS function for ${column.dataProperty}: ${error.message}`);
					return;
				}
			}

			classesToAdd.forEach(className => {
				if (typeof className === 'string' && className.startsWith(settings.cssClassPrefix)) {
					el.classList.add(className);
				} else if (className) {
					new Notice(`Invalid class name "${className}" for ${column.dataProperty}. Classes must start with "${settings.cssClassPrefix} (prefix can be changed in settings)"`);
				}
			});
		});
	});

	console.log(`Bases Styled Columns: Decorated base in ${Date.now() - timeStart}ms`);
}
export default class BasesStyledColumns extends Plugin {
	settings: BasesStyledColumnsSettings;

	async onload() {
		console.log(this.settings)
		await this.loadSettings();
		console.log(this.settings)
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", leaf => {
				if (!leaf) return;
				const view = leaf.view;
				const file: TFile = (view as any).file;
				if (file?.extension === "base") {
					hookIntoBase(this, view.containerEl);
				}
			})
		);
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}
