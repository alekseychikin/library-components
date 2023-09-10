import Component from '../component.js'

export default class Scroller extends Component {
	static get selector() {
		return '[data-component="scroller"]'
	}

	constructor(node) {
		super(node)

		this.update = this.update.bind(this)
		this.scroll = this.scroll.bind(this)
		this.pointerDown = this.pointerDown.bind(this)
		this.pointerMove = this.pointerMove.bind(this)
		this.pointerEnd = this.pointerEnd.bind(this)
		this.click = this.click.bind(this)

		this.scrollbar = node.querySelector('.scroller__scrollbar')
		this.thumb = node.querySelector('.scroller__thumb')
		this.scrollable = node.querySelector('.scroller__scrollable')
		this.content = node.querySelector('.scroller__content')
		this.ratio = 1
		this.moving = false
		this.start = 0
		this.current = null

		this.update()
		this.scrollable.addEventListener('scroll', this.scroll)
		window.addEventListener('resize', this.update)

		this.observer = new MutationObserver(this.update)
		this.observer.observe(this.content, {
			childList: true,
			subtree: true
		})

		this.thumb.addEventListener('pointerdown', this.pointerDown)
		this.thumb.addEventListener('pointermove', this.pointerMove)
		this.thumb.addEventListener('pointerup', this.pointerEnd)
		this.thumb.addEventListener('lostpointercapture', this.pointerEnd)
		this.scrollbar.addEventListener('click', this.click)
	}

	update() {
		const contentRatio = this.scrollable.offsetHeight / this.content.offsetHeight

		if (contentRatio >= 1) {
			this.scrollbar.classList.add('hide')
		} else {
			this.scrollbar.classList.remove('hide')
		}
		const height = Math.max(this.scrollbar.offsetHeight * contentRatio, 50)

		this.ratio = (this.scrollbar.offsetHeight - height) / (this.content.offsetHeight - this.scrollable.offsetHeight)
		this.thumb.style.height = `${height}px`

		this.scroll()
	}

	scroll() {
		const scrollTop = this.scrollable.scrollTop

		this.thumb.style.top = `${scrollTop * this.ratio}px`
	}

	pointerDown(event) {
		this.start = event.clientY
		this.current = this.scrollable.scrollTop
		this.moving = true
		this.thumb.setPointerCapture(event.pointerId)
		document.body.style.webkitUserSelect = 'none'
		document.body.style.mozUserSelect = 'none'
		document.body.style.userSelect = 'none'
	}

	pointerMove(event) {
		if (this.moving) {
			const delta = event.clientY - this.start

			this.scrollable.scrollTop = this.current + delta / this.ratio
		}
	}

	pointerEnd() {
		this.moving = false
		document.body.style.webkitUserSelect = ''
		document.body.style.mozUserSelect = ''
		document.body.style.userSelect = ''
	}

	click(event) {
		if (event.target === this.scrollbar) {
			this.scrollable.scrollTop = event.offsetY / this.ratio
		}
	}
}
