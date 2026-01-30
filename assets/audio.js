const pre = 3.478
/** @type {HTMLDivElement} */
const toast = document.createElement('div')
toast.classList.add('toast')

/** @type {HTMLParagraphElement | null} */
let prevTarget = document.createElement('p')

/** @type {HTMLDivElement | null} */
let prevParent = document.createElement('div')

const issueAlert = (id, text, success) => {
	/** @type {HTMLDivElement} */
	const alertDiv = document.createElement('div')
	/** @type {HTMLSpanElement} */
	const span = document.createElement('span')

	span.textContent = text

	alertDiv.append(span)
	alertDiv.classList.add('alert')
	if (success) {
		alertDiv.classList.add('alert-success')
	} else {
		alertDiv.classList.add('alert-info')
	}
	alertDiv.id = id

	toast.append(alertDiv)

	return alertDiv
};

//audio functionality
document.addEventListener("keydown", (/** @type {KeyboardEvent} */ e) => {
	switch (e.code) {
		case "Space":
			e.preventDefault()
			if (e.repeat) { return }
			play()
		case "j":
			e.preventDefault()
		//go to the next lyrics line
	}
});

document.addEventListener("DOMContentLoaded", () => {

	/** @type {HTMLAudioElement} */
	const audio = document.getElementById("audio")

	/** @type {HTMLDivElement} */
	const playButton = document.getElementById("play-btn")
	/** @type {HTMLProgressElement} */
	const progressBar = document.getElementById("progress-bar")
	/** @type {HTMLProgressElement} */
	const loadingBar = document.getElementById("loading-bar")

	audio.addEventListener("progress", () => {
		console.log(audio.buffered)
		if (audio.duration > 0) {

			for (let i = 0; i < audio.buffered.length; i++) {
				if (audio.buffered.start(audio.buffered.length - 1 - i) < audio.currentTime) {
					const bufferedEnd = audio.buffered.end(audio.buffered.length - 1 - i);
					const duration = audio.duration;
        
					// Calculate and apply the percentage
					const bufferedPercent = (bufferedEnd / duration) * 100;

					loadingBar.value = bufferedPercent;

					break;
				}

			
			}
		}
	});


	audio.addEventListener("timeupdate", () => {
		updateCurrentTimeTimer()
		findAndScrollTo(audio.currentTime)
		progressBar.value = (audio.currentTime * 100) / audio.duration
	});

	audio.addEventListener("loadstart", () => {
		const alert = issueAlert("loadstart", "loading audio file")
		setTimeout(() => { alert.remove() }, 1500)
		console.log("loadstart")
	});

	audio.addEventListener("loadeddata", () => { 
		/** @type {HTMLDivElement} | Null */
		const alert = issueAlert("loadeddata", "audio file loaded", true)
		setTimeout(() => { alert.remove() }, 1500)
		console.log("loadfinished")
	});

	audio.addEventListener("loadedmetadata", () => {
		updateDurationTimer()
		updateCurrentTimeTimer()
	});

	audio.addEventListener("play", () => {
		/** @type {HTMLSpanElement} */
		const playIcon = playButton.querySelector('#play-icon')
		const stopIcon = playButton.querySelector('#stop-icon')

		playIcon.hidden = true
		stopIcon.hidden = false

		playButton.classList.add('bg-success', 'animate-pulse')

	});
	audio.addEventListener("pause", () => {
		const playIcon = playButton.querySelector('#play-icon')
		const stopIcon = playButton.querySelector('#stop-icon')

		playIcon.hidden = false
		stopIcon.hidden = true
		playButton.classList.remove('bg-success', 'animate-pulse')

	})
	const updateDurationTimer = () => {

		const durationMin = document.getElementById("meta-duration-min")
		const durationSec = document.getElementById("meta-duration-sec")

		if (!audio || !durationMin || !durationSec) { return }

		const durMinsValue = Math.floor(audio.duration / 60);
		const durSecsValue = Math.floor(audio.duration % 60);

		durationMin.style.setProperty('--value', durMinsValue)
		durationSec.style.setProperty('--value', durSecsValue)

	}

	const updateCurrentTimeTimer = () => {

		const min = document.getElementById("meta-min")
		const sec = document.getElementById("meta-sec")

		if (!audio || !min || !sec) { return }


		const curMinsValue = Math.floor(audio.currentTime / 60);
		const curSecsValue = Math.floor(audio.currentTime % 60);

		min.style.setProperty('--value', curMinsValue)
		sec.style.setProperty('--value', curSecsValue)
	};

	const formatAudioTime = (seconds) => {

		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
    
		const displayMins = String(mins).padStart(2, '0');
		const displaySecs = String(secs).padStart(2, '0');
    
		return `${displayMins}:${displaySecs}`;
	};

	const play = () => {
		if (audio.paused) {
			//should use toast instead of console.warn
			audio.play().catch(e => console.warn("Playback blocked: User must interact first."))
		} else {
			audio.pause()
		}
	}



	playButton.addEventListener('click', () => { play() });

	let sections = document.querySelectorAll('a[data-start]');
	let paragraphs = document.querySelectorAll('p[data-start]');
	let cards = document.querySelectorAll('div.card')


	document.body.append(toast)


	sections.forEach(s => {
		s.addEventListener('click', () => {
			const position = Math.max(s.dataset.start - pre, 0)
			if (audio.readyState != 4) {
				audio.load()
			}
			audio.currentTime = position
		});
	});



	document.addEventListener("htmx:afterSwap", (e) => {
		console.log("after swap")
		sections = document.querySelectorAll('div[data-start]');
		paragraphs = document.querySelectorAll('p[data-start]');
	});

	/**
	 * @param {number} pos
		*/
	const findAndScrollTo = (pos) => {
		const target = Array.from(paragraphs).find(p => {
			const start = Number(p.dataset.start);
			const end = Number(p.dataset.end);
			return pos >= start && pos < end;
		});

		if (target === prevTarget) {
			return
		}
		

		if (target) {
			const parent = target.closest('div.card');
			if (prevParent !== parent) {
				const _classList = ['bg-base-200', 'border-1', 'border-base-300']
				prevParent.classList.remove(..._classList)
				parent.classList.add(..._classList)
				prevParent = parent
			}

			console.log(target === prevTarget)
			target.scrollIntoView({
				behavior: 'smooth',
				block: 'start'

			});

			const _classList = ['text-success', 'font-bold']
			prevTarget.classList.remove(..._classList)
			target.classList.add(..._classList);
			prevTarget = target
		}
	}

});
