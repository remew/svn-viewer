'use strict';

window.addEventListener('DOMContentLoaded', () => {
    class ResizablePanel {
        constructor(container) {
            const start = container.getElementsByClassName('panel-start')[0];
            const splitter = container.getElementsByClassName('panel-splitter')[0];
            const end = container.getElementsByClassName('panel-end')[0];
            this._moving = false;
            splitter.addEventListener('mousedown', () => {
                this._moving = true;
            });
            window.addEventListener('mouseup', () => {
                this._moving = false;
            });
            container.addEventListener('mousemove', e => {
                if (this._moving) {
                    if (container.classList.contains('col')) {
                        start.style.flexGrow = e.y / container.clientHeight * 2;
                        end.style.flexGrow = (1 - e.y / container.clientHeight) * 2;
                    } else {
                        start.style.flexGrow = e.x / container.clientWidth * 2;
                        end.style.flexGrow = (1 - e.x / container.clientWidth) * 2;
                    }
                }
            });
        }
    }
    const panelContainers = [...document.getElementsByClassName('panel-container')].map(c => new ResizablePanel(c));

    const ipc = require('electron').ipcRenderer;
    const cwdInput = document.getElementById('cwd');
    cwdInput.value = localStorage.getItem('cwd');

    const diffOut = document.getElementById('diff');
    document.getElementById('btn').addEventListener('click', () => {
        console.log(cwdInput.value);
        ipc.send('status-request', {cwd: cwdInput.value});
    });
    cwdInput.addEventListener('input', () => {
        localStorage.setItem('cwd', cwdInput.value);
    });
    ipc.on('status-response', (e, arg) => {
        console.log(e);
        console.log(arg);
        const text = arg.stdout.trim().split('\n').map(line => line.split(' ')).map(line => `<li><input type="checkbox"><a href="#${line[line.length - 1]}">${line[line.length - 1]}</a></li>`).join('');
        const statusNode = document.querySelector('#status');
        statusNode.innerHTML = text;
        [...statusNode.querySelectorAll('li input[type="checkbox"]')].forEach(el => {
            el.addEventListener('change', updateCmd);
        });
        [...statusNode.querySelectorAll('li a')].forEach(el => {
            el.addEventListener('click', e => {
                e.preventDefault();
                diffOut.textContent = 'checking diff...';
                ipc.send('diff-request', {cwd: cwdInput.value, file: e.target.textContent});
            });
        });

        function updateCmd() {
            document.getElementById('cmd').textContent = 'svn commit ' + [...statusNode.querySelectorAll('li')].filter(el => el.children[0].checked).map(el => el.children[1].textContent).join(' ') + ' -m ';
        }
    });
    ipc.on('diff-response', (e, arg) => {
        diffOut.textContent = arg.stdout;
    });

});

