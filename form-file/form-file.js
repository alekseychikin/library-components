import Component from '../component.js'

export default class FormFile extends Component {
	static get selector() {
		return '[data-component="form-file"]'
	}

	get events() {
		return {
			'change: input': this.onFileChange,
			'keydown: self': (event) => {
				if (event.keyCode === 32 || event.keyCode === 13) {
					const input = this.node.querySelector('input')

					if (input.value) {
						input.value = ''
						this.emitEvent('file-clear')
					} else {
						this.node.click()
					}
				}
			},
			'click: @remove': (event) => {
				event.preventDefault()

				const input = this.node.querySelector('input')

				if (input.value) {
					input.value = ''
					this.emitEvent('file-clear')
				} else {
					this.node.click()
				}
			}
		}
	}

	onFileChange(event) {
		const { files } = event.target

		if (files.length) {
			this.emitEvent('file-change', files)
		}
	}

	constructor(node) {
		super(node)
	}
}
