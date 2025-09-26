export interface ColumnConfig {
	dataProperty: string;
	mode: 'css' | 'function';
	cssClasses?: string; // comma-separated for css mode
	jsFunction?: string; // JS code for function mode
}

export interface BasesStyledColumnsSettings {
	columns: ColumnConfig[];
	cssClassPrefix: string;
	debounceTime: number;
}

export const DEFAULT_SETTINGS: BasesStyledColumnsSettings = {
	cssClassPrefix: 'base-styled-',
    debounceTime: 500,
	columns: [
		{
			dataProperty: 'note.priority',
			mode: 'function',
			jsFunction: `const priorityValue = Number(value);
if (value == null || value.trim() === "" || Number.isNaN(priorityValue)) {
	return [];
}
const priorityBucket = Math.floor(priorityValue / 10);
return [\`$PREFIX-note-priority-\${priorityBucket * 10}\`];`
		}
	]
}
