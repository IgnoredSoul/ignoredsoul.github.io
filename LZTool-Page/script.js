const editor = document.getElementById('jsonEditor');
const status = document.getElementById('status');

async function importFromClipboard() {
    try {
        const clipboardText = await navigator.clipboard.readText();
        const decompressed = LZString.decompressFromBase64(clipboardText);

        if (!decompressed) throw new Error("Could not decompress input");

        const json = JSON.parse(decompressed);
        editor.value = JSON.stringify(json, null, 2);  // pretty print with indents
        status.textContent = "✅ JSON loaded from clipboard.";
    } catch (error) {
        console.error(error);
        status.textContent = "❌ Failed to decode LZString from clipboard.";
    }
}

async function importFromFile() {
    const fileInput = document.getElementById('fileInput');
    fileInput.onchange = async function () {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const compressed = e.target.result.trim();
                const decompressed = LZString.decompressFromBase64(compressed);
                if (!decompressed) throw new Error("Invalid or corrupt LZString data.");

                const json = JSON.parse(decompressed);
                editor.value = JSON.stringify(json, null, 2);
                status.textContent = "✅ JSON loaded from file.";
            } catch (err) {
                console.error(err);
                status.textContent = "❌ Failed to import from file.";
            }
        };
        reader.readAsText(file);
    };
    fileInput.click(); // trigger the hidden input
}

async function exportToFile() {
    try {
        const parsed = JSON.parse(editor.value);
        const minified = JSON.stringify(parsed);
        const compressed = LZString.compressToBase64(minified);

        const blob = new Blob([compressed], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = "compressed.txt"; // or .txt/.json
        a.click();

        URL.revokeObjectURL(url);
        status.textContent = "✅ File exported successfully.";
    } catch (err) {
        console.error(err);
        status.textContent = "❌ Invalid JSON. Could not export.";
    }
}


async function saveToClipboard() {
    try {
        const parsed = JSON.parse(editor.value);
        const minified = JSON.stringify(parsed);
        const compressed = LZString.compressToBase64(minified);

        await navigator.clipboard.writeText(compressed);
        status.textContent = "✅ LZString saved to clipboard.";
    } catch (error) {
        console.error(error);
        status.textContent = "❌ Invalid JSON. Could not encode.";
    }
}