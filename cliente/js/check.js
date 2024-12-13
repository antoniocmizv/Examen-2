export class Check {
    constructor(parent, client) {
        this.parent = parent;
        this.client = client;
        this.states = [];
        this.useSocket = false;
        this.socket = null;
        this.loadInitialState();
        this.setupSocket();
    }

    setupSocket() {
        this.socket = io('http://localhost:3000');
    
        // Escuchar el estado inicial
        this.socket.on('initial-state', (data) => {
            console.log('Estado inicial recibido:', data);
            this.updateUIFromData(data);
        });
    
        // Escuchar actualizaciones en tiempo real
        this.socket.on('state-updated', (data) => {
            console.log('Actualización recibida:', data);
            // Actualizar UI independientemente del modo de conexión
            // Solo evitamos actualizar si somos el emisor del cambio
            if (data.socketId !== this.socket.id) {
                this.updateUIFromData([data.item]);
                // Actualizar también el estado local
                const stateItem = this.states.find(item => item.name === data.item.name);
                if (stateItem) {
                    stateItem.state = data.item.state;
                }
            }
        });
    }

    toggleConnection() {

        this.useSocket = !this.useSocket;
        console.log(`Usando ${this.useSocket ? 'Socket.IO' : 'REST'}`);
    }

    changeValue(name, value) {
        const data = this.states.find((item) => item.name == name);
        data.state = value;
    
        if (this.useSocket) {
            // Enviar el ID del socket junto con los datos
            this.socket.emit('update-state', {
                socketId: this.socket.id,
                item: data
            });
        } else {
            this.client.send(data);
        }
    
        // Actualizar UI inmediatamente
        this.updateUI(name, value);
    }

    updateUI(name, value) {
        const label = this.parent.querySelector(`label:has(input[name="${name}"])`);
        const span = label?.querySelector('span');
        if (span) {
            span.textContent = value ? 'ON' : 'OFF';
        }
        // Actualizar también el checkbox
        const input = this.parent.querySelector(`input[name="${name}"]`);
        if (input) {
            input.checked = value;
        }
    }

    updateUIFromData(items) {
        items.forEach(item => {
            const input = this.parent.querySelector(`input[name="${item.name}"]`);
            if (input) {
                input.checked = item.state;
                this.updateUI(item.name, item.state);
            }
        });
    }

    async loadInitialState() {
        try {
            const response = await fetch('http://localhost:3000/api/items');
            const items = await response.json();
            items.forEach(item => {
                // Solo procesar los items que pertenecen a este grupo
                const input = this.parent.querySelector(`input[name="${item.name}"]`);
                if (input) {
                    // Actualizar el state local
                    const stateObj = {
                        name: item.name,
                        state: item.state
                    };
                    this.states.push(stateObj);

                    // Actualizar UI
                    input.checked = item.state;
                    const span = input.parentElement.querySelector('span');
                    if (span) {
                        span.textContent = item.state ? 'ON' : 'OFF';
                    }
                }
            });
        } catch (error) {
            console.error('Error al cargar estados:', error);
        }
    }

    changeValue(name, value) {
        const data = this.states.find((item) => item.name == name);
        data.state = value;

        // Enviar al servidor
        this.client.send(data);

        // Actualizar el texto del span
        const label = this.parent.querySelector(`label:has(input[name="${name}"])`);
        const span = label?.querySelector('span');
        if (span) {
            span.textContent = value ? 'ON' : 'OFF';
        }
    }

    addCheck(name) {
        this.states.push({
            name: name,
            state: false
        })
        const check = document.createElement("label");
        check.classList.add("form-switch");
        this.parent.appendChild(check);
        const input = document.createElement("input");
        input.setAttribute('type', 'checkbox');
        input.setAttribute('name', name); // Para identificar el checkbox con el nombre del ítem
        check.appendChild(input);
        check.appendChild(document.createElement("i"));
        const span = document.createElement('span');
        const text = document.createTextNode('OFF');
        span.appendChild(text);
        check.appendChild(span);
        input.addEventListener('change', (event) => {
            this.changeValue(name, event.target.checked);
        })
    }
}