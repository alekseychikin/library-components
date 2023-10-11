import Component from '../component.js'

export default class Shaker extends Component {
	static get selector() {
		return '[data-component="shaker"]'
	}

	constructor(node) {
		super(node)

		this.shake = this.shake.bind(this)
		this.animationend = this.animationend.bind(this)

		node.addEventListener('shake', this.shake)
		node.addEventListener('animationend', this.animationend)
	}

	shake(event) {
		event.stopPropagation()
		this.node.classList.add('shake')
	}

	animationend() {
		this.node.classList.remove('shake')
	}

	destroy() {
		this.node.removeEventListener('shake', this.shake)
		this.node.removeEventListener('animationend', this.animationend)
	}
}
