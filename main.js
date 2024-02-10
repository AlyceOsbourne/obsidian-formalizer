const obsidian = require('obsidian');

class Formalizer extends obsidian.Plugin {
    async onload() {
        this.registerEvent(this.app.workspace.on('editor-menu', (menu, editor) => {
            menu.addItem((item) => {
                item.setTitle('Formalize Document')
                    .setIcon('feather')
                    .onClick(() => {
                        new FormalizerModal(this.app, editor, false).open();
                    });
            });

            const selectedText = editor.getSelection();
            if (selectedText) {
                menu.addItem((item) => {
                    item.setTitle('Formalize Highlight')
                        .setIcon('highlight')
                        .onClick(() => {
                            new FormalizerModal(this.app, editor, true).open();
                        });
                });
            }
        }));
    }
}

class FormalizerModal extends obsidian.Modal {
    constructor(app, editor, isHighlight) {
        super(app);
        this.editor = editor;
        this.isHighlight = isHighlight;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.setText('Choose formalization option:');

        const selectEl = contentEl.createEl('select');
        const options = ['Professional', 'Polite', 'Snarky', 'Readable', 'Formal', 'Informal', 'Sociable', 'Concise', 'Calm', 'Passionate', 'Sarcastic', 'Grammatical', 'Bullets', 'Thesaurus']; // Example options
        options.forEach(opt => {
            const optionEl = selectEl.createEl('option');
            optionEl.value = opt.toUpperCase();
            optionEl.text = opt;
        });

	const spicinessLabel = contentEl.createEl('label');
    	spicinessLabel.textContent = 'Spiciness Level: ';
    	const spicinessSelect = contentEl.createEl('select', { attr: { id: 'spiciness-level' } });
    	const spicinessLevels = [1, 2, 3, 4, 5]; // Example spiciness levels
    	spicinessLevels.forEach(level => {
        	const levelOption = spicinessSelect.createEl('option');
        	levelOption.value = level;
        	levelOption.text = level;
    	});

        const applyBtn = contentEl.createEl('button', { text: 'Apply' });
        applyBtn.onclick = () => {
            const selectedOption = selectEl.value;
            this.applyFormalization(selectedOption);
        };
    }

    applyFormalization(option) {
        let text = this.isHighlight ? this.editor.getSelection() : this.editor.getValue();
	const metadataPattern = /^---[\s\S]+?---\n/;
    	text = text.replace(metadataPattern, '');
        
    	const spicinessSelect = this.contentEl.querySelector('#spiciness-level');
    	const spiciness = spicinessSelect.value;

    	// Define the URL and headers for the API request
    	const url = "https://goblin.tools/api/Formalizer";
    	const headers = {
        	"Accept": "*/*",
        	"Content-Type": "application/json",
    	};


    	const data = {
      	 	"Text": text,
        	"Conversion": option,
        	"Spiciness": parseInt(spiciness, 10) // Ensure spiciness is an integer
    	};

        // Make the API request
        fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status_code} ${response.statusText}`);
            }
            return response.text();
        })
        .then(formalizedText => {
            // Use the formalized text in the editor
            if (this.isHighlight) {
                this.editor.replaceSelection(formalizedText);
            } else {
                this.editor.setValue(formalizedText);
            }
            this.close();
        })
        .catch(error => {
            console.error('Error during text formalization:', error);
        });
    }
}


class FormalizerSettings extends obsidian.PluginSettingTab {
    // Plugin settings can be implemented here if needed
}

module.exports = Formalizer;
