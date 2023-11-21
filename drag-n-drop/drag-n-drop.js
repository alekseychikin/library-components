import Component from '../component.js'

function easeInOut(progress) {
	return 0.5 * (1 - Math.cos(Math.PI * progress))
}

export default class DragNDrop extends Component {
	static get selector() {
		return '[data-component="drag-n-drop"]'
	}

	constructor(node) {
		super(node)

		this.pointerDown = this.pointerDown.bind(this)
		this.pointerMove = this.pointerMove.bind(this)
		this.pointerUp = this.pointerUp.bind(this)
		this.containerSelector = node.getAttribute('data-container')
		this.elementSelector = node.getAttribute('data-element')

		if (!this.containerSelector) {
			console.error('Container selector should be provided')
			return
		}

		if (!this.elementSelector) {
			console.error('Element selector should be provided')
			return
		}

		this.container = document.querySelector(this.containerSelector)
		this.elements = Array.from(this.node.querySelectorAll(this.elementSelector))
		this.target = null
		this.clone = null
		this.draging = false
		this.clientX = 0
		this.clientY = 0
		this.translateX = 0
		this.translateY = 0
		this.coords = []
		this.originIndex = -1
		this.originNext = null
		this.index = -1
		this.next = null
		this.animateId = null
		this.initCoord = {
			left: 0,
			top: 0,
			height: 0
		}

		this.node.addEventListener('pointerdown', this.pointerDown, true)

		this.observer = new MutationObserver(() => {
			this.container = document.querySelector(this.containerSelector)
			this.elements = Array.from(this.node.querySelectorAll(this.elementSelector))
		})
		this.observeConfig = {
			attributes: false,
			childList: true,
			subtree: true,
			characterData: false
		}
		this.observer.observe(this.node, this.observeConfig)
	}

	pointerDown(event) {
		if (!event.target.matches(this.elementSelector)) {
			return
		}

		document.body.style.userSelect = 'none'
		this.observer.disconnect()
		this.target = event.target
		this.next = this.target.nextSibling
		this.index = this.elements.indexOf(this.target)
		this.originIndex = this.index
		this.originNext = this.target.nextSibling
		this.draging = true
		this.clientX = event.clientX
		this.clientY = event.clientY
		this.clone = event.target.cloneNode(true)
		this.clone.style.position = 'absolute'
		this.clone.style.left = '0'
		this.clone.style.top = '0'
		this.clone.style.zIndex = '9999'
		this.clone.style.opacity = '0.5'
		this.target.style.opacity = '0'
		this.elements[0].offsetParent.appendChild(this.clone)
		this.presaveCoords()
		this.clone.style.transform = `translate(${this.initCoord.left}px, ${this.initCoord.top}px)`
		this.clone.style.cursor = 'grabbing'
		this.clone.setPointerCapture(event.pointerId)
		this.clone.addEventListener('pointermove', this.pointerMove)
		this.clone.addEventListener('pointerup', this.pointerUp)
		this.clone.addEventListener('lostpointercapture', this.pointerUp)
	}

	pointerMove(event) {
		let collisionWith

		if (this.draging) {
			const left = this.initCoord.left + (event.clientX - this.clientX)
			const top = this.initCoord.top + (event.clientY - this.clientY)

			this.clone.style.transform = `translate(${left}px, ${top}px)`

			if ((collisionWith = this.checkCollision(left, top, this.initCoord.height)) !== false) {
				this.switchPlace(collisionWith)
			}
		}
	}

	pointerUp() {
		if (this.draging) {
			if (this.originIndex !== this.index) {
				if (this.originNext) {
					this.elements[this.originIndex].parentNode.insertBefore(this.target, this.originNext)
				} else {
					this.elements[this.originIndex].parentNode.appendChild(this.target)
				}

				this.node.dispatchEvent(new CustomEvent('change', { detail: {
					origin: this.originIndex,
					target: this.index
				}}))
			}

			this.index = -1
			this.draging = false
			this.clone.removeEventListener('pointermove', this.pointerMove)
			this.clone.removeEventListener('pointerup', this.pointerUp)
			this.clone.removeEventListener('lostpointercapture', this.pointerUp)
			this.clone.parentNode.removeChild(this.clone)
			this.target.style.opacity = ''
			this.container.style.height = ''
			window.cancelAnimationFrame(this.animateId)
			document.body.style.userSelect = ''

			for (let i = 0, element = this.elements[i]; i < this.elements.length; i++, element = this.elements[i]) {
				element.style.position = ''
				element.style.transform = ''
				element.style.left = ''
				element.style.top = ''
			}

			this.observer.observe(this.node, this.observeConfig)
		}
	}

