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

	close() {
		this.emitEvent('close-sheet')
	}
}
