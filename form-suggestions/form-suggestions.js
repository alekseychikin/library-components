import Component from '../component.js'

export default class FormSuggestions extends Component {
	static get selector() {
		return '[data-component="form-suggestions"]'
	}

	get events() {
		return {
			'click: @form-suggestion-button': ({ target }) => {
				this.emitEvent('select', target.dataset.value || '0')
			}
		}
	}
}
