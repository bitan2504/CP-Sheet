document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#problem-table tbody");
    const submitBtn = document.getElementById("submit-btn");
    let editingProblemId = null;

    // Load problems from the API
    const problemItemContent = (problem) => {
        return `
        <td>${problem.name}</td>
        <td><a href="${problem.link}" target="_blank">${problem.link}</a></td>
        <td>${problem.tags.join(", ")}</td>
        <td class="action-tab">
            <button class="btn action-btn edit-btn" data-id="${problem._id}"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg></button>
            <button class="btn action-btn delete-btn" data-id="${problem._id}"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </td>
        `
    }

    const loadProblems = async () => {
        try {
            const response = await fetch("/api/v1/problems");
            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to fetch problems");
            }
            const data = await response.json();
            const problems = data.data;

            if (tableBody) {
                tableBody.innerHTML = "";
                problems.forEach(problem => {
                    const newRow = document.createElement("tr");
                    newRow.id = `problem-${problem._id}`;
                    newRow.innerHTML = problemItemContent(problem);
                    tableBody.appendChild(newRow);
                });
                attachActionListeners();
            }
        } catch (error) {
            console.error("Error loading problems:", error);
        }
    };

    loadProblems();

    const attachActionListeners = () => {
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const btnElement = e.target.closest(".delete-btn");
                if (!btnElement) return;
                const id = btnElement.getAttribute("data-id");
                if (confirm("Are you sure you want to delete this problem?")) {
                    try {
                        const response = await fetch(`/api/v1/problems/${id}`, {
                            method: "DELETE"
                        });
                        if (response.ok) {
                            const row = document.getElementById(`problem-${id}`);
                            if (row) row.remove();
                        } else {
                            alert("Failed to delete problem");
                        }
                    } catch (error) {
                        console.error("Error deleting problem:", error);
                    }
                }
            });
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const btnElement = e.target.closest(".edit-btn");
                if (!btnElement) return;
                const id = btnElement.getAttribute("data-id");

                const row = document.getElementById(`problem-${id}`);
                if (row) {
                    const name = row.cells[0].innerText;
                    const link = row.cells[1].innerText;
                    const tags = row.cells[2].innerText;

                    document.getElementById("problem-name").value = name;
                    document.getElementById("problem-link").value = link;
                    document.getElementById("problem-tags").value = tags;

                    editingProblemId = id;
                    if (submitBtn) {
                        submitBtn.innerText = "Update Problem";
                    }

                    document.querySelector(".form-container").scrollIntoView({ behavior: "smooth" });
                }
            });
        });
    };

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

            const tagsArray = tagsValue.split(",").map(t => t.trim()).filter(t => t !== "");

            const newProblem = {
                name: nameValue,
                link: linkValue,
                tags: tagsArray
            };

            try {
                const url = editingProblemId ? `/api/v1/problems/${editingProblemId}` : "/api/v1/problems";
                const method = editingProblemId ? "PUT" : "POST";

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newProblem)
                });

                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    const savedProblem = data.data;

                    if (editingProblemId) {
                        const row = document.getElementById(`problem-${savedProblem._id}`);
                        if (row) {
                            row.cells[0].innerText = savedProblem.name;
                            row.cells[1].innerHTML = `<a href="${savedProblem.link}" target="_blank">${savedProblem.link}</a>`;
                            row.cells[2].innerText = savedProblem.tags.join(", ");
                        }

                        editingProblemId = null;
                        submitBtn.innerText = "Add Problem";
                    } else if (tableBody) {
                        const newRow = document.createElement("tr");
                        newRow.id = `problem-${savedProblem._id}`;
                        newRow.innerHTML = problemItemContent(savedProblem);
                        // Add animation class
                        newRow.style.opacity = "0";
                        newRow.style.transform = "translateY(10px)";
                        newRow.style.transition = "all 0.4s ease-out";

                        // Append new row at the beginning
                        tableBody.insertBefore(newRow, tableBody.firstChild);

                        attachActionListeners();

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
                } else {
                    alert("Failed to save problem");
                }
            } catch (error) {
                console.error("Error saving problem:", error);
                alert("An error occurred while saving the problem.");
            }
        });
    }
});
