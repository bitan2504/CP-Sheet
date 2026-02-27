document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#problem-table tbody");
    const submitBtn = document.getElementById("submit-btn");
    let editingProblemId = null;
    let isLoggedIn = true;
    let allProblems = [];
    const filterFavoritesCheckbox = document.getElementById("filter-favorites");

    // Helper to generate a random ID for local storage items
    const generateId = () => {
        return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    };

    const problemItemContent = (problem) => {
        const starFill = problem.isFavourite ? "gold" : "none";
        const starStroke = problem.isFavourite ? "gold" : "currentColor";
        return `
        <td>${problem.name}</td>
        <td><a href="${problem.link}" target="_blank">${problem.link}</a></td>
        <td>${problem.tags.join(", ")}</td>
        <td class="action-tab">
            <button class="btn action-btn star-btn" data-id="${problem._id}" title="Toggle Favorite"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${starFill}" stroke="${starStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
            <button class="btn action-btn edit-btn" data-id="${problem._id}" title="Edit Problem"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg></button>
            <button class="btn action-btn delete-btn" data-id="${problem._id}" title="Delete Problem"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </td>
        `;
    };

    const renderProblems = (problems) => {
        if (tableBody) {

            //REMOVE skeleton rows
            document.querySelectorAll(".skeleton-row").forEach(el => el.remove());

            tableBody.innerHTML = "";

            problems.forEach(problem => {
                const newRow = document.createElement("tr");
                newRow.id = `problem-${problem._id}`;
                newRow.innerHTML = problemItemContent(problem);
                tableBody.appendChild(newRow);
            });
        }
    };

    const applyFilters = () => {
        if (!tableBody) return;
        const showFavoritesOnly = filterFavoritesCheckbox && filterFavoritesCheckbox.checked;

        // Visual update for the slider text colors
        if (filterFavoritesCheckbox) {
            const labelAll = document.getElementById("label-all");
            const labelFav = document.getElementById("label-fav");
            if (showFavoritesOnly) {
                if (labelAll) labelAll.classList.remove("active");
                if (labelFav) labelFav.classList.add("active");
            } else {
                if (labelAll) labelAll.classList.add("active");
                if (labelFav) labelFav.classList.remove("active");
            }
        }

        const filteredProblems = showFavoritesOnly
            ? allProblems.filter(p => p.isFavourite)
            : allProblems;

        renderProblems(filteredProblems);
    };

    if (filterFavoritesCheckbox) {
        filterFavoritesCheckbox.addEventListener("change", applyFilters);
        // Initial setup
        applyFilters();
    }

    const loadProblemsFromLocalStorage = () => {
        let stored = localStorage.getItem("problems");
        let problems = stored ? JSON.parse(stored) : [];
        let updated = false;

        // Ensure old items have IDs
        problems.forEach(p => {
            if (!p._id) {
                p._id = generateId();
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem("problems", JSON.stringify(problems));
        }

        allProblems = problems;
        applyFilters();
    };

    // Load problems from the API or local storage
    const loadProblems = async () => {
        try {
            const response = await fetch("/api/v1/problems");
            if (response.status === 401) {
                isLoggedIn = false;
                loadProblemsFromLocalStorage();
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to fetch problems");
            }
            const data = await response.json();
            allProblems = data.data;
            applyFilters();
        } catch (error) {
            console.error("Error loading problems, falling back to local storage:", error);
            isLoggedIn = false;
            loadProblemsFromLocalStorage();
        }
    };

    loadProblems();

    // Event delegation for action buttons
    if (tableBody) {
        tableBody.addEventListener("click", async (e) => {
            const deleteBtn = e.target.closest(".delete-btn");
            const editBtn = e.target.closest(".edit-btn");
            const starBtn = e.target.closest(".star-btn");

            if (starBtn) {
                const id = starBtn.getAttribute("data-id");

                if (isLoggedIn) {
                    try {
                        const response = await fetch(`/api/v1/problems/${id}/toggle-favourite`, {
                            method: "PATCH"
                        });
                        if (response.ok) {
                            const data = await response.json();
                            const updatedProblem = data.data;

                            const idx = allProblems.findIndex(p => String(p._id) === String(id));
                            if (idx !== -1) {
                                allProblems[idx].isFavourite = updatedProblem.isFavourite;
                            }
                            applyFilters();
                        } else {
                            alert("Failed to update favorite status");
                        }
                    } catch (error) {
                        console.error("Error toggling favorite:", error);
                    }
                } else {
                    let stored = localStorage.getItem("problems");
                    if (stored) {
                        let problems = JSON.parse(stored);
                        const idx = problems.findIndex(p => String(p._id) === String(id));
                        if (idx !== -1) {
                            problems[idx].isFavourite = !problems[idx].isFavourite;
                            localStorage.setItem("problems", JSON.stringify(problems));

                            const allIdx = allProblems.findIndex(p => String(p._id) === String(id));
                            if (allIdx !== -1) {
                                allProblems[allIdx].isFavourite = problems[idx].isFavourite;
                            }
                            applyFilters();
                        }
                    }
                }
            } else if (deleteBtn) {
                const id = deleteBtn.getAttribute("data-id");

                if (confirm("Are you sure you want to delete this problem?")) {
                    if (isLoggedIn) {
                        try {
                            const response = await fetch(`/api/v1/problems/${id}`, {
                                method: "DELETE"
                            });
                            if (response.ok) {
                                allProblems = allProblems.filter(p => String(p._id) !== String(id));
                                applyFilters();
                            } else {
                                alert("Failed to delete problem");
                            }
                        } catch (error) {
                            console.error("Error deleting problem:", error);
                        }
                    } else {
                        // Local storage delete
                        let stored = localStorage.getItem("problems");
                        if (stored) {
                            let problems = JSON.parse(stored);
                            problems = problems.filter(p => String(p._id) !== String(id));
                            localStorage.setItem("problems", JSON.stringify(problems));

                            allProblems = allProblems.filter(p => String(p._id) !== String(id));
                            applyFilters();
                        }
                    }
                }
            } else if (editBtn) {
                const id = editBtn.getAttribute("data-id");

                const row = document.getElementById(`problem-${id}`);
                if (row) {
                    const name = row.cells[0].innerText;
                    const link = row.querySelector("a").getAttribute("href");
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
            }
        });
    }

    const updateDOMForSave = (savedProblem) => {
        if (editingProblemId) {
            const idx = allProblems.findIndex(p => String(p._id) === String(savedProblem._id));
            if (idx !== -1) {
                allProblems[idx] = savedProblem;
            }
            editingProblemId = null;
            if (submitBtn) submitBtn.innerText = "Add Problem";
            applyFilters();
        } else {
            allProblems.unshift(savedProblem);
            applyFilters();

            if (tableBody && tableBody.firstChild) {
                const newRow = tableBody.firstChild;
                newRow.style.opacity = "0";
                newRow.style.transform = "translateY(10px)";
                newRow.style.transition = "all 0.4s ease-out";
                setTimeout(() => {
                    newRow.style.opacity = "1";
                    newRow.style.transform = "translateY(0)";
                }, 10);
            }
        }

        document.getElementById("problem-link").value = "";
        document.getElementById("problem-name").value = "";
        document.getElementById("problem-tags").value = "";
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

            if (isLoggedIn) {
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
                        isLoggedIn = false;
                        loadProblemsFromLocalStorage();
                        alert("Session expired. Falling back to offline mode.");
                        return;
                    }

                    if (response.ok) {
                        const data = await response.json();
                        const savedProblem = data.data;
                        updateDOMForSave(savedProblem);
                    } else {
                        alert("Failed to save problem");
                    }
                } catch (error) {
                    console.error("Error saving problem:", error);
                    alert("An error occurred while saving the problem.");
                }
            } else {
                // Local storage save logic
                newProblem._id = editingProblemId ? editingProblemId : generateId();

                let stored = localStorage.getItem("problems");
                let problems = stored ? JSON.parse(stored) : [];

                if (editingProblemId) {
                    const idx = problems.findIndex(p => String(p._id) === String(editingProblemId));
                    if (idx !== -1) {
                        problems[idx] = newProblem;
                    } else {
                        problems.unshift(newProblem);
                    }
                } else {
                    problems.unshift(newProblem);
                }

                localStorage.setItem("problems", JSON.stringify(problems));
                updateDOMForSave(newProblem);
            }
        });
    }
});