	presaveCoords() {
		const closestParent = this.elements[0].offsetParent
		const parentBoundings = closestParent.getBoundingClientRect()
		const coords = this.coords.splice(0, this.coords.length)

		this.container.style.height = this.container.offsetHeight + 'px'

		for (let i = this.elements.length - 1, element = this.elements[i]; i >= 0; i--, element = this.elements[i]) {
			const elementStyles = getComputedStyle(element)
			const marginLeft = parseInt(elementStyles.marginLeft)
			const marginTop = parseInt(elementStyles.marginTop)
			const elementBoundings = element.getBoundingClientRect()
			const coord = {
				left: elementBoundings.left - parentBoundings.left - marginLeft,
				top: elementBoundings.top - parentBoundings.top - marginTop,
				height: elementBoundings.height
			}

			this.coords.unshift(coord)

			if (i === this.index) {
				this.initCoord.left = coord.left
				this.initCoord.top = coord.top
				this.initCoord.height = coord.height
			}
		}

		for (let i = this.elements.length - 1, element = this.elements[i], coord = this.coords[i]; i >= 0; i--, element = this.elements[i], coord = this.coords[i]) {
			element.style.left = '0'
			element.style.top = '0'
			element.style.position = 'absolute'
		}

		this.animateTransition(coords, this.coords)
	}

	switchPlace(index) {
		const next = index > this.index ? this.elements[index].nextSibling : this.elements[index]
		const initCoolrdLeft = this.initCoord.left
		const initCoolrdTop = this.initCoord.top

		if (next) {
			this.elements[index].parentNode.insertBefore(this.target, next)
		} else {
			this.elements[index].parentNode.appendChild(this.target)
		}

		this.elements.splice(this.index, 1)
		this.elements.splice(index, 0, this.target)
		this.coords.splice(this.index, 1)
		this.coords.splice(index, 0, this.target)
		this.index = index

		for (let i = this.elements.length - 1, element = this.elements[i]; i >= 0; i--, element = this.elements[i]) {
			element.style.position = ''
			element.style.transform = ''
		}

		this.presaveCoords()
		this.clientX += (this.initCoord.left - initCoolrdLeft)
		this.clientY += (this.initCoord.top - initCoolrdTop)
	}

	checkCollision(left, top, height) {
		let minDistance = Infinity
		let minBoundary = height
		let index = -1

		for (let i = 0; i < this.coords.length; i++) {
			if (i === this.index) continue

			const distance = Math.sqrt(
				Math.pow(left - this.coords[i].left, 2) +
				Math.pow(top + height / 2 - this.coords[i].top - this.coords[i].height / 2, 2)
			)

			if (distance < minDistance) {
				minDistance = distance
				index = i
			}

			if (this.coords[i].height < minBoundary) {
				minBoundary = this.coords[i].height
			}
		}

		if (minDistance < minBoundary / 2) {
			return index
		}

		return false
	}

	animateTransition(from, to) {
		if (!from.length) {
			for (let i = 0; i < to.length; i++) {
				this.elements[i].style.transform = `translate(${to[i].left}px, ${to[i].top}px)`
			}
		} else {
			const duration = 150
			let startTime
			let tick = (time) => {
				if (!startTime) {
					startTime = time
				}

				const progress = (time - startTime) / duration
				const easiedProgress = easeInOut(progress)

				for (let i = 0; i < to.length; i++) {
					this.elements[i].style.transform = `translate(
						${from[i].left + easiedProgress * (to[i].left - from[i].left)}px,
						${from[i].top + easiedProgress * (to[i].top - from[i].top)}px
					)`
				}

				if (progress < 1) {
					this.animateId = window.requestAnimationFrame(tick)
				} else {
					for (let i = 0; i < to.length; i++) {
						this.elements[i].style.transform = `translate(${to[i].left}px, ${to[i].top}px)`
					}
				}
			}

			this.animateId = window.requestAnimationFrame(tick)
		}
	}

	destroy() {
		this.node.removeEventListener('pointerdown', this.pointerDown, true)
		this.observer.disconnect()
	}
}
