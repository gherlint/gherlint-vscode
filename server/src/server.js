const {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    DidChangeConfigurationNotification,
    TextDocumentSyncKind,
} = require('vscode-languageserver/node');

const { validateSteps } = require('./linter');
const { formatDocument } = require('./formatter');

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);
// Text document manager
const documents = new TextDocuments();

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

connection.onInitialize((params) => {
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);

    const result = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            completionProvider: {
                resolveProvider: true,
            },
            documentFormattingProvider: true,
            documentRangeFormattingProvider: true,
        },
    };

    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true,
            },
        };
    }
    return result;
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(() => {
            connection.console.log('Workspace folder change event received.');
        });
    }
});

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings = { maxNumberOfProblems: 1000 };
let globalSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings = new Map();

connection.onDidChangeConfiguration((change) => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings = change.settings.languageServerExample || defaultSettings;
    }
    // Revalidate all open text documents
    documents.all().forEach(validateSteps);
});

function getDocumentSettings(resource) {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'languageServerExample',
        });
        documentSettings.set(resource, result);
    }
    return result;
}

// Only keep settings for open documents
documents.onDidClose((_event) => {
    documentSettings.delete(_event.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(async ({ document }) => {
    // check for errors
    const diagnostics = await validateSteps(document);

    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ uri: document.uri, diagnostics });
});

connection.onDidChangeWatchedFiles(() => {
    connection.console.log('We received a file change event');
});

connection.onDocumentFormatting((params) => {
    const result = formatDocument(documents, params);
    return Promise.resolve(result);
});

// This handler provides the initial list of the completion items.
connection.onCompletion(() => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [];
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item) => {
    return item;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
