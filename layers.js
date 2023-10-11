const layers = []

document.addEventListener('keydown', (event) => {
	if (event.code === 'Escape' && layers.length) {
		layers[layers.length - 1].dispatchEvent(new CustomEvent('close', {
			bubbles: true
		}))
	}
})

export function push(element) {
	layers.push(element)

	return () => pop(element)
}

export function pop(element) {
	let index

	if ((index = layers.indexOf(element)) !== -1) {
		layers.splice(index, 1)
	}
}
