import Component from '../component.js'

export default class Sheet extends Component {
	static get selector() {
		return '[data-component="sheet"]'
	}

	get events() {
		return {
			'click: self': this.close
		}
	}

	toggle() {
		const opened = this.getParameter('opened', false)

		this.setParameter('opened', !opened)
	}

	close() {
		this.setParameter('opened', false)
	}
}
