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

    const model = {
        message: '',
        files: {},
    };

    function updateCmd() {
        const cmdEl = document.getElementById('cmd');
        const cmd = 'svn commit ' + Object.keys(model.files).filter(f => model.files[f].checked).join(' ') + ' -m \'' + model.message + '\'';
        cmdEl.textContent = cmd;
    }

    const messageTextarea = document.getElementById('message_textarea');
    messageTextarea.addEventListener('input', () => {
        model.message = messageTextarea.value;
        updateCmd();
    });
    const diffOut = document.getElementById('diff');
    document.getElementById('update_status_button').addEventListener('click', () => {
        ipc.send('status-request', {cwd: cwdInput.value});
    });
    document.getElementById('clear_message_button').addEventListener('click', () => {
        messageTextarea.value = '';
        model.message = '';
        updateCmd();
    });
    cwdInput.addEventListener('input', () => {
        localStorage.setItem('cwd', cwdInput.value);
    });
    ipc.on('status-response', (e, arg) => {
        const files = arg.stdout.trim().split('\n').map(line => line.split(' ')).map(line => line[line.length - 1]);
        model.files = files.map(f => {
            return {[f]: (model.files[f] ? model.files[f] : {checked: false})}
        }).reduce((result, v) => {
            return Object.assign(result, v);
        }, {});
        const statusNode = document.querySelector('#status');
        const text = Object.keys(model.files).map(f => `<li><input type="checkbox"${model.files[f].checked ? ' checked' : ''}><a href="#${f}">${f}</a></li>`).join('');
        statusNode.innerHTML = text;
        [...statusNode.querySelectorAll('li input[type="checkbox"]')].forEach(el => {
            el.addEventListener('change', e => {
                const checkbox = e.target;
                model.files[checkbox.nextElementSibling.textContent].checked = checkbox.checked;
                updateCmd();
            });
        });
        [...statusNode.querySelectorAll('li a')].forEach(el => {
            el.addEventListener('click', e => {
                e.preventDefault();
                diffOut.textContent = 'checking diff...';
                ipc.send('diff-request', {cwd: cwdInput.value, file: e.target.textContent});
            });
        });
        updateCmd();
    });
    ipc.on('diff-response', (e, arg) => {
        diffOut.textContent = arg.stdout;
    });
});

