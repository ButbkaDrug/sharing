document.addEventListener("DOMContentLoaded", () => {
	/** @type {HTMLDetailsElement} */
	const themeController = document.getElementById("theme-controller")

	document.addEventListener("click", (e) => {
		if(themeController.hasAttribute("open")) {
			if(!themeController.contains(e.target)) {
				e.preventDefault()
				themeController.removeAttribute("open")
			}
		}
	});
});
