document.addEventListener("DOMContentLoaded", () => {
    const topbar = new window.ECTopbar("ECIDE");
    document.getElementById('topbar-container').appendChild(topbar.element);

    const fileMenuBtn = new window.ECButton("File", { variant: "outline" });
    const filePopup = new window.ECPopup(fileMenuBtn);
    
    filePopup._box.classList.remove('left-0');
    filePopup._box.classList.add('right-0');

    const fileList = new window.ECList({ variant: "hoverable" });
    
    fileList.addItem("New File...", () => { filePopup.close(); openNewFileModal(); });
    fileList.addItem("Open File...", () => { filePopup.close(); openSingleFile(); });
    fileList.addItem("Open Folder...", () => { filePopup.close(); openFolder(); });
    fileList.addItem("Save", () => { filePopup.close(); saveFile(); });
    fileList.addItem("Save As...", () => { filePopup.close(); saveFileAs(); });
    
    filePopup.setContent(fileList.element);
    topbar.addAction(filePopup.element);

    const newFileModal = new window.ECModal("Create New File");
    document.body.appendChild(newFileModal.element);
    
    const newFileInput = new window.ECTextbox({ 
        label: "File Name", 
        placeholder: "e.g. index.html, script.js" 
    });
    
    newFileInput.onEnter((val) => createNewFile(val));
    
    newFileModal.setContent(newFileInput.element);
    newFileModal.addFooterButton("Cancel", () => newFileModal.close(), "outline");
    newFileModal.addFooterButton("Create", () => createNewFile(newFileInput.getValue()), "filled");

    function openNewFileModal() {
        newFileInput.setValue('');
        newFileModal.open();
        setTimeout(() => newFileInput.element.querySelector('input').focus(), 50);
    }

    require(['vs/editor/editor.main'], function() {
        window.editor = monaco.editor.create(document.getElementById('editor-container'), {
            value: [
                '// Welcome to ECIDE',
                '// Click "File -> Open Folder" to open a workspace.',
                '// Click "File -> New File" to create a document.'
            ].join('\n'),
            language: 'javascript',
            theme: 'vs-light',
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 14,
            automaticLayout: true,
            minimap: { enabled: false }
        });
    });

    let currentDirHandle = null;
    let currentFileHandle = null;

    function getLanguage(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const map = {
            js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
            html: 'html', css: 'css', scss: 'scss', json: 'json', md: 'markdown',
            py: 'python', java: 'java', c: 'c', cpp: 'cpp', cs: 'csharp',
            go: 'go', rs: 'rust', php: 'php', sh: 'shell', sql: 'sql', xml: 'xml'
        };
        return map[ext] || 'plaintext';
    }

    async function createNewFile(filename) {
        if (!filename.trim()) return;
        try {
            if (currentDirHandle) {
                const newHandle = await currentDirHandle.getFileHandle(filename, { create: true });
                
                const treeData = await buildTree(currentDirHandle);
                renderCustomTree(document.getElementById('tree-container'), treeData);
                
                await openFile({ label: filename, handle: newHandle, path: filename, isDir: false });
            } else {
                currentFileHandle = null;
                if (window.editor) {
                    monaco.editor.setModelLanguage(window.editor.getModel(), getLanguage(filename));
                    window.editor.setValue('');
                }
                topbar.setTitle(`ECIDE - ${filename} (Unsaved)`);
            }
            newFileModal.close();
        } catch (err) {
            new window.ECToast(`Error creating file: ${err.message}`, { type: 'error' }).show();
        }
    }

    async function openSingleFile() {
        try {
            const [fileHandle] = await window.showOpenFilePicker();
            await openFile({ label: fileHandle.name, handle: fileHandle, path: fileHandle.name, isDir: false });
        } catch (err) { }
    }

    async function openFolder() {
        try {
            currentDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            const treeData = await buildTree(currentDirHandle);
            renderCustomTree(document.getElementById('tree-container'), treeData);
            new window.ECToast(`Workspace loaded: ${currentDirHandle.name}`, { type: "success" }).show();
        } catch (err) {
            if (err.name !== 'AbortError') {
                new window.ECToast(`Error: ${err.message}`, { type: "error" }).show();
            }
        }
    }

    async function saveFile() {
        if (!window.editor) return;

        if (!currentFileHandle) {
            return await saveFileAs();
        }
        
        try {
            const writable = await currentFileHandle.createWritable();
            await writable.write(window.editor.getValue());
            await writable.close();
            
            new window.ECToast("File saved successfully", { type: 'success' }).show();
        } catch (err) {
            new window.ECToast(`Failed to save: ${err.message}`, { type: 'error' }).show();
        }
    }

    async function saveFileAs() {
        if (!window.editor) return;
        try {
            const handle = await window.showSaveFilePicker();
            currentFileHandle = handle;
            
            const writable = await currentFileHandle.createWritable();
            await writable.write(window.editor.getValue());
            await writable.close();
            
            topbar.setTitle(`ECIDE - ${handle.name}`);
            new window.ECToast("File saved successfully", { type: 'success' }).show();
        } catch (err) {
            if (err.name !== 'AbortError') {
                new window.ECToast(`Failed to save file: ${err.message}`, { type: 'error' }).show();
            }
        }
    }

    async function buildTree(dirHandle, path = '') {
        const entries = [];
        try {
            for await (const [name, handle] of dirHandle.entries()) {
                const nodePath = path ? `${path}/${name}` : name;
                
                if (handle.kind === 'file') {
                    entries.push({ label: name, handle, path: nodePath, isDir: false });
                } else if (handle.kind === 'directory') {
                    if (name === '.git' || name === 'node_modules') continue; 
                    
                    const children = await buildTree(handle, nodePath);
                    entries.push({ label: name, children, isDir: true });
                }
            }
        } catch (e) {
            console.warn(`Could not read directory contents at ${path}:`, e);
        }
        
        entries.sort((a, b) => {
            if (a.isDir && !b.isDir) return -1;
            if (!a.isDir && b.isDir) return 1;
            return a.label.localeCompare(b.label);
        });
        
        return entries;
    }

    function renderCustomTree(container, nodes, level = 0) {
        if (level === 0) container.innerHTML = '';
        
        nodes.forEach(node => {
            const item = document.createElement('div');
            item.className = "display-flex alignItems-center padding-6px_8px borderRadius-6px cursor-pointer hover:background-var(--ide-border) transition-background_0.15s_ease userSelect-none fontSize-13px color-var(--ide-text) marginBottom-2px";
            item.style.paddingLeft = `${level * 12 + 8}px`;

            const icon = document.createElement('span');
            icon.className = "marginRight-8px fontSize-12px opacity-0.8";
            icon.textContent = node.isDir ? '📁' : '📄';

            const label = document.createElement('span');
            label.textContent = node.label;
            label.className = "whiteSpace-nowrap overflow-hidden textOverflow-ellipsis flex-1";

            item.appendChild(icon);
            item.appendChild(label);

            if (node.isDir) {
                const childrenContainer = document.createElement('div');
                childrenContainer.style.display = 'none'; 
                renderCustomTree(childrenContainer, node.children, level + 1);
                
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = childrenContainer.style.display === 'none';
                    childrenContainer.style.display = isHidden ? 'block' : 'none';
                    icon.textContent = isHidden ? '📂' : '📁';
                });

                container.appendChild(item);
                container.appendChild(childrenContainer);
            } else {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('#tree-container .background-var\\(--ide-border\\)').forEach(el => {
                        el.classList.remove('background-var(--ide-border)');
                    });
                    item.classList.add('background-var(--ide-border)');
                    openFile(node);
                });
                container.appendChild(item);
            }
        });
    }

    async function openFile(node) {
        try {
            const file = await node.handle.getFile();
            const text = await file.text();
            const lang = getLanguage(node.label);
            
            if (window.editor) {
                monaco.editor.setModelLanguage(window.editor.getModel(), lang);
                window.editor.setValue(text);
            }
            
            currentFileHandle = node.handle;
            topbar.setTitle(`ECIDE - ${node.path}`);
            
        } catch (err) {
            new window.ECToast(`Failed to open file: ${err.message}`, { type: 'error' }).show();
        }
    }
});