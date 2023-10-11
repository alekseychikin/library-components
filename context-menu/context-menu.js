import Component from '../component.js'
import { push } from '../layers.js'

export default class ContextMenu extends Component {
	static get selector() {
		return '[data-component="context-menu"]'
	}

	get events() {
		return {
			'toggle: self': this.toggle,
			'close: self': this.close,
			'click: [data-action]': this.callAction
		}
	}

	constructor(node) {
		super(node)

		this.clickOutSide = this.clickOutSide.bind(this)
		this.isOpen = false
		this.popMenu = null
	}

	toggle() {
		if (this.isOpen) {
			this.close()
		} else {
			this.isOpen = true
			this.popMenu = push(this.node)
			this.node.classList.add('context-menu--open')

			setTimeout(() => {
				document.body.addEventListener('click', this.clickOutSide)
			}, 100)
		}
	}

	close() {
		this.popMenu()
		this.isOpen = false
		this.node.classList.remove('context-menu--open')
		document.body.removeEventListener('click', this.clickOutSide)
	}

	clickOutSide(event) {
		const { target } = event

		if (!this.node.contains(target)) {
			this.close()
		}
	}

	callAction(event) {
		const { action } = event.target.closest('[data-action]').dataset

		this.close()
		this.emitEvent(action)
	}

	destroy() {
		super.destroy()

		document.body.removeEventListener('click', this.clickOutSide)
	}
}
