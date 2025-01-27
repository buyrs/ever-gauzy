import { MessageBoxOptions } from 'electron';

export interface IDesktopDialog {
	show(): Promise<any>;
	close(): void;
	get options(): MessageBoxOptions;
	set options(value: MessageBoxOptions);
}
