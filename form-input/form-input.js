import Component from '../component.js'

export default class FormInput extends Component {
	static get selector() {
		return '[data-component="form-input"]'
	}

	get events() {
		return {
			'focus input: input': () => {
				this.setParameter('opened', true)
			},
			'keydown: input': (event) => {
				const suggestions = this.getParameter('suggestions', [])
				let selected = Number(this.getParameter('selected', -1))

				switch (event.key) {
					case 'Escape':
						this.setParameter('opened', false)

						break
					case 'Enter':
						if (selected !== -1) {
							event.preventDefault()
							this.emitSuggestion(selected)
						}

						break
					case 'ArrowUp':
						selected = selected < 1 ? suggestions.length - 1 : selected - 1
						event.preventDefault()

						break
					case 'ArrowDown':
						selected = selected > suggestions.length - 2 ? 0 : selected + 1
						event.preventDefault()

						break
				}

				this.setParameters({ selected })
			},
			'click: @form-input-suggestion': ({ target }) => {
				this.emitSuggestion(target.dataset.value)
			},
			'mouseover: @form-input-suggestion': () => {
				this.setParameter('selected', -1)
			}
		}
	}

	emitSuggestion(suggestion) {
		this.node.querySelector('input').dispatchEvent(new CustomEvent('select-suggestion', {
			detail: {
				value: suggestion
			}
		}))
		this.setParameter('opened', false)
	}

	constructor(node) {
		super(node)

		this.clickHandler = this.clickHandler.bind(this)
		this.selected = this.getParameter('selected', -1)

		document.addEventListener('click', this.clickHandler)
	}

	clickHandler(event) {
		if (!this.node.contains(event.target)) {
			this.setParameter('opened', false)
		}
	}

	destroy() {
		document.removeEventListener('click', this.clickHandler)
	}
}
