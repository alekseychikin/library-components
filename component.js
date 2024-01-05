export default class Component {
	constructor(node) {
		this.node = node
		this.bindedEvents = {}
		this.eventHandler = this.eventHandler.bind(this)
		this.bindEvents()
	}

	bindEvents = () => {
		for (const key in this.events) {
			const match = key.split(':')
			const events = match[0].trim().split(' ')

			events.forEach((event) => {
				if (!this.bindedEvents[event]) {
					this.bindedEvents[event] = {}
					this.node.addEventListener(event, this.eventHandler, true)
				}

				if (match.length > 1) {
					const selector = match[1].trim()

					if (!this.bindedEvents[event][selector]) {
						this.bindedEvents[event][selector] = []
					}

					this.bindedEvents[event][selector].push(this.events[key])
				} else {
					if (!this.bindedEvents[event].self) {
						this.bindedEvents[event].self = []
					}

					this.bindedEvents[event].self.push(this.events[key])
				}
			})
		}
	}

	eventHandler(e) {
		if (this.bindedEvents[e.type]) {
			for (const selector in this.bindedEvents[e.type]) {
				const formatedSelector = selector.replace(/@([a-zA-Z][a-zA-Z0-9_-]*)/g, '[data-role="$1"]')

				if (selector === 'self') {
					if (e.target === this.node) {
						this.bindedEvents[e.type].self.forEach(handler => handler.call(this, e))
					}
				} else {
					if (e.target.matches(formatedSelector)) {
						this.bindedEvents[e.type][selector].forEach(handler => handler.call(this, e))
					}
				}
			}
		}
	}

	setParameter(value) {
		this.emitEvent('set-parameter', value)
	}

	emitEvent(eventName, detail = null) {
		this.node.dispatchEvent(new CustomEvent(eventName, {
			detail
		}))
	}

	destroy() {
		for (const key in this.events) {
			const match = key.split(':')
			const events = match[0].trim().split(' ')

			events.forEach((event) => this.node.removeEventListener(event, this.eventHandler, true))
		}
	}
}
