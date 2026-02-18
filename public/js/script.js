document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submit-btn");

    if (submitBtn) {
        submitBtn.addEventListener("click", async function (event) {
            event.preventDefault();

            const linkValue = document.getElementById("problem-link").value;
            const nameValue = document.getElementById("problem-name").value;
            const tagsValue = document.getElementById("problem-tags").value;

            if (!linkValue || !nameValue) {
                alert("Please fill in the problem name and link.");
                return;
            }

            const payload = {
                name: nameValue,
                link: linkValue,
                tags: tagsValue
            };

            try {
                const res = await fetch('/add-problem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    // Success! Add to table dynamically instead of reloading
                    const tableBody = document.querySelector("#problem-table tbody");
                    if (tableBody) {
                        const tagsArray = payload.tags.split(",").map(t => t.trim()).filter(t => t !== "");
                        const newRow = document.createElement("tr");
                        newRow.innerHTML = `
                            <td>${payload.name}</td>
                            <td><a href="${payload.link}" target="_blank">${payload.link}</a></td>
                            <td>${tagsArray.join(", ")}</td>
                        `;
                        // Add animation class
                        newRow.style.opacity = "0";
                        newRow.style.transform = "translateY(10px)";
                        newRow.style.transition = "all 0.4s ease-out";

                        tableBody.appendChild(newRow);

                        // Trigger animation
                        setTimeout(() => {
                            newRow.style.opacity = "1";
                            newRow.style.transform = "translateY(0)";
                        }, 10);
                    }

                    // Clear inputs
                    document.getElementById("problem-link").value = "";
                    document.getElementById("problem-name").value = "";
                    document.getElementById("problem-tags").value = "";

                    // Show a subtle success toast if you want, but for now just clear
                } else {
                    alert("Failed to save problem.");
                }
            } catch (err) {
                console.error(err);
                alert("Error saving problem.");
            }
        });
    }
});
