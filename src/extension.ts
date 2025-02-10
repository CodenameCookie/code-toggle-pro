import * as vscode from 'vscode';

// Logger utility for error handling and debugging
class Logger {
    private static output: vscode.OutputChannel;

    static initialize() {
        this.output = vscode.window.createOutputChannel('Code Toggle Pro');
    }

    static log(message: string) {
        this.output.appendLine(`[${new Date().toISOString()}] ${message}`);
    }

    static error(error: Error | string) {
        const message = error instanceof Error ? error.message : error;
        this.output.appendLine(`[ERROR ${new Date().toISOString()}] ${message}`);
        if (error instanceof Error && error.stack) {
            this.output.appendLine(error.stack);
        }
    }
}

// Manager for handling panel visibility state
class ToggleManager {
    private static instance: ToggleManager;
    private explorerVisible: boolean = true;
    private statusBarItem: vscode.StatusBarItem;

    private constructor() {
        // Initialize state based on current visibility
        this.explorerVisible = this.isExplorerVisible();
        
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.statusBarItem.command = 'flipswitch.toggleExplorer';
        this.updateStatusBarItem();
        this.statusBarItem.show();
    }

    static getInstance(): ToggleManager {
        if (!ToggleManager.instance) {
            ToggleManager.instance = new ToggleManager();
        }
        return ToggleManager.instance;
    }

    private isExplorerVisible(): boolean {
        return vscode.workspace.getConfiguration('workbench').get('activityBar.visible', true);
    }

    private updateStatusBarItem() {
        this.statusBarItem.text = this.explorerVisible ? '$(eye) Explorer: Visible' : '$(eye-closed) Explorer: Hidden';
        this.statusBarItem.tooltip = 'Click to toggle Explorer visibility';
    }

    async toggleExplorer(): Promise<void> {
        try {
            this.explorerVisible = !this.explorerVisible;
            await vscode.commands.executeCommand('workbench.action.toggleSidebarVisibility');
            this.updateStatusBarItem();
            Logger.log(`Explorer visibility toggled: ${this.explorerVisible}`);
        } catch (error) {
            Logger.error('Failed to toggle explorer: ' + error);
            throw error;
        }
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}

export function activate(context: vscode.ExtensionContext) {
    try {
        Logger.initialize();
        Logger.log('Code Toggle Pro extension activating...');

        const toggleManager = ToggleManager.getInstance();

        // Register commands
        context.subscriptions.push(
            vscode.commands.registerCommand('flipswitch.toggleExplorer', () => toggleManager.toggleExplorer())
        );

        Logger.log('Code Toggle Pro extension activated successfully');
    } catch (error) {
        Logger.error('Failed to activate extension: ' + error);
        throw error;
    }
}

export function deactivate() {
    ToggleManager.getInstance().dispose();
}