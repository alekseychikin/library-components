import Component from '../component.js'
import { push } from '../layers.js'

export default class ModalDialog extends Component {
	static get selector() {
		return '[data-component="modal-dialog"]'
	}

	get events() {
		return {
			'click: @cancel': this.close
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
			this.node.classList.add('modal-dialog--open')

			setTimeout(() => {
				document.body.addEventListener('click', this.clickOutSide)
			}, 100)
		}
	}

	close() {
		this.popMenu()
		this.isOpen = false
		this.node.classList.remove('modal-dialog--open')
		document.body.removeEventListener('click', this.clickOutSide)
	}

	clickOutSide(event) {
		const { target } = event

		if (!this.node.contains(target)) {
			this.close()
		}
	}

	destroy() {
		super.destroy()

		document.body.removeEventListener('click', this.clickOutSide)
	}
}
