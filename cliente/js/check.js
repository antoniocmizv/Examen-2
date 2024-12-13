export class Check {
    constructor(parent, client) {
        this.parent = parent;
        this.client = client;
        this.states = [];
        this.loadInitialState();
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