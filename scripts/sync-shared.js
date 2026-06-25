/**
 * Копирует shared/ в static/dashboard/src/shared — CRA не импортирует файлы вне src/.
 * Источник правды: kit_teamlead/shared/
 */
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'shared');
const target = path.join(__dirname, '..', 'static', 'dashboard', 'src', 'shared');

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
}

copyDir(source, target);
console.log('Synced shared -> static/dashboard/src/shared');
