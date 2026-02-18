document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#problem-table tbody");
    const submitBtn = document.getElementById("submit-btn");

    // Load problems from localStorage
    const loadProblems = () => {
        const storedProblems = localStorage.getItem("problems");
        if (storedProblems && tableBody) {
            const problems = JSON.parse(storedProblems);
            problems.forEach(problem => {
                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td>${problem.name}</td>
                    <td><a href="${problem.link}" target="_blank">${problem.link}</a></td>
                    <td>${problem.tags.join(", ")}</td>
                `;
                tableBody.appendChild(newRow);
            });
        }
    };

    loadProblems();

    if (submitBtn) {
        submitBtn.addEventListener("click", function (event) {
            event.preventDefault();

            const linkValue = document.getElementById("problem-link").value;
            const nameValue = document.getElementById("problem-name").value;
            const tagsValue = document.getElementById("problem-tags").value;

            if (!linkValue || !nameValue) {
                alert("Please fill in the problem name and link.");
                return;
            }

            const tagsArray = tagsValue.split(",").map(t => t.trim()).filter(t => t !== "");

            const newProblem = {
                name: nameValue,
                link: linkValue,
                tags: tagsArray
            };

            // Save to LocalStorage
            const storedProblems = localStorage.getItem("problems");
            const problems = storedProblems ? JSON.parse(storedProblems) : [];
            problems.push(newProblem);
            localStorage.setItem("problems", JSON.stringify(problems));

            if (tableBody) {
                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td>${newProblem.name}</td>
                    <td><a href="${newProblem.link}" target="_blank">${newProblem.link}</a></td>
                    <td>${newProblem.tags.join(", ")}</td>
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
        });
    }
});
